import type { Device } from 'react-native-ble-plx';
import { secureWrite, secureRead, secureRemove } from '../utils/secureStorage';
import { logger } from '../utils/logger';
import { bleService } from './BLEService';
import { heartRateService } from './HeartRateService';
import type { HeartRateReading } from './HeartRateService';
import { polarPMDService } from './PolarPMDService';
import type { PMDAccFrame } from './PolarPMDService';
import {
  filterMotionCorruptedReadings,
  type StrapClockOffset,
} from '../utils/SignalQualityCalculator';
import { sessionRepository } from './SessionRepository';
import { summaryComputeService } from './SummaryComputeService';
import { computeHRZone, buildZoneSummary, TRIMPCalculator } from './TRIMPCalculator';
import { useRecordingStore, type LivePhysiology } from '../store/recordingStore';
import { usePhysiologyStore, toUserProfile } from '../store/physiologyStore';
import { getSessionCalories } from '../utils/CalorieCalculator';
import { TrainingType, TrainingSession } from '../types/training';

/**
 * Effective physiology for live zone/TRIMP display and end-of-session TRIMP/
 * calorie computation — same fallbacks used elsewhere (useACWR,
 * TrainingContextService, AnalyticsService.enrichSessionsWithTRIMP).
 */
function getLivePhysiology(): LivePhysiology {
  const physiology = usePhysiologyStore.getState().settings;
  const age = physiology?.ageYears ?? 30;
  return {
    maxHeartRate: physiology?.maxHeartRate ?? 220 - age,
    restingHeartRate: physiology?.restingHeartRate ?? 60,
    gender: physiology?.sex ?? 'male',
  };
}

export interface RecordingSession {
  id: string;
  name: string;
  /** Activity type chosen by user before starting. */
  type: TrainingType;
  startTime: Date;
  endTime?: Date;
  deviceId?: string;
  deviceName?: string;
  status: 'recording' | 'completed' | 'failed';
  duration?: number;
}

class SessionRecordingService {
  private readonly ACTIVE_SESSION_KEY = 'active_recording_session';

  /** HR readings accumulated during the current recording. */
  private hrReadings: HeartRateReading[] = [];
  /** ACC frames accumulated during the current recording (empty if PMD unsupported this session). */
  private accFrames: PMDAccFrame[] = [];
  /** Strap-clock → wall-clock anchor, captured at the first PMD frame received. */
  private strapClockOffset: StrapClockOffset | null = null;
  /** Device the current recording's PMD stream (if any) was started on — needed to stop it cleanly. */
  private pmdDevice: Device | null = null;

  /**
   * Start a new recording session.
   * Optionally wires up live HR monitoring if a BLE device is connected.
   */
  async startRecording(
    sessionName: string,
    type: TrainingType,
    deviceId?: string,
    deviceName?: string,
  ): Promise<RecordingSession> {
    try {
      logger.info('Starting recording session', {
        sessionName,
        type,
        deviceId,
      });

      // Check if there's already an active session
      const existingSession = await this.getActiveSession();
      if (existingSession) {
        throw new Error(
          'A recording session is already active. Please stop the current session first.',
        );
      }

      const session: RecordingSession = {
        id: `session_${Date.now()}`,
        name:
          sessionName.trim() || `Session ${new Date().toLocaleDateString()}`,
        type,
        startTime: new Date(),
        deviceId,
        deviceName,
        status: 'recording',
      };

      // Start live HR monitoring if a BLE device is connected
      this.hrReadings = [];
      this.accFrames = [];
      this.strapClockOffset = null;
      this.pmdDevice = null;
      useRecordingStore.getState().reset();
      if (deviceId) {
        const connectedDevice = bleService.getConnectedDevice();
        if (connectedDevice && connectedDevice.id === deviceId) {
          useRecordingStore
            .getState()
            .startSession(session.startTime, getLivePhysiology());
          try {
            await heartRateService.startMonitoring(connectedDevice, reading => {
              this.hrReadings.push(reading);
              useRecordingStore.getState().recordHeartRate(reading.heartRate);
            });
            logger.info('HR monitoring started for recording', { deviceId });
          } catch (hrErr) {
            // HR monitoring failure is non-fatal — session still records
            logger.warn('Could not start HR monitoring', { hrErr });
          }

          // Motion-quality data is best-effort: unsupported/dry-strap
          // sessions fall back to unfiltered HR-only recording (see
          // SignalQualityCalculator.filterMotionCorruptedReadings).
          try {
            this.pmdDevice = connectedDevice;
            const pmdStarted = await polarPMDService.startAccStreaming(
              connectedDevice,
              frame => {
                if (!this.strapClockOffset) {
                  this.strapClockOffset = {
                    deviceStartNs: frame.timestampNs,
                    wallStartMs: Date.now(),
                  };
                  useRecordingStore.getState().setPmdActive(true);
                }
                this.accFrames.push(frame);
              },
            );
            logger.info('PMD ACC streaming attempt finished', {
              deviceId,
              started: pmdStarted,
            });
          } catch (pmdErr) {
            // PMD failure is non-fatal — HR-only recording still proceeds
            logger.warn('Could not start PMD ACC streaming', { pmdErr });
          }
        }
      }

      // Save session as active
      await secureWrite(this.ACTIVE_SESSION_KEY, session);

      logger.info('Recording session started successfully', {
        sessionId: session.id,
      });
      return session;
    } catch (error) {
      logger.error('Failed to start recording session', { error, sessionName });
      throw error;
    }
  }

  /**
   * Stop the current recording session.
   * Computes HR stats from collected readings and persists to SQLite.
   */
  async stopRecording(): Promise<RecordingSession> {
    try {
      logger.info('Stopping recording session');

      const activeSession = await this.getActiveSession();
      if (!activeSession) {
        throw new Error('No active recording session found');
      }

      // Stop HR monitoring and snapshot collected readings
      heartRateService.stopMonitoring();
      const hrSnapshot = [...this.hrReadings];
      this.hrReadings = [];

      // Stop PMD ACC streaming (no-op if it was never started) and snapshot
      await polarPMDService.stopAccStreaming(this.pmdDevice);
      const accSnapshot = [...this.accFrames];
      const strapClockOffsetSnapshot = this.strapClockOffset;
      this.accFrames = [];
      this.strapClockOffset = null;
      this.pmdDevice = null;
      useRecordingStore.getState().reset();

      // Update session with end time
      const completedSession: RecordingSession = {
        ...activeSession,
        endTime: new Date(),
        status: 'completed',
        duration: Date.now() - new Date(activeSession.startTime).getTime(),
      };

      // Remove from active storage
      await secureRemove(this.ACTIVE_SESSION_KEY);

      // Persist to SQLite with real type and HR data
      await this.addToHistory(
        completedSession,
        hrSnapshot,
        accSnapshot,
        strapClockOffsetSnapshot,
      );

      logger.info('Recording session stopped successfully', {
        sessionId: completedSession.id,
        duration: completedSession.duration,
        hrReadings: hrSnapshot.length,
      });

      return completedSession;
    } catch (error) {
      logger.error('Failed to stop recording session', { error });
      throw error;
    }
  }

  /**
   * Get the currently active recording session
   */
  async getActiveSession(): Promise<RecordingSession | null> {
    try {
      const session = await secureRead<RecordingSession>(
        this.ACTIVE_SESSION_KEY,
      );
      if (!session) return null;

      // Convert date strings back to Date objects
      session.startTime = new Date(session.startTime);
      if (session.endTime) {
        session.endTime = new Date(session.endTime);
      }

      return session;
    } catch (error) {
      logger.error('Failed to get active session', { error });
      return null;
    }
  }

  /**
   * Returns session recording history from SQLite.
   * The old EncryptedStorage key ('sessions_history') was migrated to SQLite
   * on first launch after the SQLite migration update.
   */
  async getSessionHistory(): Promise<RecordingSession[]> {
    try {
      const sessions = await sessionRepository.getAll();
      // Map TrainingSession → RecordingSession for backward-compat consumers
      return sessions.map(s => ({
        id: s.id,
        name: s.title ?? String(s.type),
        type: s.type,
        startTime: s.startTime,
        endTime: s.endTime,
        deviceId: undefined,
        deviceName: undefined,
        status: 'completed' as const,
        duration: s.duration * 1000,
      }));
    } catch (error) {
      logger.error('Failed to get session history', { error });
      return [];
    }
  }

  /**
   * Clear the active session (in case of errors or manual cleanup)
   */
  async clearActiveSession(): Promise<void> {
    try {
      await secureRemove(this.ACTIVE_SESSION_KEY);
      logger.info('Active session cleared');
    } catch (error) {
      logger.error('Failed to clear active session', { error });
    }
  }

  /**
   * Add session to SQLite with real type and HR data, then recompute summaries.
   */
  private async addToHistory(
    session: RecordingSession,
    hrReadings: HeartRateReading[],
    accFrames: PMDAccFrame[] = [],
    strapClockOffset: StrapClockOffset | null = null,
  ): Promise<void> {
    try {
      const { clean: cleanReadings, discardedCount } =
        filterMotionCorruptedReadings(hrReadings, accFrames, strapClockOffset);

      if (discardedCount > 0) {
        logger.info(
          'Excluded motion-corrupted HR readings from session average',
          {
            sessionId: session.id,
            discardedCount,
            totalReadings: hrReadings.length,
          },
        );
      }

      const avgHR =
        cleanReadings.length > 0
          ? Math.round(
              cleanReadings.reduce((sum, r) => sum + r.heartRate, 0) /
                cleanReadings.length,
            )
          : 0;
      const maxHR =
        cleanReadings.length > 0
          ? Math.max(...cleanReadings.map(r => r.heartRate))
          : 0;
      const minHR =
        cleanReadings.length > 0
          ? Math.min(...cleanReadings.map(r => r.heartRate))
          : 0;
      // Zone classification uses physiological max HR, NOT the session's own
      // observed max — otherwise a low-intensity session always looks like
      // it's mostly in the high zones, since everything gets normalized
      // against whatever peak you happened to hit that one session. This is
      // the same basis the live view (recordingStore) already uses.
      const physiology = getLivePhysiology();
      const zoneBasisMaxHR = physiology.maxHeartRate;

      const zoneSummary = buildZoneSummary(
        cleanReadings.map((r, i) => {
          const next = cleanReadings[i + 1];
          const durationSeconds = next
            ? (next.timestamp.getTime() - r.timestamp.getTime()) / 1000
            : 0; // last reading — no next timestamp to bound it
          return {
            heartRate: r.heartRate,
            zone: computeHRZone(r.heartRate, zoneBasisMaxHR),
            durationSeconds,
          };
        }),
      );

      const ts: TrainingSession = {
        id: session.id,
        userId: '',
        date: session.endTime ?? session.startTime,
        startTime: session.startTime,
        endTime: session.endTime ?? session.startTime,
        duration: session.duration ? Math.round(session.duration / 1000) : 0,
        type: session.type,
        title: session.name,
        averageHeartRate: avgHR,
        maxHeartRate: maxHR,
        minHeartRate: minHR,
        heartRateData: cleanReadings.map(r => ({
          timestamp: r.timestamp,
          heartRate: r.heartRate,
          rrInterval: r.rrIntervals[0],
          zone: computeHRZone(r.heartRate, zoneBasisMaxHR),
        })),
        zoneSummary,
      };

      // TRIMP/training load — same computation AnalyticsService.
      // enrichSessionsWithTRIMP() already does for seeded data, now also done
      // at write time for real sessions.
      const trimpMethods = TRIMPCalculator.calculateAllTRIMPMethods(ts, {
        restingHeartRate: physiology.restingHeartRate,
        maxHeartRate: physiology.maxHeartRate,
        gender: physiology.gender,
      });
      ts.trimpScore = trimpMethods.banister;
      ts.trainingLoad = trimpMethods.simplified;

      // Calories — Keytel et al. (2005) HR-based estimate, previously computed
      // only for seeded/dummy data.
      ts.calories = getSessionCalories(
        cleanReadings.map(r => r.heartRate),
        toUserProfile(usePhysiologyStore.getState().settings),
      );

      await sessionRepository.insert(ts, false);
      await summaryComputeService.recomputeForSession(ts);
    } catch (error) {
      logger.error('Failed to add session to history', { error });
    }
  }

  /**
   * Format duration for display
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

export const sessionRecordingService = new SessionRecordingService();

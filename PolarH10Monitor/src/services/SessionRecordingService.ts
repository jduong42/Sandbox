import { secureWrite, secureRead, secureRemove } from '../utils/secureStorage';
import { logger } from '../utils/logger';
import { bleService } from './BLEService';
import { heartRateService } from './HeartRateService';
import type { HeartRateReading } from './HeartRateService';
import { sessionRepository } from './SessionRepository';
import { summaryComputeService } from './SummaryComputeService';
import {
  TrainingType,
  TrainingSession,
  HeartRateZone,
} from '../types/training';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeHRZone(hr: number, maxHR: number): HeartRateZone {
  const pct = hr / maxHR;
  if (pct < 0.6) return HeartRateZone.ZONE_1;
  if (pct < 0.7) return HeartRateZone.ZONE_2;
  if (pct < 0.8) return HeartRateZone.ZONE_3;
  if (pct < 0.9) return HeartRateZone.ZONE_4;
  return HeartRateZone.ZONE_5;
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
      if (deviceId) {
        const connectedDevice = bleService.getConnectedDevice();
        if (connectedDevice && connectedDevice.id === deviceId) {
          try {
            await heartRateService.startMonitoring(connectedDevice, reading => {
              this.hrReadings.push(reading);
            });
            logger.info('HR monitoring started for recording', { deviceId });
          } catch (hrErr) {
            // HR monitoring failure is non-fatal — session still records
            logger.warn('Could not start HR monitoring', { hrErr });
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
      await this.addToHistory(completedSession, hrSnapshot);

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
  ): Promise<void> {
    try {
      const avgHR =
        hrReadings.length > 0
          ? Math.round(
              hrReadings.reduce((sum, r) => sum + r.heartRate, 0) /
                hrReadings.length,
            )
          : 0;
      const maxHR =
        hrReadings.length > 0
          ? Math.max(...hrReadings.map(r => r.heartRate))
          : 0;
      const minHR =
        hrReadings.length > 0
          ? Math.min(...hrReadings.map(r => r.heartRate))
          : 0;

      const ts: TrainingSession = {
        id: session.id,
        userId: '',
        date: session.endTime ?? session.startTime,
        startTime: session.startTime,
        endTime: session.endTime ?? session.startTime,
        duration: session.duration ? Math.round(session.duration / 1000) : 0,
        type: session.type,
        averageHeartRate: avgHR,
        maxHeartRate: maxHR,
        minHeartRate: minHR,
        heartRateData: hrReadings.map(r => ({
          timestamp: r.timestamp,
          heartRate: r.heartRate,
          rrInterval: r.rrIntervals[0],
          zone: computeHRZone(r.heartRate, maxHR || 190),
        })),
        zoneSummary: [],
      };
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

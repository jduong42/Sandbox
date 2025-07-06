import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import { bleService } from './BLEService';

export interface RecordingSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  deviceId: string;
  deviceName: string;
  status: 'recording' | 'completed' | 'failed';
  duration?: number;
}

class SessionRecordingService {
  private readonly ACTIVE_SESSION_KEY = 'active_recording_session';
  private readonly SESSIONS_HISTORY_KEY = 'sessions_history';

  /**
   * Start a new recording session
   */
  async startRecording(
    sessionName: string,
    deviceId: string,
    deviceName: string,
  ): Promise<RecordingSession> {
    try {
      logger.info('Starting recording session', { sessionName, deviceId });

      // Check if there's already an active session
      const existingSession = await this.getActiveSession();
      if (existingSession) {
        throw new Error(
          'A recording session is already active. Please stop the current session first.',
        );
      }

      // Create session object
      const session: RecordingSession = {
        id: `session_${Date.now()}`,
        name:
          sessionName.trim() || `Session ${new Date().toLocaleDateString()}`,
        startTime: new Date(),
        deviceId,
        deviceName,
        status: 'recording',
      };

      // TODO: Send recording start command to Polar H10
      // For now, we'll simulate this - replace with actual BLE command
      // await bleService.startInternalRecording();

      // Save session as active
      await AsyncStorage.setItem(
        this.ACTIVE_SESSION_KEY,
        JSON.stringify(session),
      );

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
   * Stop the current recording session
   */
  async stopRecording(): Promise<RecordingSession> {
    try {
      logger.info('Stopping recording session');

      const activeSession = await this.getActiveSession();
      if (!activeSession) {
        throw new Error('No active recording session found');
      }

      // TODO: Send recording stop command to Polar H10
      // await bleService.stopInternalRecording();

      // Update session with end time
      const completedSession: RecordingSession = {
        ...activeSession,
        endTime: new Date(),
        status: 'completed',
        duration: Date.now() - new Date(activeSession.startTime).getTime(),
      };

      // Remove from active sessions
      await AsyncStorage.removeItem(this.ACTIVE_SESSION_KEY);

      // Add to session history
      await this.addToHistory(completedSession);

      logger.info('Recording session stopped successfully', {
        sessionId: completedSession.id,
        duration: completedSession.duration,
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
      const sessionData = await AsyncStorage.getItem(this.ACTIVE_SESSION_KEY);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
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
   * Get session history
   */
  async getSessionHistory(): Promise<RecordingSession[]> {
    try {
      const historyData = await AsyncStorage.getItem(this.SESSIONS_HISTORY_KEY);
      if (!historyData) return [];

      const sessions = JSON.parse(historyData);
      // Convert date strings back to Date objects
      return sessions.map((session: RecordingSession) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
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
      await AsyncStorage.removeItem(this.ACTIVE_SESSION_KEY);
      logger.info('Active session cleared');
    } catch (error) {
      logger.error('Failed to clear active session', { error });
    }
  }

  /**
   * Add session to history
   */
  private async addToHistory(session: RecordingSession): Promise<void> {
    try {
      const existingHistory = await this.getSessionHistory();
      const updatedHistory = [session, ...existingHistory];

      // Keep only last 50 sessions to avoid storage bloat
      const limitedHistory = updatedHistory.slice(0, 50);

      await AsyncStorage.setItem(
        this.SESSIONS_HISTORY_KEY,
        JSON.stringify(limitedHistory),
      );
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

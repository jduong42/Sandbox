import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionRecordingService, RecordingSession } from '../src/services/SessionRecordingService';
import { logger } from '../src/utils/logger';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('SessionRecordingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear AsyncStorage before each test
    mockAsyncStorage.clear();
  });

  describe('startRecording', () => {
    it('should create and store a new recording session', async () => {
      const sessionName = 'Test Session';
      const deviceId = 'device123';
      const deviceName = 'Polar H10';

      // Mock AsyncStorage.getItem to return null (no active session)
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      const session = await sessionRecordingService.startRecording(
        sessionName,
        deviceId,
        deviceName
      );

      expect(session).toMatchObject({
        name: sessionName,
        deviceId,
        deviceName,
        status: 'recording',
      });
      expect(session.id).toMatch(/^session_\d+$/);
      expect(session.startTime).toBeInstanceOf(Date);

      // Check that session was stored in AsyncStorage
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'active_recording_session',
        JSON.stringify(session)
      );
    });

    it('should throw error if active session already exists', async () => {
      const existingSession: RecordingSession = {
        id: 'session_123',
        name: 'Existing Session',
        startTime: new Date(),
        deviceId: 'device123',
        deviceName: 'Polar H10',
        status: 'recording',
      };

      // Mock AsyncStorage to return existing session
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingSession));

      await expect(
        sessionRecordingService.startRecording('New Session', 'device456', 'Device 2')
      ).rejects.toThrow('A recording session is already active');
    });

    it('should use fallback name if session name is empty', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      const session = await sessionRecordingService.startRecording(
        '   ', // Empty/whitespace name
        'device123',
        'Polar H10'
      );

      expect(session.name).toMatch(/^Session \d+\/\d+\/\d+$/);
    });
  });

  describe('stopRecording', () => {
    it('should stop active recording and move to history', async () => {
      const activeSession: RecordingSession = {
        id: 'session_123',
        name: 'Test Session',
        startTime: new Date(Date.now() - 60000), // 1 minute ago
        deviceId: 'device123',
        deviceName: 'Polar H10',
        status: 'recording',
      };

      // Mock getting active session
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(activeSession)) // getActiveSession call
        .mockResolvedValueOnce('[]'); // getSessionHistory call

      mockAsyncStorage.removeItem.mockResolvedValue();
      mockAsyncStorage.setItem.mockResolvedValue();

      const completedSession = await sessionRecordingService.stopRecording();

      expect(completedSession).toMatchObject({
        ...activeSession,
        status: 'completed',
      });
      expect(completedSession.endTime).toBeInstanceOf(Date);
      expect(completedSession.duration).toBeGreaterThan(0);

      // Check that active session was removed
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('active_recording_session');

      // Check that session was added to history
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'sessions_history',
        expect.stringContaining('"status":"completed"')
      );
    });

    it('should throw error if no active session exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await expect(sessionRecordingService.stopRecording()).rejects.toThrow(
        'No active recording session found'
      );
    });
  });

  describe('getActiveSession', () => {
    it('should return null if no active session', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const session = await sessionRecordingService.getActiveSession();

      expect(session).toBeNull();
    });

    it('should return parsed session with Date objects', async () => {
      const sessionData = {
        id: 'session_123',
        name: 'Test Session',
        startTime: new Date().toISOString(),
        deviceId: 'device123',
        deviceName: 'Polar H10',
        status: 'recording' as const,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(sessionData));

      const session = await sessionRecordingService.getActiveSession();

      expect(session).toBeTruthy();
      expect(session!.startTime).toBeInstanceOf(Date);
      expect(session!.name).toBe('Test Session');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const session = await sessionRecordingService.getActiveSession();

      expect(session).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get active session',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe('getSessionHistory', () => {
    it('should return empty array if no history', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const history = await sessionRecordingService.getSessionHistory();

      expect(history).toEqual([]);
    });

    it('should return parsed sessions with Date objects', async () => {
      const historyData = [
        {
          id: 'session_1',
          name: 'Session 1',
          startTime: new Date('2025-01-01').toISOString(),
          endTime: new Date('2025-01-01T01:00:00').toISOString(),
          deviceId: 'device123',
          deviceName: 'Polar H10',
          status: 'completed' as const,
          duration: 3600000,
        },
        {
          id: 'session_2',
          name: 'Session 2',
          startTime: new Date('2025-01-02').toISOString(),
          deviceId: 'device123',
          deviceName: 'Polar H10',
          status: 'recording' as const,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(historyData));

      const history = await sessionRecordingService.getSessionHistory();

      expect(history).toHaveLength(2);
      expect(history[0].startTime).toBeInstanceOf(Date);
      expect(history[0].endTime).toBeInstanceOf(Date);
      expect(history[1].startTime).toBeInstanceOf(Date);
      expect(history[1].endTime).toBeUndefined();
    });
  });

  describe('clearActiveSession', () => {
    it('should remove active session from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await sessionRecordingService.clearActiveSession();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('active_recording_session');
      expect(logger.info).toHaveBeenCalledWith('Active session cleared');
    });

    it('should handle errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await sessionRecordingService.clearActiveSession();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clear active session',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(sessionRecordingService.formatDuration(0)).toBe('0s');
      expect(sessionRecordingService.formatDuration(30000)).toBe('30s');
      expect(sessionRecordingService.formatDuration(90000)).toBe('1m 30s');
      expect(sessionRecordingService.formatDuration(3661000)).toBe('1h 1m 1s');
      expect(sessionRecordingService.formatDuration(7322000)).toBe('2h 2m 2s');
    });
  });
});

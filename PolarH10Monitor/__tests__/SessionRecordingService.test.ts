import {
  sessionRecordingService,
  RecordingSession,
} from '../src/services/SessionRecordingService';
import { logger } from '../src/utils/logger';

// Mock secureStorage so tests don't need native EncryptedStorage
jest.mock('../src/utils/secureStorage', () => ({
  secureRead: jest.fn(),
  secureWrite: jest.fn(() => Promise.resolve()),
  secureRemove: jest.fn(() => Promise.resolve()),
  SECURE_STORAGE_KEYS: [
    'sessions_history',
    'seeded_training_sessions',
    'active_recording_session',
    '@device_history',
  ],
}));

import {
  secureRead,
  secureWrite,
  secureRemove,
} from '../src/utils/secureStorage';

const mockSecureRead = secureRead as jest.MockedFunction<typeof secureRead>;
const mockSecureWrite = secureWrite as jest.MockedFunction<typeof secureWrite>;
const mockSecureRemove = secureRemove as jest.MockedFunction<
  typeof secureRemove
>;

describe('SessionRecordingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startRecording', () => {
    it('should create and store a new recording session', async () => {
      const sessionName = 'Test Session';
      const deviceId = 'device123';
      const deviceName = 'Polar H10';

      mockSecureRead.mockResolvedValue(null); // no active session
      mockSecureWrite.mockResolvedValue();

      const session = await sessionRecordingService.startRecording(
        sessionName,
        deviceId,
        deviceName,
      );

      expect(session).toMatchObject({
        name: sessionName,
        deviceId,
        deviceName,
        status: 'recording',
      });
      expect(session.id).toMatch(/^session_\d+$/);
      expect(session.startTime).toBeInstanceOf(Date);

      expect(mockSecureWrite).toHaveBeenCalledWith(
        'active_recording_session',
        expect.objectContaining({ name: sessionName }),
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

      mockSecureRead.mockResolvedValue(existingSession as any);

      await expect(
        sessionRecordingService.startRecording(
          'New Session',
          'device456',
          'Device 2',
        ),
      ).rejects.toThrow('A recording session is already active');
    });

    it('should use fallback name if session name is empty', async () => {
      mockSecureRead.mockResolvedValue(null);
      mockSecureWrite.mockResolvedValue();

      const session = await sessionRecordingService.startRecording(
        '   ', // Empty/whitespace name
        'device123',
        'Polar H10',
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

      mockSecureRead
        .mockResolvedValueOnce(activeSession as any) // getActiveSession
        .mockResolvedValueOnce([] as any); // getSessionHistory

      mockSecureRemove.mockResolvedValue();
      mockSecureWrite.mockResolvedValue();

      const completedSession = await sessionRecordingService.stopRecording();

      expect(completedSession).toMatchObject({
        id: activeSession.id,
        status: 'completed',
      });
      expect(completedSession.endTime).toBeInstanceOf(Date);
      expect(completedSession.duration).toBeGreaterThan(0);

      expect(mockSecureRemove).toHaveBeenCalledWith('active_recording_session');
      expect(mockSecureWrite).toHaveBeenCalledWith(
        'sessions_history',
        expect.arrayContaining([
          expect.objectContaining({ status: 'completed' }),
        ]),
      );
    });

    it('should throw error if no active session exists', async () => {
      mockSecureRead.mockResolvedValue(null);

      await expect(sessionRecordingService.stopRecording()).rejects.toThrow(
        'No active recording session found',
      );
    });
  });

  describe('getActiveSession', () => {
    it('should return null if no active session', async () => {
      mockSecureRead.mockResolvedValue(null);

      const session = await sessionRecordingService.getActiveSession();

      expect(session).toBeNull();
    });

    it('should return parsed session with Date objects', async () => {
      const sessionData: RecordingSession = {
        id: 'session_123',
        name: 'Test Session',
        startTime: new Date(),
        deviceId: 'device123',
        deviceName: 'Polar H10',
        status: 'recording',
      };

      mockSecureRead.mockResolvedValue(sessionData as any);

      const session = await sessionRecordingService.getActiveSession();

      expect(session).toBeTruthy();
      expect(session!.name).toBe('Test Session');
    });

    it('should handle storage errors gracefully', async () => {
      mockSecureRead.mockRejectedValue(new Error('Storage error'));

      const session = await sessionRecordingService.getActiveSession();

      expect(session).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get active session',
        expect.objectContaining({ error: expect.any(Error) }),
      );
    });
  });

  describe('getSessionHistory', () => {
    it('should return empty array if no history', async () => {
      mockSecureRead.mockResolvedValue(null);

      const history = await sessionRecordingService.getSessionHistory();

      expect(history).toEqual([]);
    });

    it('should return sessions from storage', async () => {
      const historyData: RecordingSession[] = [
        {
          id: 'session_1',
          name: 'Session 1',
          startTime: new Date('2025-01-01'),
          endTime: new Date('2025-01-01T01:00:00'),
          deviceId: 'device123',
          deviceName: 'Polar H10',
          status: 'completed',
          duration: 3600000,
        },
        {
          id: 'session_2',
          name: 'Session 2',
          startTime: new Date('2025-01-02'),
          deviceId: 'device123',
          deviceName: 'Polar H10',
          status: 'recording',
        },
      ];

      mockSecureRead.mockResolvedValue(historyData as any);

      const history = await sessionRecordingService.getSessionHistory();

      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('session_1');
      expect(history[1].id).toBe('session_2');
    });
  });

  describe('clearActiveSession', () => {
    it('should remove active session from storage', async () => {
      mockSecureRemove.mockResolvedValue();

      await sessionRecordingService.clearActiveSession();

      expect(mockSecureRemove).toHaveBeenCalledWith('active_recording_session');
      expect(logger.info).toHaveBeenCalledWith('Active session cleared');
    });

    it('should handle errors gracefully', async () => {
      mockSecureRemove.mockRejectedValue(new Error('Storage error'));

      await sessionRecordingService.clearActiveSession();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clear active session',
        expect.objectContaining({ error: expect.any(Error) }),
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

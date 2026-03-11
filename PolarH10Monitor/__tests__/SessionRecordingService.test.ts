import {
  sessionRecordingService,
  RecordingSession,
} from '../src/services/SessionRecordingService';
import { TrainingType } from '../src/types/training';
import { logger } from '../src/utils/logger';

// Mock secureStorage so tests don't need native EncryptedStorage
jest.mock('../src/utils/secureStorage', () => ({
  secureRead: jest.fn(),
  secureWrite: jest.fn(() => Promise.resolve()),
  secureRemove: jest.fn(() => Promise.resolve()),
  SECURE_STORAGE_KEYS: ['active_recording_session', '@device_history'],
}));

// Mock SessionRepository so tests don't need SQLite
jest.mock('../src/services/SessionRepository', () => ({
  sessionRepository: {
    insert: jest.fn(() => Promise.resolve()),
    upsertBatch: jest.fn(() => Promise.resolve()),
    getAll: jest.fn(() => Promise.resolve([])),
    getRecent: jest.fn(() => Promise.resolve([])),
    getByDateRange: jest.fn(() => Promise.resolve([])),
    deleteSeeded: jest.fn(() => Promise.resolve()),
    deleteAll: jest.fn(() => Promise.resolve()),
    count: jest.fn(() => Promise.resolve(0)),
  },
}));

// Mock SummaryComputeService so tests don't need SQLite
jest.mock('../src/services/SummaryComputeService', () => ({
  summaryComputeService: {
    recomputeForSession: jest.fn(() => Promise.resolve()),
    getWeeklySummaryText: jest.fn(() => Promise.resolve(null)),
    getMonthlySummaryText: jest.fn(() => Promise.resolve(null)),
  },
  computeWeekKey: jest.fn(() => '2026-W10'),
  computeMonthKey: jest.fn(() => '2026-03'),
}));

import {
  secureRead,
  secureWrite,
  secureRemove,
} from '../src/utils/secureStorage';
import { sessionRepository } from '../src/services/SessionRepository';

const mockSecureRead = secureRead as jest.MockedFunction<typeof secureRead>;
const mockSecureWrite = secureWrite as jest.MockedFunction<typeof secureWrite>;
const mockSecureRemove = secureRemove as jest.MockedFunction<
  typeof secureRemove
>;
const mockInsert = sessionRepository.insert as jest.Mock;

describe('SessionRecordingService', () => {
  beforeEach(() => {
    // resetAllMocks also flushes mockResolvedValueOnce queues, preventing
    // unconsumed mock values from leaking between tests.
    jest.resetAllMocks();
    // Re-apply default implementations after reset
    mockSecureWrite.mockResolvedValue(undefined);
    mockSecureRemove.mockResolvedValue(undefined);
    mockInsert.mockResolvedValue(undefined);
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
        TrainingType.RUNNING,
        deviceId,
        deviceName,
      );

      expect(session).toMatchObject({
        name: sessionName,
        type: TrainingType.RUNNING,
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
        type: TrainingType.RUNNING,
        startTime: new Date(),
        deviceId: 'device123',
        deviceName: 'Polar H10',
        status: 'recording',
      };

      mockSecureRead.mockResolvedValue(existingSession as any);

      await expect(
        sessionRecordingService.startRecording(
          'New Session',
          TrainingType.CYCLING,
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
        TrainingType.RUNNING,
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
        type: TrainingType.RUNNING,
        startTime: new Date(Date.now() - 60000), // 1 minute ago
        deviceId: 'device123',
        deviceName: 'Polar H10',
        status: 'recording',
      };

      mockSecureRead.mockResolvedValueOnce(activeSession as any); // getActiveSession

      mockSecureRemove.mockResolvedValue(undefined);
      mockSecureWrite.mockResolvedValue(undefined);

      const completedSession = await sessionRecordingService.stopRecording();

      expect(completedSession).toMatchObject({
        id: activeSession.id,
        status: 'completed',
      });
      expect(completedSession.endTime).toBeInstanceOf(Date);
      expect(completedSession.duration).toBeGreaterThan(0);

      expect(mockSecureRemove).toHaveBeenCalledWith('active_recording_session');
      // Session is now persisted via sessionRepository.insert(), not secureWrite
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ id: activeSession.id }),
        false,
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
        type: TrainingType.RUNNING,
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
      (sessionRepository.getAll as jest.Mock).mockResolvedValue([]);

      const history = await sessionRecordingService.getSessionHistory();

      expect(history).toEqual([]);
    });

    it('should return sessions from SQLite via sessionRepository', async () => {
      const historyData = [
        {
          id: 'session_1',
          title: 'Session 1',
          type: 'running',
          date: new Date('2025-01-01'),
          duration: 3600,
          averageHeartRate: 150,
        },
        {
          id: 'session_2',
          title: 'Session 2',
          type: 'cycling',
          date: new Date('2025-01-02'),
          duration: 2400,
          averageHeartRate: 140,
        },
      ];

      (sessionRepository.getAll as jest.Mock).mockResolvedValue(historyData);

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

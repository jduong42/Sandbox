/**
 * Tests the reconnect orchestration added to SessionRecordingService:
 * unexpected disconnect -> notify -> retry on an interval -> reconnect ->
 * resume monitoring (without resetting the in-progress session) -> notify.
 *
 * BLEService/HeartRateService/PolarPMDService/notifications are all mocked
 * here — this tests SessionRecordingService's own orchestration logic, not
 * BLE plumbing (already validated against real hardware this session).
 */

const mockSecureStore = new Map<string, unknown>();
jest.mock('../src/utils/secureStorage', () => ({
  secureRead: jest.fn((key: string) => Promise.resolve(mockSecureStore.get(key) ?? null)),
  secureWrite: jest.fn((key: string, value: unknown) => {
    mockSecureStore.set(key, value);
    return Promise.resolve();
  }),
  secureRemove: jest.fn((key: string) => {
    mockSecureStore.delete(key);
    return Promise.resolve();
  }),
  SECURE_STORAGE_KEYS: ['active_recording_session'],
}));

jest.mock('../src/services/SessionRepository', () => ({
  sessionRepository: { insert: jest.fn(() => Promise.resolve()) },
}));

jest.mock('../src/services/SummaryComputeService', () => ({
  summaryComputeService: { recomputeForSession: jest.fn(() => Promise.resolve()) },
  computeWeekKey: jest.fn(() => '2026-W28'),
  computeMonthKey: jest.fn(() => '2026-07'),
}));

jest.mock('../src/utils/notifications', () => ({
  requestNotificationPermission: jest.fn(() => Promise.resolve(true)),
  notifyDisconnected: jest.fn(() => Promise.resolve()),
  notifyReconnected: jest.fn(() => Promise.resolve()),
}));

let hrCallback: ((reading: any) => void) | null = null;
jest.mock('../src/services/HeartRateService', () => ({
  heartRateService: {
    startMonitoring: jest.fn((_device: unknown, callback: (reading: any) => void) => {
      hrCallback = callback;
      return Promise.resolve();
    }),
    stopMonitoring: jest.fn(),
  },
}));

jest.mock('../src/services/PolarPMDService', () => ({
  polarPMDService: {
    startAccStreaming: jest.fn(() => Promise.resolve(false)),
    stopAccStreaming: jest.fn(() => Promise.resolve()),
  },
}));

let capturedDisconnectCallback: ((deviceId: string, deviceName: string) => void) | null = null;
const mockConnectToDevice = jest.fn();
jest.mock('../src/services/BLEService', () => ({
  bleService: {
    getConnectedDevice: jest.fn(() => ({ id: 'device123', name: 'Polar H10' })),
    connectToDevice: (...args: unknown[]) => mockConnectToDevice(...args),
    setOnDisconnectedCallback: jest.fn((cb: (deviceId: string, deviceName: string) => void) => {
      capturedDisconnectCallback = cb;
    }),
    clearOnDisconnectedCallback: jest.fn(() => {
      capturedDisconnectCallback = null;
    }),
  },
}));

import { sessionRecordingService } from '../src/services/SessionRecordingService';
import { sessionRepository } from '../src/services/SessionRepository';
import { heartRateService } from '../src/services/HeartRateService';
import { useRecordingStore } from '../src/store/recordingStore';
import { notifyDisconnected, notifyReconnected } from '../src/utils/notifications';
import { CONNECTION_SETTINGS } from '../src/constants/ble';
import { TrainingType } from '../src/types/training';

const mockInsert = sessionRepository.insert as jest.Mock;
const mockStartMonitoring = heartRateService.startMonitoring as jest.Mock;

function emitHr(heartRate: number) {
  hrCallback?.({
    heartRate,
    timestamp: new Date(),
    rrIntervals: [],
    deviceId: 'device123',
  });
}

describe('SessionRecordingService reconnect handling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1_000_000);
    mockSecureStore.clear();
    mockInsert.mockClear();
    mockStartMonitoring.mockClear();
    mockConnectToDevice.mockReset();
    capturedDisconnectCallback = null;
    hrCallback = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('registers a disconnect callback and reconnects after retries, without resetting the session', async () => {
    await sessionRecordingService.startRecording(
      'Floorball',
      TrainingType.HIIT,
      'device123',
      'Polar H10',
    );

    expect(capturedDisconnectCallback).not.toBeNull();

    // One reading collected before the disconnect.
    emitHr(140);
    expect(useRecordingStore.getState().currentHeartRate).toBe(140);

    // Simulate an unexpected disconnect (BLEService only ever calls this for
    // out-of-range disconnects, never a manual disconnectDevice()).
    capturedDisconnectCallback!('device123', 'Polar H10');

    expect(useRecordingStore.getState().connectionState).toBe('reconnecting');
    expect(notifyDisconnected).toHaveBeenCalledWith('Polar H10');

    // First retry attempt fails, second succeeds.
    mockConnectToDevice
      .mockRejectedValueOnce(new Error('still out of range'))
      .mockResolvedValueOnce({ id: 'device123', name: 'Polar H10' });

    // Tick 1: fails.
    await jest.advanceTimersByTimeAsync(CONNECTION_SETTINGS.RECONNECT_RETRY_INTERVAL_MS);
    expect(mockConnectToDevice).toHaveBeenCalledTimes(1);
    expect(useRecordingStore.getState().connectionState).toBe('reconnecting');

    // Tick 2: succeeds -> resumeMonitoring runs again.
    await jest.advanceTimersByTimeAsync(CONNECTION_SETTINGS.RECONNECT_RETRY_INTERVAL_MS);
    expect(mockConnectToDevice).toHaveBeenCalledTimes(2);
    expect(useRecordingStore.getState().connectionState).toBe('connected');
    expect(notifyReconnected).toHaveBeenCalledWith('Polar H10');
    expect(mockStartMonitoring).toHaveBeenCalledTimes(2); // initial + resume

    // A second reading collected after reconnecting.
    emitHr(150);

    await sessionRecordingService.stopRecording();

    // Both readings made it into the persisted session — proving the
    // reconnect resumed the same session rather than losing/restarting it.
    const [persisted] = mockInsert.mock.calls[0];
    expect(persisted.heartRateData).toHaveLength(2);
    expect(persisted.heartRateData.map((d: any) => d.heartRate)).toEqual([140, 150]);
  });

  it('stops retrying once the recording is stopped', async () => {
    await sessionRecordingService.startRecording(
      'Floorball',
      TrainingType.HIIT,
      'device123',
      'Polar H10',
    );
    capturedDisconnectCallback!('device123', 'Polar H10');

    mockConnectToDevice.mockRejectedValue(new Error('still out of range'));
    await sessionRecordingService.stopRecording();

    const callsAtStop = mockConnectToDevice.mock.calls.length;
    await jest.advanceTimersByTimeAsync(CONNECTION_SETTINGS.RECONNECT_RETRY_INTERVAL_MS * 3);

    // No further reconnect attempts after stopRecording() cancelled the loop.
    expect(mockConnectToDevice.mock.calls.length).toBe(callsAtStop);
  });
});

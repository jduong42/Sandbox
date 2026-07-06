/**
 * PMDRecordingPipeline.integration.test.ts
 *
 * Exercises the full recording pipeline together — BLE notification →
 * HeartRateService / PolarPMDService decode → SessionRecordingService
 * accumulation → SignalQualityCalculator motion filtering → persisted
 * TrainingSession — using a fake BLE `Device` that mimics real notification
 * timing/shape. The unit tests for each piece (PMDFrameParser.test.ts,
 * SignalQualityCalculator.test.ts) already prove each stage works alone;
 * this proves they're wired together correctly, which is exactly the class
 * of bug the FigmaStartSessionScreen deviceId regression was (each piece
 * fine in isolation, silently disconnected in practice).
 */

import { sessionRecordingService } from '../src/services/SessionRecordingService';
import { bleService } from '../src/services/BLEService';
import { TrainingType } from '../src/types/training';
import {
  PMD_SERVICE,
  PMD_CHARACTERISTICS,
} from '../src/constants/ble';
import {
  HEART_RATE_SERVICE,
  HEART_RATE_MEASUREMENT,
} from '../src/services/HeartRateService';

// In-memory fake so getActiveSession() sees whatever startRecording() wrote —
// a fixed-null mock would make every stopRecording() call fail immediately.
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
  SECURE_STORAGE_KEYS: ['active_recording_session', '@device_history'],
}));

jest.mock('../src/services/SessionRepository', () => ({
  sessionRepository: {
    insert: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../src/services/SummaryComputeService', () => ({
  summaryComputeService: {
    recomputeForSession: jest.fn(() => Promise.resolve()),
  },
  computeWeekKey: jest.fn(() => '2026-W10'),
  computeMonthKey: jest.fn(() => '2026-03'),
}));

import { sessionRepository } from '../src/services/SessionRepository';
const mockInsert = sessionRepository.insert as jest.Mock;

// ─── Fake BLE Device ───────────────────────────────────────────────────────────

type NotifyListener = (
  error: unknown,
  characteristic: { value: string; deviceID: string } | null,
) => void;

function base64(bytes: number[]): string {
  return Buffer.from(bytes).toString('base64');
}

function buildHrNotification(bpm: number): string {
  // flags=0x00 -> 8-bit HR format, no RR intervals, no sensor-contact flags
  return base64([0x00, bpm]);
}

function buildRawAccNotification(
  timestampNs: bigint,
  sample: [number, number, number],
): string {
  const bytes = new Uint8Array(16);
  bytes[0] = 0x02; // ACC
  for (let i = 0; i < 8; i++) {
    bytes[1 + i] = Number((timestampNs >> BigInt(8 * i)) & 0xffn);
  }
  bytes[9] = 0x00; // raw (uncompressed)
  const view = new DataView(bytes.buffer);
  view.setInt16(10, sample[0], true);
  view.setInt16(12, sample[1], true);
  view.setInt16(14, sample[2], true);
  return base64(Array.from(bytes));
}

function createFakeDevice(deviceId: string) {
  const listeners: Record<string, NotifyListener> = {};

  return {
    id: deviceId,
    name: 'Polar H10 Test',
    discoverAllServicesAndCharacteristics: jest.fn(() => Promise.resolve()),
    services: jest.fn(() =>
      Promise.resolve([{ uuid: PMD_SERVICE } as any]),
    ),
    monitorCharacteristicForService: jest.fn(
      (serviceUUID: string, characteristicUUID: string, listener: NotifyListener) => {
        listeners[characteristicUUID] = listener;
        return { remove: jest.fn() };
      },
    ),
    writeCharacteristicWithResponseForService: jest.fn(
      (_serviceUUID: string, _characteristicUUID: string, valueBase64: string) => {
        const bytes = Buffer.from(valueBase64, 'base64');
        const opCode = bytes[0];
        const measurementType = bytes[1];
        const ack = base64([0xf0, opCode, measurementType, 0]); // success
        // Resolve on a microtask, like a real characteristic write would
        // settle asynchronously before the ack notification arrives.
        Promise.resolve().then(() => {
          listeners[PMD_CHARACTERISTICS.CONTROL]?.(null, {
            value: ack,
            deviceID: deviceId,
          });
        });
        return Promise.resolve({} as any);
      },
    ),
    emitHr(bpm: number) {
      listeners[HEART_RATE_MEASUREMENT]?.(null, {
        value: buildHrNotification(bpm),
        deviceID: deviceId,
      });
    },
    emitAcc(timestampNs: bigint, sample: [number, number, number]) {
      listeners[PMD_CHARACTERISTICS.DATA]?.(null, {
        value: buildRawAccNotification(timestampNs, sample),
        deviceID: deviceId,
      });
    },
  };
}

describe('Recording pipeline integration (fake BLE device, synthetic data)', () => {
  const DEVICE_ID = 'device123';
  let fakeDevice: ReturnType<typeof createFakeDevice>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1_000_000);
    mockSecureStore.clear();
    mockInsert.mockClear();
    fakeDevice = createFakeDevice(DEVICE_ID);
    jest.spyOn(bleService, 'getConnectedDevice').mockReturnValue(
      fakeDevice as any,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('persists live HR data end-to-end when a session records normally', async () => {
    await sessionRecordingService.startRecording(
      'Integration Test',
      TrainingType.RUNNING,
      DEVICE_ID,
      'Polar H10',
    );

    // Sanity check: HR monitoring actually subscribed (regression guard for
    // the deviceId-not-threaded class of bug — this used to silently no-op).
    expect(fakeDevice.monitorCharacteristicForService).toHaveBeenCalledWith(
      HEART_RATE_SERVICE,
      HEART_RATE_MEASUREMENT,
      expect.any(Function),
    );

    fakeDevice.emitHr(140);
    fakeDevice.emitHr(150);
    fakeDevice.emitHr(145);

    await sessionRecordingService.stopRecording();

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const [persisted] = mockInsert.mock.calls[0];
    expect(persisted.heartRateData).toHaveLength(3);
    expect(persisted.averageHeartRate).toBe(145); // round((140+150+145)/3)
  });

  it('excludes only the HR reading that coincides with a motion spike', async () => {
    await sessionRecordingService.startRecording(
      'Integration Test',
      TrainingType.RUNNING,
      DEVICE_ID,
      'Polar H10',
    );

    // Frame 1 (t=1_000_000 wall / 0ns device): calm, also anchors the
    // strap-clock offset (captured at the first ACC frame received).
    fakeDevice.emitAcc(0n, [1000, 0, 0]);
    fakeDevice.emitHr(140);

    // Frame 2: motion spike, 5s later on both clocks.
    jest.setSystemTime(1_005_000);
    fakeDevice.emitAcc(5_000_000_000n, [2000, 2000, 2000]);
    fakeDevice.emitHr(180);

    // Frame 3: back to calm, another 5s later.
    jest.setSystemTime(1_010_000);
    fakeDevice.emitAcc(10_000_000_000n, [1000, 0, 0]);
    fakeDevice.emitHr(145);

    await sessionRecordingService.stopRecording();

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const [persisted] = mockInsert.mock.calls[0];

    const persistedRates = persisted.heartRateData.map(
      (d: { heartRate: number }) => d.heartRate,
    );
    expect(persistedRates).toEqual([140, 145]);
    expect(persistedRates).not.toContain(180);
    expect(persisted.averageHeartRate).toBe(143); // round((140+145)/2)
  });
});

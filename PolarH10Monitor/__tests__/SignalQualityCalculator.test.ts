import {
  filterMotionCorruptedReadings,
  StrapClockOffset,
} from '../src/utils/SignalQualityCalculator';
import type { HeartRateReading } from '../src/services/HeartRateService';
import type { PMDAccFrame } from '../src/utils/PMDFrameParser';

function reading(atMs: number, heartRate = 140): HeartRateReading {
  return {
    timestamp: new Date(atMs),
    heartRate,
    rrIntervals: [],
    deviceId: 'device123',
  };
}

function accFrame(atMs: number, sample: [number, number, number]): PMDAccFrame {
  return {
    // deviceStartNs = 0n / wallStartMs = 0 in the offset below, so ns == ms * 1e6
    timestampNs: BigInt(atMs) * 1_000_000n,
    samples: [sample],
  };
}

const IDENTITY_OFFSET: StrapClockOffset = { deviceStartNs: 0n, wallStartMs: 0 };

describe('SignalQualityCalculator.filterMotionCorruptedReadings', () => {
  it('is a passthrough when no ACC data was collected (PMD unsupported/dry strap)', () => {
    const readings = [reading(1000), reading(2000)];
    const result = filterMotionCorruptedReadings(readings, [], IDENTITY_OFFSET);
    expect(result.clean).toEqual(readings);
    expect(result.discardedCount).toBe(0);
  });

  it('is a passthrough when no strap clock offset is available', () => {
    const readings = [reading(1000)];
    const frames = [accFrame(1000, [2000, 2000, 2000])];
    const result = filterMotionCorruptedReadings(readings, frames, null);
    expect(result.clean).toEqual(readings);
    expect(result.discardedCount).toBe(0);
  });

  it('excludes a reading whose surrounding ACC window shows high motion', () => {
    // Magnitude sqrt(2000^2*3) ≈ 3464 mG, ~2464 mG off the 1000 mG gravity
    // baseline — well above the 300 mG default threshold.
    const spikeReading = reading(1000);
    const frames = [accFrame(1000, [2000, 2000, 2000])];

    const result = filterMotionCorruptedReadings(
      [spikeReading],
      frames,
      IDENTITY_OFFSET,
    );

    expect(result.clean).toEqual([]);
    expect(result.discardedCount).toBe(1);
  });

  it('keeps a reading whose surrounding ACC window is at rest', () => {
    // (1000, 0, 0) mG magnitude = 1000 mG = exactly the gravity baseline.
    const calmReading = reading(5000);
    const frames = [accFrame(5000, [1000, 0, 0])];

    const result = filterMotionCorruptedReadings(
      [calmReading],
      frames,
      IDENTITY_OFFSET,
    );

    expect(result.clean).toEqual([calmReading]);
    expect(result.discardedCount).toBe(0);
  });

  it('keeps a reading with no ACC coverage nearby (absence of data is not evidence of motion)', () => {
    const isolatedReading = reading(20_000);
    // Frame is far outside the ±500ms window around 20s.
    const frames = [accFrame(1000, [2000, 2000, 2000])];

    const result = filterMotionCorruptedReadings(
      [isolatedReading],
      frames,
      IDENTITY_OFFSET,
    );

    expect(result.clean).toEqual([isolatedReading]);
    expect(result.discardedCount).toBe(0);
  });

  it('filters a mix of clean and motion-corrupted readings independently', () => {
    const readings = [reading(1000, 150), reading(5000, 145)];
    const frames = [
      accFrame(1000, [2000, 2000, 2000]), // motion spike
      accFrame(5000, [1000, 0, 0]), // at rest
    ];

    const result = filterMotionCorruptedReadings(
      readings,
      frames,
      IDENTITY_OFFSET,
    );

    expect(result.clean).toEqual([readings[1]]);
    expect(result.discardedCount).toBe(1);
  });
});

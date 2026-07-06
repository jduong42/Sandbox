/**
 * SignalQualityCalculator.ts
 *
 * Filters heart-rate readings captured during a high-acceleration motion
 * event (sprinting, jumping, HIIT) using the strap's own accelerometer as an
 * independent motion channel. Accelerometer-gated motion-artifact rejection
 * is the standard technique for this problem in ambulatory HR/ECG
 * monitoring — this applies it using the Polar H10's onboard accelerometer,
 * streamed via the PMD protocol (see PolarPMDService / PMDFrameParser).
 *
 * Pure and BLE-free. Safe to call unconditionally: with no ACC data (PMD
 * unsupported this session, or a dry/loose strap) it is a passthrough.
 *
 * ── Threshold caveat ─────────────────────────────────────────────────────────
 * MOTION_ARTIFACT_THRESHOLD_MG (src/constants/ble.ts) is an engineering
 * placeholder, not a cited figure — it must be tuned against real on-device
 * accelerometer logs before being trusted (see the PMD plan's verification
 * section).
 */

import type { HeartRateReading } from '../services/HeartRateService';
import type { PMDAccFrame } from './PMDFrameParser';
import { PMD_ACC_SETTINGS } from '../constants/ble';

/**
 * Anchors the strap's internal nanosecond clock to wall-clock time. Captured
 * once, at the first PMD frame received in a session — per-frame alignment
 * against the phone clock is deliberately avoided (BLE notification jitter
 * of 10-50ms would make the derived signal look artificially noisy).
 */
export interface StrapClockOffset {
  deviceStartNs: bigint;
  wallStartMs: number;
}

export interface FilterResult {
  clean: HeartRateReading[];
  discardedCount: number;
}

const GRAVITY_BASELINE_MG = 1000;

function frameToWallMs(frame: PMDAccFrame, offset: StrapClockOffset): number {
  const deltaNs = frame.timestampNs - offset.deviceStartNs;
  return offset.wallStartMs + Number(deltaNs / 1_000_000n);
}

/** RMS deviation of a frame's samples from the resting 1G gravity baseline, in mG. */
function frameDeviationMg(frame: PMDAccFrame): number {
  if (frame.samples.length === 0) return 0;

  const squaredDeviations = frame.samples.map(([x, y, z]) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    return (magnitude - GRAVITY_BASELINE_MG) ** 2;
  });
  const meanSquared =
    squaredDeviations.reduce((sum, v) => sum + v, 0) /
    squaredDeviations.length;
  return Math.sqrt(meanSquared);
}

/**
 * Excludes HR readings whose surrounding accelerometer window shows
 * motion beyond MOTION_ARTIFACT_THRESHOLD_MG. Readings with no ACC data
 * in their window (e.g. gap in coverage) are kept, not discarded — absence
 * of data is not evidence of motion.
 */
export function filterMotionCorruptedReadings(
  readings: HeartRateReading[],
  accFrames: PMDAccFrame[],
  strapClockOffset: StrapClockOffset | null,
): FilterResult {
  if (accFrames.length === 0 || !strapClockOffset) {
    return { clean: readings, discardedCount: 0 };
  }

  const taggedFrames = accFrames.map(frame => ({
    wallMs: frameToWallMs(frame, strapClockOffset),
    deviationMg: frameDeviationMg(frame),
  }));

  const halfWidth = PMD_ACC_SETTINGS.QUALITY_WINDOW_HALF_WIDTH_MS;
  const threshold = PMD_ACC_SETTINGS.MOTION_ARTIFACT_THRESHOLD_MG;

  const clean: HeartRateReading[] = [];
  let discardedCount = 0;

  for (const reading of readings) {
    const readingMs = reading.timestamp.getTime();
    const windowFrames = taggedFrames.filter(
      f => Math.abs(f.wallMs - readingMs) <= halfWidth,
    );

    if (windowFrames.length === 0) {
      clean.push(reading);
      continue;
    }

    const meanSquared =
      windowFrames.reduce((sum, f) => sum + f.deviationMg ** 2, 0) /
      windowFrames.length;
    const windowDeviationMg = Math.sqrt(meanSquared);

    if (windowDeviationMg > threshold) {
      discardedCount++;
    } else {
      clean.push(reading);
    }
  }

  return { clean, discardedCount };
}

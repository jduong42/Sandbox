/**
 * recordingStore.ts — Zustand store for the LIVE (in-progress) recording view.
 *
 * Purely ephemeral, no persistence — mirrors the latest values already being
 * pushed through SessionRecordingService's HR/PMD callbacks so the live
 * recording screen can render them reactively. Does not participate in the
 * actual data accumulation/filtering/persistence pipeline in any way.
 */

import { create } from 'zustand';
import { computeHRZone, TRIMPCalculator } from '../services/TRIMPCalculator';
import { HeartRateZone } from '../types/training';

/** Physiology snapshot captured once per session, used for live zone/TRIMP. */
export interface LivePhysiology {
  maxHeartRate: number;
  restingHeartRate: number;
  gender: 'male' | 'female';
}

export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected';

type ZoneDurations = Record<HeartRateZone, number>;

const EMPTY_ZONE_DURATIONS: ZoneDurations = {
  [HeartRateZone.ZONE_1]: 0,
  [HeartRateZone.ZONE_2]: 0,
  [HeartRateZone.ZONE_3]: 0,
  [HeartRateZone.ZONE_4]: 0,
  [HeartRateZone.ZONE_5]: 0,
};

interface RecordingState {
  currentHeartRate: number | null;
  currentZone: HeartRateZone | null;
  /** True once the PMD ACC stream has delivered at least one frame this session. */
  pmdActive: boolean;
  sessionAvgHeartRate: number | null;
  sessionPeakHeartRate: number | null;
  currentTrimp: number | null;
  /** Accumulated seconds spent in each zone so far this session. */
  zoneDurations: ZoneDurations;
  /** Live BLE connection state — surfaced in LiveRecordingPanel's status line. */
  connectionState: ConnectionState;

  sessionStartTime: Date | null;
  physiology: LivePhysiology | null;
  /** @internal running accumulators, not for direct UI use */
  _hrSum: number;
  _hrCount: number;
  _lastReadingAt: number | null;

  startSession: (startTime: Date, physiology: LivePhysiology) => void;
  recordHeartRate: (heartRate: number) => void;
  setPmdActive: (active: boolean) => void;
  setConnectionState: (state: ConnectionState) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  currentHeartRate: null,
  currentZone: null,
  pmdActive: false,
  sessionAvgHeartRate: null,
  sessionPeakHeartRate: null,
  currentTrimp: null,
  zoneDurations: EMPTY_ZONE_DURATIONS,
  connectionState: 'connected' as ConnectionState,
  sessionStartTime: null,
  physiology: null,
  _hrSum: 0,
  _hrCount: 0,
  _lastReadingAt: null,
} as const;

export const useRecordingStore = create<RecordingState>((set, get) => ({
  ...INITIAL_STATE,

  startSession: (startTime, physiology) => {
    set({ ...INITIAL_STATE, sessionStartTime: startTime, physiology });
  },

  recordHeartRate: heartRate => {
    const {
      physiology,
      sessionStartTime,
      currentZone: previousZone,
      _lastReadingAt,
      _hrSum,
      _hrCount,
      sessionPeakHeartRate,
      zoneDurations,
    } = get();

    if (!physiology || !sessionStartTime) {
      // Shouldn't happen if startSession() ran first — degrade gracefully.
      set({ currentHeartRate: heartRate });
      return;
    }

    const now = Date.now();

    // Attribute the elapsed time since the last reading to the zone we were
    // in until this one arrived — same logic as TRIMPCalculator.buildZoneSummary,
    // applied incrementally instead of over a finished array.
    let nextZoneDurations = zoneDurations;
    if (previousZone != null && _lastReadingAt != null) {
      const deltaSeconds = (now - _lastReadingAt) / 1000;
      nextZoneDurations = {
        ...zoneDurations,
        [previousZone]: zoneDurations[previousZone] + deltaSeconds,
      };
    }

    const hrSum = _hrSum + heartRate;
    const hrCount = _hrCount + 1;
    const avg = Math.round(hrSum / hrCount);
    const peak = Math.max(sessionPeakHeartRate ?? 0, heartRate);
    const elapsedSeconds = (now - sessionStartTime.getTime()) / 1000;
    const trimp = TRIMPCalculator.calculateBanisterTRIMP({
      duration: elapsedSeconds,
      averageHeartRate: avg,
      restingHeartRate: physiology.restingHeartRate,
      maxHeartRate: physiology.maxHeartRate,
      gender: physiology.gender,
    });

    set({
      currentHeartRate: heartRate,
      currentZone: computeHRZone(heartRate, physiology.maxHeartRate),
      _hrSum: hrSum,
      _hrCount: hrCount,
      _lastReadingAt: now,
      sessionAvgHeartRate: avg,
      sessionPeakHeartRate: peak,
      currentTrimp: trimp,
      zoneDurations: nextZoneDurations,
    });
  },

  setPmdActive: active => set({ pmdActive: active }),

  setConnectionState: state => set({ connectionState: state }),

  reset: () => set({ ...INITIAL_STATE }),
}));

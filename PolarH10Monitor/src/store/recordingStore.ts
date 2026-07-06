/**
 * recordingStore.ts — Zustand store for the LIVE (in-progress) recording view.
 *
 * Purely ephemeral, no persistence — mirrors the latest values already being
 * pushed through SessionRecordingService's HR/PMD callbacks so the live
 * recording screen can render them reactively. Does not participate in the
 * actual data accumulation/filtering/persistence pipeline in any way.
 */

import { create } from 'zustand';
import { computeHRZone } from '../services/TRIMPCalculator';
import { HeartRateZone } from '../types/training';

interface RecordingState {
  currentHeartRate: number | null;
  currentZone: HeartRateZone | null;
  /** True once the PMD ACC stream has delivered at least one frame this session. */
  pmdActive: boolean;

  recordHeartRate: (heartRate: number, maxHeartRate: number) => void;
  setPmdActive: (active: boolean) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingState>(set => ({
  currentHeartRate: null,
  currentZone: null,
  pmdActive: false,

  recordHeartRate: (heartRate, maxHeartRate) => {
    set({
      currentHeartRate: heartRate,
      currentZone: computeHRZone(heartRate, maxHeartRate),
    });
  },

  setPmdActive: active => set({ pmdActive: active }),

  reset: () => set({ currentHeartRate: null, currentZone: null, pmdActive: false }),
}));

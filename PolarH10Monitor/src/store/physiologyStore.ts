/**
 * physiologyStore.ts
 *
 * Zustand store for user physiological attributes used in calorie calculations.
 *
 * ── Security model ────────────────────────────────────────────────────────────
 * All physiological data (age, weight, height, sex, body fat) is classified as
 * sensitive health data. It is:
 *   • Stored exclusively on-device via EncryptedStorage (iOS Keychain /
 *     Android EncryptedSharedPreferences) + AES-256 encryption.
 *   • Never logged, never transmitted, never included in crash reports.
 *   • Independently keyed from the auth store so login/logout does NOT wipe it.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { create } from 'zustand';
import { secureRead, secureRemove, secureWrite } from '../utils/secureStorage';
import {
  ActivityLevel,
  DEFAULT_USER_PROFILE,
  Sex,
  UserProfile,
} from '../utils/CalorieCalculator';

const STORAGE_KEY = 'user-physiology-v1';

// ─── Partial settings type (all fields optional) ──────────────────────────────

export interface PhysiologySettings {
  sex?: Sex;
  /** Age in full years */
  ageYears?: number;
  /** Height in centimetres */
  heightCm?: number;
  /** Body weight in kilograms */
  weightKg?: number;
  activityLevel?: ActivityLevel;
  /**
   * Optional body fat fraction (0–1), e.g. 0.18 = 18 %.
   * Enables the more accurate Katch-McArdle BMR formula when provided.
   */
  bodyFatFraction?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true only when all four fields required by the Mifflin-St Jeor
 * formula are present.  Body fat and activity level have sensible defaults
 * so they are not considered "required".
 */
export function isPhysiologyComplete(s: PhysiologySettings): boolean {
  return (
    s.sex != null &&
    s.ageYears != null &&
    s.heightCm != null &&
    s.weightKg != null
  );
}

/**
 * Build a full `UserProfile` from stored settings, falling back to the global
 * defaults for any field that has not been set yet.
 * The returned profile is always valid for calorie calculations.
 */
export function toUserProfile(s: PhysiologySettings): UserProfile {
  return {
    sex: s.sex ?? DEFAULT_USER_PROFILE.sex,
    age: s.ageYears ?? DEFAULT_USER_PROFILE.age,
    heightCm: s.heightCm ?? DEFAULT_USER_PROFILE.heightCm,
    weightKg: s.weightKg ?? DEFAULT_USER_PROFILE.weightKg,
    activityLevel: s.activityLevel ?? DEFAULT_USER_PROFILE.activityLevel,
    bodyFatFraction: s.bodyFatFraction,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface PhysiologyState {
  settings: PhysiologySettings;
  /** True after the first load from secure storage completes */
  isLoaded: boolean;

  initialize: () => Promise<void>;
  updateSettings: (patch: Partial<PhysiologySettings>) => Promise<void>;
  clearSettings: () => Promise<void>;
}

export const usePhysiologyStore = create<PhysiologyState>((set, get) => ({
  settings: {},
  isLoaded: false,

  initialize: async () => {
    try {
      const stored = await secureRead<PhysiologySettings>(STORAGE_KEY);
      set({ settings: stored ?? {}, isLoaded: true });
    } catch {
      // Storage unavailable — proceed with empty settings (graceful degradation)
      set({ isLoaded: true });
    }
  },

  updateSettings: async (patch: Partial<PhysiologySettings>) => {
    const next = { ...get().settings, ...patch };
    await secureWrite<PhysiologySettings>(STORAGE_KEY, next);
    set({ settings: next });
  },

  clearSettings: async () => {
    await secureRemove(STORAGE_KEY);
    set({ settings: {} });
  },
}));

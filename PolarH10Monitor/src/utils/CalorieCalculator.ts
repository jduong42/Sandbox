/**
 * CalorieCalculator
 *
 * Implements evidence-based calorie estimation formulas:
 *  - Mifflin-St Jeor (1990): BMR for general population
 *  - Katch-McArdle: BMR when lean body mass is known
 *  - TDEE: BMR × activity multiplier
 *  - Keytel (2005): real-time calorie burn from heart rate during exercise
 */

export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary' // 1.2  – desk job, little/no exercise
  | 'light' // 1.375 – light exercise 1–3 days/week
  | 'moderate' // 1.55  – moderate exercise 3–5 days/week
  | 'active' // 1.725 – hard exercise 6–7 days/week
  | 'extra'; // 1.9   – physical job or pro-athlete training

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  light: 'Lightly Active',
  moderate: 'Moderately Active',
  active: 'Very Active',
  extra: 'Extra Active',
};

export interface UserProfile {
  /** kg */
  weightKg: number;
  /** cm */
  heightCm: number;
  /** years */
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  /** Optional: body fat percentage (0–1). Enables Katch-McArdle if provided. */
  bodyFatFraction?: number;
}

/** Sensible defaults — will be replaced once a user profile screen exists. */
export const DEFAULT_USER_PROFILE: UserProfile = {
  weightKg: 75,
  heightCm: 175,
  age: 30,
  sex: 'male',
  activityLevel: 'moderate',
};

// ─── BMR ──────────────────────────────────────────────────────────────────────

/**
 * Mifflin-St Jeor BMR (kcal/day).
 * Most accurate for the general population (Mifflin et al., 1990).
 */
export function mifflinStJeorBMR(profile: UserProfile): number {
  const { weightKg, heightCm, age, sex } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Katch-McArdle BMR (kcal/day).
 * More accurate when body fat % is known; ignores sex and height.
 * LBM = weight × (1 − bodyFatFraction)
 */
export function katchMcArdleBMR(profile: UserProfile): number {
  const { weightKg, bodyFatFraction = 0.2 } = profile;
  const lbm = weightKg * (1 - bodyFatFraction);
  return 370 + 21.6 * lbm;
}

/**
 * Returns the most accurate BMR available for the given profile.
 * Uses Katch-McArdle if bodyFatFraction is provided, otherwise Mifflin-St Jeor.
 */
export function getBMR(profile: UserProfile): number {
  return profile.bodyFatFraction !== undefined
    ? katchMcArdleBMR(profile)
    : mifflinStJeorBMR(profile);
}

// ─── TDEE ─────────────────────────────────────────────────────────────────────

/**
 * Total Daily Energy Expenditure (kcal/day).
 * BMR × activity multiplier.
 */
export function getTDEE(profile: UserProfile): number {
  return getBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel];
}

// ─── Resting calories elapsed today ──────────────────────────────────────────

/**
 * Estimated calories burned since midnight based on BMR prorated by the
 * fraction of the day that has elapsed.
 * Does NOT include exercise-on-top-of-BMR calories.
 */
export function getRestingCaloriesToday(profile: UserProfile): number {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const fractionOfDay = minutesSinceMidnight / 1440;
  return Math.round(getBMR(profile) * fractionOfDay);
}

// ─── Real-time exercise calorie burn (Keytel formula) ────────────────────────

/**
 * Instantaneous calorie burn rate (kcal/min) from heart rate.
 * Keytel et al. (2005) — validated against indirect calorimetry.
 *
 * @param heartRateBpm   Current heart rate in bpm
 * @param profile        User profile
 * @returns kcal per minute (>= 0)
 */
export function getCaloriesPerMinuteFromHR(
  heartRateBpm: number,
  profile: UserProfile,
): number {
  const { weightKg, age, sex } = profile;
  let kcalPerMin: number;

  if (sex === 'male') {
    kcalPerMin =
      (-55.0969 + 0.6309 * heartRateBpm + 0.1988 * weightKg + 0.2017 * age) /
      4.184;
  } else {
    kcalPerMin =
      (-20.4022 + 0.4472 * heartRateBpm - 0.1263 * weightKg + 0.074 * age) /
      4.184;
  }

  return Math.max(0, kcalPerMin);
}

/**
 * Calories burned over a session given an array of HR readings sampled at a
 * fixed interval.
 *
 * @param hrReadings         Array of heart rate values (bpm)
 * @param samplingIntervalMs Milliseconds between samples (default 1000ms)
 * @param profile            User profile
 * @returns Total kcal burned during the session
 */
export function getSessionCalories(
  hrReadings: number[],
  profile: UserProfile,
  samplingIntervalMs: number = 1000,
): number {
  if (hrReadings.length === 0) return 0;
  const minutesPerSample = samplingIntervalMs / 60000;
  return hrReadings.reduce((total, hr) => {
    return total + getCaloriesPerMinuteFromHR(hr, profile) * minutesPerSample;
  }, 0);
}

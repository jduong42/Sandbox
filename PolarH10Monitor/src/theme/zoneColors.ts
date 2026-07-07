/**
 * Per-theme HR zone text colors, verified to meet WCAG 2.2 AA (4.5:1) as
 * *text* color against each theme's surface. HeartRateZoneCalculator's base
 * palette (TRIMPCalculator.ts) was tuned for the dark theme only and fails on
 * white — verified: only 1/5 cleared 3:1, none cleared 4.5:1 against #ffffff.
 *
 * Shared between LiveRecordingPanel and SessionDetailScreen — kept in one
 * place so the two never drift apart the way computeHRZone briefly did.
 */

import { HeartRateZone } from '../types/training';

export const ZONE_TEXT_COLOR_DARK: Record<HeartRateZone, string> = {
  [HeartRateZone.ZONE_1]: '#4CAF50',
  [HeartRateZone.ZONE_2]: '#8BC34A',
  [HeartRateZone.ZONE_3]: '#FFC107',
  [HeartRateZone.ZONE_4]: '#FF9800',
  [HeartRateZone.ZONE_5]: '#f87171', // brighter than the base palette's
  // #F44336 (3.97:1 on dark surface) so it clears the 4.5:1 AA minimum too.
};

export const ZONE_TEXT_COLOR_LIGHT: Record<HeartRateZone, string> = {
  [HeartRateZone.ZONE_1]: '#15803d',
  [HeartRateZone.ZONE_2]: '#4d7c0f',
  [HeartRateZone.ZONE_3]: '#b45309',
  [HeartRateZone.ZONE_4]: '#c2410c',
  [HeartRateZone.ZONE_5]: '#b91c1c',
};

export function getZoneTextColor(zone: HeartRateZone, isDark: boolean): string {
  return (isDark ? ZONE_TEXT_COLOR_DARK : ZONE_TEXT_COLOR_LIGHT)[zone];
}

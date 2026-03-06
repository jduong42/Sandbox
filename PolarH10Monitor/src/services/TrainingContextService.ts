/**
 * TrainingContextService.ts
 *
 * Builds the personalised context block that is injected into every AI prompt.
 * This is the bridge between all the data the app holds and the local LLM.
 *
 * Context includes:
 *   • User physiology (age, sex, weight, height, activity level)
 *   • Last 28 days of training sessions (date, type, duration, HR, TRIMP)
 *   • 7-day TRIMP trend summary
 *   • ACWR score + risk label
 *
 * Nothing here reaches the internet — all data stays on-device.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePhysiologyStore } from '../store/physiologyStore';
import { useAuthStore } from '../store/authStore';
import { AnalyticsService } from './AnalyticsService';
import { calculateACWR, DailyLoad } from '../utils/ACWRCalculator';
import { TrainingSession, UserProfile } from '../types/training';

const SESSIONS_HISTORY_KEY = 'sessions_history';
// Key used by DevScreen seed function
export const SEEDED_SESSIONS_KEY = 'seeded_training_sessions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrainingContext {
  /** The full plain-text block to inject before the user's question */
  contextBlock: string;
  /** Raw values for debugging / DevScreen display */
  debug: {
    sessionCount: number;
    acwr: number | null;
    acwrRisk: string;
    acuteLoad: number;
    chronicLoad: number;
    last7DayTrimp: number[];
    physiologyComplete: boolean;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

class TrainingContextService {
  /**
   * Builds a complete context block from all available on-device data.
   * Safe to call from any async context — reads stores directly (not hooks).
   */
  async buildContext(): Promise<TrainingContext> {
    const [sessions, physiology, user] = await Promise.all([
      this.loadSessions(),
      this.getPhysiology(),
      this.getUser(),
    ]);

    // ── Last 28 days ──
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 28);
    const recentSessions = sessions.filter(s => new Date(s.date) >= cutoff);

    // ── Enrich with TRIMP if not already set ──
    const userProfile = this.buildUserProfile(physiology, user);
    const enriched = recentSessions.some(s => !s.trimpScore)
      ? AnalyticsService.enrichSessionsWithTRIMP(recentSessions, userProfile)
      : recentSessions;

    // ── Daily TRIMP for ACWR ──
    const dailyLoads: DailyLoad[] = enriched.map(s => ({
      date: new Date(s.date),
      trimp: s.trimpScore ?? 0,
    }));
    const acwrResult = calculateACWR(dailyLoads);

    // ── Last 7 sessions summary ──
    const last7 = enriched.slice(-7).map(s => ({
      date: new Date(s.date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      type: s.type,
      durationMin: Math.round(s.duration / 60),
      avgHR: Math.round(s.averageHeartRate),
      trimp: Math.round(s.trimpScore ?? 0),
    }));

    // ── Weekly TRIMP for last 4 weeks ──
    const weeklyTrimp = this.computeWeeklyTrimp(enriched);

    // ── Context block text ──
    const contextBlock = this.formatContextBlock({
      physiology,
      user,
      last7,
      weeklyTrimp,
      acwrResult,
      totalSessions: enriched.length,
    });

    return {
      contextBlock,
      debug: {
        sessionCount: enriched.length,
        acwr: acwrResult.acwr,
        acwrRisk: acwrResult.risk,
        acuteLoad: acwrResult.acuteLoad,
        chronicLoad: acwrResult.chronicLoad,
        last7DayTrimp: weeklyTrimp.slice(-7),
        physiologyComplete: !!physiology,
      },
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async loadSessions(): Promise<TrainingSession[]> {
    try {
      // Try both the seeded key (DevScreen) and the real recording service key
      const [seeded, real] = await Promise.all([
        AsyncStorage.getItem(SEEDED_SESSIONS_KEY),
        AsyncStorage.getItem(SESSIONS_HISTORY_KEY),
      ]);

      const seededSessions: TrainingSession[] = seeded
        ? (JSON.parse(seeded) as TrainingSession[])
        : [];
      const realSessions: TrainingSession[] = real
        ? (JSON.parse(real) as TrainingSession[])
        : [];

      // Merge, deduplicate by id, sort oldest→newest
      const all = [...seededSessions, ...realSessions];
      const seen = new Set<string>();
      const unique = all.filter(s => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
      return unique.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    } catch {
      return [];
    }
  }

  private getPhysiology() {
    return usePhysiologyStore.getState().settings;
  }

  private getUser() {
    return useAuthStore.getState().user;
  }

  private buildUserProfile(
    physiology: ReturnType<typeof usePhysiologyStore.getState>['settings'],
    user: ReturnType<typeof useAuthStore.getState>['user'],
  ): UserProfile {
    const age = physiology?.ageYears ?? 30;
    const restingHeartRate = physiology?.restingHeartRate ?? 60;
    const maxHeartRate =
      physiology?.maxHeartRate != null ? physiology.maxHeartRate : 220 - age;
    return {
      id: user?.id ?? 'unknown',
      age,
      restingHeartRate,
      maxHeartRate,
      weight: physiology?.weightKg,
      sex: physiology?.sex,
    };
  }

  private computeWeeklyTrimp(sessions: TrainingSession[]): number[] {
    const weeks: number[] = [0, 0, 0, 0]; // last 4 weeks, index 0 = oldest
    const now = new Date();
    for (const s of sessions) {
      const daysAgo = Math.floor(
        (now.getTime() - new Date(s.date).getTime()) / 86_400_000,
      );
      const weekIndex = 3 - Math.floor(daysAgo / 7);
      if (weekIndex >= 0 && weekIndex <= 3) {
        weeks[weekIndex] += s.trimpScore ?? 0;
      }
    }
    return weeks.map(w => Math.round(w));
  }

  private formatContextBlock({
    physiology,
    user,
    last7,
    weeklyTrimp,
    acwrResult,
    totalSessions,
  }: {
    physiology: ReturnType<typeof usePhysiologyStore.getState>['settings'];
    user: ReturnType<typeof useAuthStore.getState>['user'];
    last7: Array<{
      date: string;
      type: string;
      durationMin: number;
      avgHR: number;
      trimp: number;
    }>;
    weeklyTrimp: number[];
    acwrResult: ReturnType<typeof calculateACWR>;
    totalSessions: number;
  }): string {
    const today = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const lines: string[] = [
      '[ATHLETE PROFILE — use this for all advice]',
      `Today: ${today}`,
    ];

    // ── Identity ──
    if (user?.name) lines.push(`Name: ${user.name}`);

    // ── Physiology ──
    if (physiology) {
      const p = physiology;
      const parts: string[] = [];
      if (p.sex) parts.push(p.sex);
      if (p.ageYears) parts.push(`${p.ageYears} years old`);
      if (p.weightKg) parts.push(`${p.weightKg} kg`);
      if (p.heightCm) parts.push(`${p.heightCm} cm`);
      if (p.activityLevel)
        parts.push(`activity: ${p.activityLevel.replace(/_/g, ' ')}`);
      if (p.bodyFatFraction)
        parts.push(`body fat: ${Math.round(p.bodyFatFraction * 100)}%`);
      if (parts.length) lines.push(`Physiology: ${parts.join(', ')}`);

      // Pre-compute derived values so the model never has to guess them
      const age = p.ageYears ?? 30;
      const maxHR = p.maxHeartRate != null ? p.maxHeartRate : 220 - age;
      const restHR = p.restingHeartRate ?? 60;
      const hrReserve = maxHR - restHR;
      const maxHRSource =
        p.maxHeartRate != null ? 'measured' : '220 − age estimate';

      lines.push(`Max HR: ${maxHR} bpm (${maxHRSource})`);
      lines.push(`Resting HR: ${restHR} bpm  // HR reserve = ${hrReserve} bpm`);

      // Karvonen zone boundaries — match the app's actual zone calculation
      const z1top = Math.round(restHR + hrReserve * 0.6);
      const z2top = Math.round(restHR + hrReserve * 0.7);
      const z3top = Math.round(restHR + hrReserve * 0.8);
      const z4top = Math.round(restHR + hrReserve * 0.9);
      lines.push(`HR zones (Karvonen method, HR reserve = ${hrReserve} bpm):`);
      lines.push(`  Zone 1 (Active Recovery):        ≤${z1top} bpm`);
      lines.push(
        `  Zone 2 (Aerobic Base / fat burn): ${z1top + 1}–${z2top} bpm`,
      );
      lines.push(
        `  Zone 3 (Aerobic Threshold):       ${z2top + 1}–${z3top} bpm`,
      );
      lines.push(
        `  Zone 4 (Lactate Threshold):       ${z3top + 1}–${z4top} bpm`,
      );
      lines.push(`  Zone 5 (VO2 Max / Max Effort):    >${z4top} bpm`);
    } else {
      lines.push('Physiology: not set (user has not completed profile)');
    }

    // ── Training load ──
    lines.push(`Training sessions (last 28 days): ${totalSessions}`);

    if (weeklyTrimp.some(w => w > 0)) {
      lines.push(
        `Weekly TRIMP (oldest→current week): [${weeklyTrimp.join(', ')}]` +
          '  // TRIMP = Banister formula: duration × avg HR reserve fraction × sex-specific exponential weighting. Higher = more training load.',
      );
    }

    // ── ACWR ──
    if (acwrResult.acwr !== null) {
      lines.push(
        `Injury Risk Ratio (ACWR): ${acwrResult.acwr}` +
          `  // DISTINCT from TRIMP. ACWR = 7-day TRIMP sum ÷ (28-day TRIMP sum ÷ 4).` +
          ` Risk: <0.8 detraining, 0.8–1.3 optimal, 1.3–1.5 moderate risk, >1.5 high injury risk.` +
          ` Current zone: ${acwrResult.risk.replace(/_/g, ' ')}.`,
      );
      lines.push(`ACWR interpretation: ${acwrResult.interpretation}`);
    } else {
      lines.push(
        `Injury Risk Ratio (ACWR): insufficient data (${acwrResult.daysOfData} days logged, need ≥3)`,
      );
    }

    // ── Recent sessions ──
    if (last7.length > 0) {
      lines.push(
        'Recent sessions (newest last):' +
          '  // avg HR = mean heart rate measured by Polar H10 chest strap during the session',
      );
      for (const s of last7) {
        lines.push(
          `  ${s.date} — ${s.type} ${s.durationMin} min, avg HR ${s.avgHR} bpm, TRIMP ${s.trimp}`,
        );
      }
    } else {
      lines.push('Recent sessions: none logged yet');
    }

    // ── Methodology note — prevents the model from inventing calculation methods ──
    lines.push(
      '[METRICS NOTE] ' +
        'All HR data is recorded directly by the Polar H10 heart rate chest strap. ' +
        'TRIMP is computed via the Banister (1991) sex-specific exponential formula using HR reserve. ' +
        'The Injury Risk Ratio (ACWR) follows Gabbett (2016): acute load = rolling 7-day TRIMP sum; ' +
        'chronic load = rolling 28-day TRIMP sum ÷ 4 (weekly average). ' +
        'TRIMP and ACWR are distinct metrics — TRIMP is a session load number, ACWR is a ratio derived from it. ' +
        'Max HR and all HR zones listed above are pre-calculated from the physiology profile — do not re-derive them. ' +
        'If asked how a metric was calculated, refer only to these methods.',
    );

    lines.push('[END PROFILE]');
    return lines.join('\n');
  }
}

export const trainingContextService = new TrainingContextService();

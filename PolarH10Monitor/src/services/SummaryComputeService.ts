/**
 * SummaryComputeService.ts
 *
 * Generates and persists pre-computed text summaries at three granularities:
 *   • session    — one-liner per session (date, type, duration, HR, TRIMP, RPE)
 *   • weekly     — aggregated totals for a calendar week
 *   • monthly    — aggregated totals for a calendar month
 *
 * Called after every session save so summaries are always fresh.
 *
 * TrainingContextService uses summaries for broad "how am I doing?" queries:
 *   • intent = 'summary' + date range → inject weekly/monthly summary text
 *     instead of individual session rows, keeping prompts short.
 *   • intent = 'general' → inject raw session rows as before.
 *
 * Key format:
 *   week  → '2026-W10'  (ISO week number, zero-padded)
 *   month → '2026-03'
 */

import { databaseService } from './DatabaseService';
import { sessionRepository } from './SessionRepository';
import type { TrainingSession } from '../types/training';
import { logger } from '../utils/logger';

// ─── Key helpers ──────────────────────────────────────────────────────────────

/** Returns the ISO week number for a date (1–53). */
function isoWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // Thursday of this week
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function weekKey(date: Date): string {
  const d = new Date(date);
  // Use the year of the Thursday to handle year-boundary weeks correctly
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const year = thursday.getFullYear();
  const week = isoWeekNumber(d).toString().padStart(2, '0');
  return `${year}-W${week}`;
}

export function monthKey(date: Date): string {
  const d = new Date(date);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatSessionSummary(s: TrainingSession): string {
  const date = new Date(s.date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const durMin = Math.round(s.duration / 60);
  const trimp = s.trimpScore ? ` | TRIMP ${Math.round(s.trimpScore)}` : '';
  const rpe = s.perceivedEffort ? ` | RPE ${s.perceivedEffort}` : '';
  return `${date} | ${s.type} ${durMin}min | avg HR ${Math.round(
    s.averageHeartRate,
  )}bpm${trimp}${rpe}`;
}

function formatWeeklySummary(
  wk: string,
  sessions: TrainingSession[],
): { text: string; totalTrimp: number } {
  if (sessions.length === 0) {
    return { text: `Week ${wk}: no sessions logged.`, totalTrimp: 0 };
  }
  const totalTrimp = sessions.reduce((sum, s) => sum + (s.trimpScore ?? 0), 0);
  const totalMin = Math.round(
    sessions.reduce((sum, s) => sum + s.duration, 0) / 60,
  );
  const avgHR = Math.round(
    sessions.reduce((sum, s) => sum + s.averageHeartRate, 0) / sessions.length,
  );
  const typeList = [...new Set(sessions.map(s => s.type))].join(', ');
  const text =
    `Week ${wk}: ${sessions.length} sessions | ${totalMin}min total | ` +
    `avg HR ${avgHR}bpm | TRIMP ${Math.round(totalTrimp)} | ${typeList}`;
  return { text, totalTrimp };
}

function formatMonthlySummary(
  mk: string,
  sessions: TrainingSession[],
): { text: string; totalTrimp: number } {
  if (sessions.length === 0) {
    return { text: `Month ${mk}: no sessions logged.`, totalTrimp: 0 };
  }
  const totalTrimp = sessions.reduce((sum, s) => sum + (s.trimpScore ?? 0), 0);
  const totalMin = Math.round(
    sessions.reduce((sum, s) => sum + s.duration, 0) / 60,
  );
  const avgHR = Math.round(
    sessions.reduce((sum, s) => sum + s.averageHeartRate, 0) / sessions.length,
  );
  const typeList = [...new Set(sessions.map(s => s.type))].join(', ');
  const weeksActive = new Set(sessions.map(s => weekKey(new Date(s.date))))
    .size;
  const text =
    `Month ${mk}: ${sessions.length} sessions | ${weeksActive} active weeks | ` +
    `${totalMin}min total | avg HR ${avgHR}bpm | TRIMP ${Math.round(
      totalTrimp,
    )} | ${typeList}`;
  return { text, totalTrimp };
}

// ─── Service ──────────────────────────────────────────────────────────────────

class SummaryComputeService {
  private get db() {
    return databaseService.getDb();
  }

  /**
   * Computes and persists the session summary and regenerates the weekly +
   * monthly summary rows for the period this session belongs to.
   *
   * Call this immediately after inserting a new session.
   */
  async recomputeForSession(session: TrainingSession): Promise<void> {
    const date = new Date(session.date);
    const wk = weekKey(date);
    const mk = monthKey(date);
    const now = new Date().toISOString();

    try {
      // ── Session summary ──
      const sessionText = formatSessionSummary(session);
      await this.db.execute(
        `INSERT OR REPLACE INTO session_summaries
          (session_id, summary_text, week_key, month_key, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [String(session.id), sessionText, wk, mk, now],
      );

      // ── Weekly summary (recompute entire week) ──
      await this.recomputeWeek(wk);

      // ── Monthly summary (recompute entire month) ──
      await this.recomputeMonth(mk);
    } catch (e) {
      logger.error('[SummaryComputeService] recomputeForSession failed', { e });
    }
  }

  async recomputeWeek(wk: string): Promise<void> {
    const result = await this.db.execute(
      'SELECT session_id FROM session_summaries WHERE week_key = ?',
      [wk],
    );
    const ids = (result.rows ?? []).map((r: any) => r.session_id as string);
    const sessions = await this.fetchSessionsById(ids);
    const { text, totalTrimp } = formatWeeklySummary(wk, sessions);
    await this.db.execute(
      `INSERT OR REPLACE INTO weekly_summaries
        (week_key, summary_text, total_trimp, session_count, computed_at)
       VALUES (?, ?, ?, ?, ?)`,
      [wk, text, totalTrimp, sessions.length, new Date().toISOString()],
    );
  }

  async recomputeMonth(mk: string): Promise<void> {
    const result = await this.db.execute(
      'SELECT session_id FROM session_summaries WHERE month_key = ?',
      [mk],
    );
    const ids = (result.rows ?? []).map((r: any) => r.session_id as string);
    const sessions = await this.fetchSessionsById(ids);
    const { text, totalTrimp } = formatMonthlySummary(mk, sessions);
    await this.db.execute(
      `INSERT OR REPLACE INTO monthly_summaries
        (month_key, summary_text, total_trimp, session_count, computed_at)
       VALUES (?, ?, ?, ?, ?)`,
      [mk, text, totalTrimp, sessions.length, new Date().toISOString()],
    );
  }

  /** Retrieves the pre-computed text for a week. Returns null if not yet computed. */
  async getWeeklySummaryText(wk: string): Promise<string | null> {
    const result = await this.db.execute(
      'SELECT summary_text FROM weekly_summaries WHERE week_key = ?',
      [wk],
    );
    const row = result.rows?.[0];
    return row ? (row.summary_text as string) : null;
  }

  /** Retrieves the pre-computed text for a month. Returns null if not yet computed. */
  async getMonthlySummaryText(mk: string): Promise<string | null> {
    const result = await this.db.execute(
      'SELECT summary_text FROM monthly_summaries WHERE month_key = ?',
      [mk],
    );
    const row = result.rows?.[0];
    return row ? (row.summary_text as string) : null;
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private async fetchSessionsById(ids: string[]): Promise<TrainingSession[]> {
    if (!ids.length) return [];
    const all = await sessionRepository.getAll();
    const idSet = new Set(ids);
    return all.filter(s => idSet.has(String(s.id)));
  }
}

export const summaryComputeService = new SummaryComputeService();
export { weekKey as computeWeekKey, monthKey as computeMonthKey };

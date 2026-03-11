/**
 * SessionRepository.ts
 *
 * All reads and writes for TrainingSession objects go through this class.
 * Backed by the encrypted SQLite database managed by DatabaseService.
 *
 * Public API
 * ──────────
 *  insert(session, isSeeded?)           — single session upsert
 *  upsertBatch(sessions[], isSeeded?)   — bulk upsert in a transaction
 *  getByDateRange(from, to, types?)     — date-filtered query (used by QueryParser path)
 *  getRecent(limit, types?)             — most recent N sessions
 *  getAll()                             — all sessions, oldest→newest
 *  deleteSeeded()                       — remove DevScreen seed data
 *  deleteAll()                          — wipe all sessions + summaries
 *  count()                              — total session count
 */

import { databaseService } from './DatabaseService';
import { TrainingSession, TrainingType } from '../types/training';
import { logger } from '../utils/logger';

// ─── Row ↔ Domain mapping ─────────────────────────────────────────────────────

/** Maps a SQL result row (plain object) to a TrainingSession domain object. */
function rowToSession(row: any): TrainingSession {
  return {
    id: row.id,
    userId: row.user_id ?? '',
    date: new Date(row.date),
    startTime: row.start_time ? new Date(row.start_time) : new Date(row.date),
    endTime: row.end_time ? new Date(row.end_time) : new Date(row.date),
    duration: row.duration ?? 0,
    type: row.type as TrainingType,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    averageHeartRate: row.avg_hr ?? 0,
    maxHeartRate: row.max_hr ?? 0,
    minHeartRate: row.min_hr ?? 0,
    trimpScore: row.trimp_score ?? undefined,
    trainingLoad: row.training_load ?? undefined,
    calories: row.calories ?? undefined,
    distance: row.distance ?? undefined,
    pace: row.pace ?? undefined,
    elevation: row.elevation ?? undefined,
    perceivedEffort: row.perceived_effort ?? undefined,
    sessionRating: row.session_rating ?? undefined,
    notes: row.notes ?? undefined,
    heartRateData: row.heart_rate_data ? JSON.parse(row.heart_rate_data) : [],
    zoneSummary: row.zone_summary ? JSON.parse(row.zone_summary) : [],
  };
}

/** INSERT OR REPLACE SQL for a single session. */
const UPSERT_SQL = `
  INSERT OR REPLACE INTO sessions
    (id, user_id, date, start_time, end_time, duration, type, title,
     description, avg_hr, max_hr, min_hr, trimp_score, training_load,
     calories, distance, pace, elevation, perceived_effort, session_rating,
     notes, is_seeded, heart_rate_data, zone_summary)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`;

function sessionToParams(
  s: TrainingSession,
  isSeeded: boolean,
): (string | number | null)[] {
  return [
    String(s.id),
    s.userId ?? null,
    new Date(s.date).toISOString(),
    s.startTime ? new Date(s.startTime).toISOString() : null,
    s.endTime ? new Date(s.endTime).toISOString() : null,
    s.duration ?? 0,
    String(s.type),
    s.title ?? null,
    s.description ?? null,
    s.averageHeartRate ?? 0,
    s.maxHeartRate ?? 0,
    s.minHeartRate ?? 0,
    s.trimpScore ?? null,
    s.trainingLoad ?? null,
    s.calories ?? null,
    s.distance ?? null,
    s.pace ?? null,
    s.elevation ?? null,
    s.perceivedEffort ?? null,
    s.sessionRating ?? null,
    s.notes ?? null,
    isSeeded ? 1 : 0,
    s.heartRateData?.length ? JSON.stringify(s.heartRateData) : null,
    s.zoneSummary?.length ? JSON.stringify(s.zoneSummary) : null,
  ];
}

// ─── Type filter helper ───────────────────────────────────────────────────────

/**
 * Returns a SQL fragment and bound parameters for `AND type IN (?, …)`.
 * Using positional parameters prevents SQL injection even if the runtime
 * type values were somehow user-controlled.
 */
function typeFilterParam(types?: TrainingType[] | null): {
  clause: string;
  params: string[];
} {
  if (!types?.length) return { clause: '', params: [] };
  const placeholders = types.map(() => '?').join(', ');
  return {
    clause: ` AND type IN (${placeholders})`,
    params: types.map(String),
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

class SessionRepository {
  private get db() {
    return databaseService.getDb();
  }

  // ── Writes ──────────────────────────────────────────────────────────────────

  /** Upserts a single session. */
  async insert(session: TrainingSession, isSeeded = false): Promise<void> {
    try {
      await this.db.execute(UPSERT_SQL, sessionToParams(session, isSeeded));
    } catch (e) {
      logger.error('[SessionRepository] insert failed', { e });
      throw e;
    }
  }

  /**
   * Upserts a batch of sessions in a single transaction.
   * Safe to call with large arrays — all-or-nothing on failure.
   */
  async upsertBatch(
    sessions: TrainingSession[],
    isSeeded = false,
  ): Promise<void> {
    if (!sessions.length) return;
    try {
      await this.db.execute('BEGIN');
      try {
        for (const s of sessions) {
          await this.db.execute(UPSERT_SQL, sessionToParams(s, isSeeded));
        }
        await this.db.execute('COMMIT');
      } catch (txErr) {
        await this.db.execute('ROLLBACK');
        throw txErr;
      }
    } catch (e) {
      logger.error('[SessionRepository] upsertBatch failed', { e });
      throw e;
    }
  }

  // ── Reads ────────────────────────────────────────────────────────────────────

  /**
   * Returns all sessions in a date range, optionally filtered by type.
   * Results are in chronological order (oldest → newest).
   */
  async getByDateRange(
    from: Date,
    to: Date,
    types?: TrainingType[] | null,
  ): Promise<TrainingSession[]> {
    const { clause, params } = typeFilterParam(types);
    const sql = `
      SELECT * FROM sessions
      WHERE date >= ? AND date <= ?
      ${clause}
      ORDER BY date ASC
    `;
    const result = await this.db.execute(sql, [
      from.toISOString(),
      to.toISOString(),
      ...params,
    ]);
    return (result.rows ?? []).map(rowToSession);
  }

  /**
   * Returns the most recent N sessions, optionally filtered by type.
   * The SQL ORDER BY ensures the last-N by date; results are returned
   * chronologically (oldest → newest) so context blocks read naturally.
   */
  async getRecent(
    limit: number,
    types?: TrainingType[] | null,
  ): Promise<TrainingSession[]> {
    const { clause, params } = typeFilterParam(types);
    const sql = `
      SELECT * FROM (
        SELECT * FROM sessions
        WHERE 1=1 ${clause}
        ORDER BY date DESC
        LIMIT ?
      ) ORDER BY date ASC
    `;
    const result = await this.db.execute(sql, [...params, limit]);
    return (result.rows ?? []).map(rowToSession);
  }

  /**
   * Returns ALL sessions, oldest → newest.
   * Used for ACWR/streak computations that require the full history.
   */
  async getAll(): Promise<TrainingSession[]> {
    const result = await this.db.execute(
      'SELECT * FROM sessions ORDER BY date ASC',
    );
    return (result.rows ?? []).map(rowToSession);
  }

  /**
   * Returns sessions by a list of IDs, oldest → newest.
   * More efficient than getAll() + JS filter when the ID set is known.
   */
  async getByIds(ids: string[]): Promise<TrainingSession[]> {
    if (!ids.length) return [];
    const placeholders = ids.map(() => '?').join(', ');
    const result = await this.db.execute(
      `SELECT * FROM sessions WHERE id IN (${placeholders}) ORDER BY date ASC`,
      ids,
    );
    return (result.rows ?? []).map(rowToSession);
  }

  /** Total session count. */
  async count(): Promise<number> {
    const result = await this.db.execute(
      'SELECT COUNT(*) as cnt FROM sessions',
    );
    return (result.rows?.[0]?.cnt as number) ?? 0;
  }

  // ── Deletes ──────────────────────────────────────────────────────────────────

  /** Removes all seed data generated by DevScreen. */
  async deleteSeeded(): Promise<void> {
    await this.db.execute('DELETE FROM sessions WHERE is_seeded = 1');
    // Summaries may now be stale — full recompute is handled by caller if needed
    await this.db.execute('DELETE FROM session_summaries');
    await this.db.execute('DELETE FROM weekly_summaries');
    await this.db.execute('DELETE FROM monthly_summaries');
  }

  /** Removes all sessions and all summary data. */
  async deleteAll(): Promise<void> {
    await this.db.execute('BEGIN');
    try {
      await this.db.execute('DELETE FROM sessions');
      await this.db.execute('DELETE FROM session_summaries');
      await this.db.execute('DELETE FROM weekly_summaries');
      await this.db.execute('DELETE FROM monthly_summaries');
      await this.db.execute('COMMIT');
    } catch (e) {
      await this.db.execute('ROLLBACK');
      throw e;
    }
  }
}

export const sessionRepository = new SessionRepository();

/**
 * DatabaseService.ts
 *
 * Singleton that owns the encrypted SQLite connection for the app.
 *
 * Security model:
 *  • Database is encrypted at-rest with SQLCipher (AES-256).
 *  • The encryption key is generated once, then stored in the iOS Keychain /
 *    Android Keystore via react-native-encrypted-storage.
 *  • Session data never lands in plaintext on disk.
 *
 * Call `databaseService.initialize()` once at app boot (AppContainer),
 * before any SessionRepository calls.
 */

import 'react-native-get-random-values';
import {
  OPSQLite,
  IOS_LIBRARY_PATH,
  ANDROID_DATABASE_PATH,
} from '@op-engineering/op-sqlite';
import type { DB } from '@op-engineering/op-sqlite';
import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { secureRead, secureRemove } from '../utils/secureStorage';
import type { TrainingSession } from '../types/training';
import { logger } from '../utils/logger';

// ─── Constants ────────────────────────────────────────────────────────────────

const DB_NAME = 'polar_sessions.db';
const DB_KEY_STORAGE = 'polar_db_key_v1';

/** Legacy EncryptedStorage keys that are migrated to SQLite on first launch. */
const LEGACY_SESSIONS_KEY = 'sessions_history';
const LEGACY_SEEDED_KEY = 'seeded_training_sessions';

// ─── Schema DDL ───────────────────────────────────────────────────────────────

/**
 * All DDL statements executed in order on first open / schema creation.
 * Each must be idempotent (CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS).
 */
const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS sessions (
    id               TEXT PRIMARY KEY,
    user_id          TEXT,
    date             TEXT NOT NULL,
    start_time       TEXT,
    end_time         TEXT,
    duration         INTEGER NOT NULL DEFAULT 0,
    type             TEXT NOT NULL,
    title            TEXT,
    description      TEXT,
    avg_hr           REAL NOT NULL DEFAULT 0,
    max_hr           REAL NOT NULL DEFAULT 0,
    min_hr           REAL NOT NULL DEFAULT 0,
    trimp_score      REAL,
    training_load    REAL,
    calories         REAL,
    distance         REAL,
    pace             REAL,
    elevation        REAL,
    perceived_effort INTEGER,
    session_rating   INTEGER,
    notes            TEXT,
    is_seeded        INTEGER NOT NULL DEFAULT 0,
    heart_rate_data  TEXT,
    zone_summary     TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions (date DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions (type)`,

  `CREATE TABLE IF NOT EXISTS session_summaries (
    session_id  TEXT PRIMARY KEY,
    summary_text TEXT NOT NULL,
    week_key    TEXT NOT NULL,
    month_key   TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS weekly_summaries (
    week_key      TEXT PRIMARY KEY,
    summary_text  TEXT NOT NULL,
    total_trimp   REAL NOT NULL DEFAULT 0,
    session_count INTEGER NOT NULL DEFAULT 0,
    computed_at   TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS monthly_summaries (
    month_key     TEXT PRIMARY KEY,
    summary_text  TEXT NOT NULL,
    total_trimp   REAL NOT NULL DEFAULT 0,
    session_count INTEGER NOT NULL DEFAULT 0,
    computed_at   TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS schema_meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
];

// ─── Key management ───────────────────────────────────────────────────────────

/**
 * Retrieves the SQLCipher encryption key from Keychain/Keystore,
 * generating and storing it on first launch using crypto.getRandomValues.
 */
async function getOrCreateDbKey(): Promise<string> {
  try {
    const existing = await EncryptedStorage.getItem(DB_KEY_STORAGE);
    if (existing) return existing;
  } catch {
    // EncryptedStorage unavailable on this device/simulator — fall through
  }

  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const key = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  try {
    await EncryptedStorage.setItem(DB_KEY_STORAGE, key);
  } catch (e) {
    logger.error('[DatabaseService] Could not persist DB key', { e });
  }
  return key;
}

// ─── Migration helper ─────────────────────────────────────────────────────────

/** Maps a TrainingSession to a flat SQL-insert tuple (positional params). */
function sessionToRow(
  s: TrainingSession,
  isSeeded: boolean,
): [string, (string | number | null)[]] {
  return [
    `INSERT OR IGNORE INTO sessions
      (id, user_id, date, start_time, end_time, duration, type, title,
       description, avg_hr, max_hr, min_hr, trimp_score, training_load,
       calories, distance, pace, elevation, perceived_effort, session_rating,
       notes, is_seeded, heart_rate_data, zone_summary)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      String(s.id),
      s.userId ?? null,
      // Legacy RecordingSession objects used `startTime` instead of `date`
      new Date(
        (s.date ?? (s as any).startTime ?? Date.now()) as unknown as string,
      ).toISOString(),
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
      s.heartRateData ? JSON.stringify(s.heartRateData) : null,
      s.zoneSummary ? JSON.stringify(s.zoneSummary) : null,
    ],
  ];
}

/**
 * One-time migration: reads legacy EncryptedStorage JSON blobs into SQLite,
 * then removes the old keys so they are never read again.
 */
async function runMigrationV1(db: DB): Promise<void> {
  const metaResult = await db.execute(
    "SELECT value FROM schema_meta WHERE key = 'migration_v1_done'",
  );
  if ((metaResult.rows ?? []).length > 0) return; // already done

  logger.info(
    '[DatabaseService] Running migration v1: EncryptedStorage → SQLite',
  );

  try {
    const [realSessions, seededSessions] = await Promise.all([
      secureRead<TrainingSession[]>(LEGACY_SESSIONS_KEY).then(v => v ?? []),
      secureRead<TrainingSession[]>(LEGACY_SEEDED_KEY).then(v => v ?? []),
    ]);

    const allCount = realSessions.length + seededSessions.length;

    if (allCount > 0) {
      await db.execute('BEGIN');
      try {
        for (const s of realSessions) {
          const [sql, params] = sessionToRow(s, false);
          await db.execute(sql, params);
        }
        for (const s of seededSessions) {
          const [sql, params] = sessionToRow(s, true);
          await db.execute(sql, params);
        }
        await db.execute('COMMIT');
      } catch (txErr) {
        await db.execute('ROLLBACK');
        throw txErr;
      }
      logger.info(`[DatabaseService] Migrated ${allCount} sessions to SQLite`);
    }

    // Remove legacy keys — data is now in SQLite
    await Promise.allSettled([
      secureRemove(LEGACY_SESSIONS_KEY),
      secureRemove(LEGACY_SEEDED_KEY),
    ]);
  } catch (e) {
    // Migration failure is non-fatal — the app still works, just re-attempts next launch
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[DatabaseService] Migration v1 failed', { error: msg });
    return;
  }

  await db.execute(
    "INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('migration_v1_done', '1')",
  );
}

// ─── Service ──────────────────────────────────────────────────────────────────

class DatabaseService {
  private static _instance: DatabaseService;
  private _db: DB | null = null;

  static getInstance(): DatabaseService {
    if (!DatabaseService._instance) {
      DatabaseService._instance = new DatabaseService();
    }
    return DatabaseService._instance;
  }

  /**
   * Opens (or creates) the encrypted database and runs all pending migrations.
   * Safe to call multiple times — subsequent calls are no-ops.
   */
  async initialize(): Promise<void> {
    if (this._db) return;

    const encryptionKey = await getOrCreateDbKey();
    const location =
      Platform.OS === 'ios' ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH;

    // SQLCipher does not throw on open() with a wrong key — it throws on the
    // first SQL execution. Wrap DDL to detect and recover from stale DB files
    // (e.g. Keychain wiped without deleting the encrypted file on disk).
    let rawDb = OPSQLite.open({ name: DB_NAME, location, encryptionKey });

    try {
      // PRAGMA user_version reads page 1 of the DB file.  SQLCipher will throw
      // 'file is not a database' here if the key doesn't match the file — this
      // is more reliable than relying on CREATE TABLE to surface the mismatch.
      await rawDb.execute('PRAGMA user_version;');
      for (const ddl of DDL_STATEMENTS) {
        await rawDb.execute(ddl);
      }
    } catch (ddlErr) {
      // Key/file mismatch — delete the stale encrypted file and start fresh.
      logger.warn('[DatabaseService] Schema DDL failed — recreating DB', {
        ddlErr,
      });
      try {
        // Call delete() with no args so op-sqlite uses the location it stored
        // at open() time — avoids path-format mismatches.
        rawDb.delete();
      } catch {}
      rawDb = OPSQLite.open({ name: DB_NAME, location, encryptionKey });
      for (const ddl of DDL_STATEMENTS) {
        await rawDb.execute(ddl);
      }
    }

    this._db = rawDb;

    await runMigrationV1(rawDb);
  }

  /**
   * Deletes the DB file from disk and nulls the connection handle.
   * Call this BEFORE wiping EncryptedStorage so the encryption key and file
   * stay in sync — otherwise the next launch can't decrypt the stale file.
   * After this call, `initialize()` will create a fresh empty database.
   */
  async closeAndDelete(): Promise<void> {
    if (this._db) {
      try {
        // Call delete() with no args so op-sqlite uses the location it stored
        // at open() time — avoids path-format mismatches with IOS_LIBRARY_PATH.
        this._db.delete();
      } catch (e) {
        logger.warn('[DatabaseService] Failed to delete DB file', { e });
      }
      this._db = null;
    }
  }

  /**
   * Returns the open database handle.
   * Throws if `initialize()` has not been called.
   */
  getDb(): DB {
    if (!this._db) {
      throw new Error(
        '[DatabaseService] Database not initialized. Call initialize() at app start.',
      );
    }
    return this._db;
  }

  /**
   * DEV ONLY — nulls the in-memory handle without touching the file.
   * Used by DevScreen to simulate the stale-DB scenario (key deleted but file
   * remains) so the recovery path in initialize() can be manually verified.
   */
  _simulateStaleForTest(): void {
    if (__DEV__) {
      try {
        this._db?.close();
      } catch {}
      this._db = null;
    }
  }
}

export const databaseService = DatabaseService.getInstance();

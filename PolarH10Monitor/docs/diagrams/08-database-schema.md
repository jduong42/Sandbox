# Database Schema (ER Diagram)

`polar_sessions.db` — SQLCipher AES-256 encrypted SQLite database.

```mermaid
erDiagram
    sessions {
        TEXT id PK
        TEXT user_id
        TEXT date "NOT NULL — ISO date string"
        TEXT start_time
        TEXT end_time
        INT  duration "seconds, DEFAULT 0"
        TEXT type "NOT NULL — e.g. Running, Cycling"
        TEXT title
        TEXT description
        REAL avg_hr
        REAL max_hr
        REAL min_hr
        REAL trimp_score
        REAL training_load
        REAL calories
        REAL distance
        REAL pace
        REAL elevation
        INT  perceived_effort "1–10 RPE"
        INT  session_rating
        TEXT notes
        INT  is_seeded "DEFAULT 0 — 1 = dev seeded data"
        TEXT heart_rate_data "JSON array of HR samples"
        TEXT zone_summary "JSON zone breakdown"
    }

    session_summaries {
        TEXT session_id PK
        TEXT summary_text "NOT NULL"
        TEXT week_key "YYYY-Www"
        TEXT month_key "YYYY-MM"
        TEXT updated_at "ISO timestamp"
    }

    weekly_summaries {
        TEXT week_key PK "YYYY-Www"
        TEXT summary_text "NOT NULL"
        REAL total_trimp
        INT  session_count
        TEXT computed_at "ISO timestamp"
    }

    monthly_summaries {
        TEXT month_key PK "YYYY-MM"
        TEXT summary_text "NOT NULL"
        REAL total_trimp
        INT  session_count
        TEXT computed_at "ISO timestamp"
    }

    schema_meta {
        TEXT key PK
        TEXT value "NOT NULL"
    }

    sessions ||--o| session_summaries  : "has AI summary"
    sessions }o--o| weekly_summaries   : "aggregated into"
    sessions }o--o| monthly_summaries  : "aggregated into"
```

## Indexes

| Index | Table | Column(s) | Purpose |
|---|---|---|---|
| `idx_sessions_date` | sessions | `date DESC` | Fast date-range queries (ACWR, streak) |
| `idx_sessions_type` | sessions | `type` | Filter by workout type |

## Migration

`schema_meta` stores a `migration_v1_done` flag. On first run after the
SQLite migration, all sessions are read from the legacy `EncryptedStorage`
JSON blobs (`sessions_history`, `seeded_training_sessions`), inserted into
SQLite in a transaction, and the old keys are deleted. Subsequent launches
skip this entirely.

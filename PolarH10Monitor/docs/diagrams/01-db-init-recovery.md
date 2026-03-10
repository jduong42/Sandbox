# DB Initialisation & Stale-Key Recovery

`DatabaseService.initialize()` is called once at app boot and again after a wipe.
SQLCipher silently accepts any key on `open()` — the mismatch is only detectable
on the first SQL operation (`PRAGMA user_version`).

```mermaid
sequenceDiagram
    participant App
    participant DatabaseService
    participant EncryptedStorage
    participant OPSQLite

    App->>DatabaseService: initialize()
    note over DatabaseService: guard: if (_db) return

    DatabaseService->>EncryptedStorage: getItem('polar_db_key_v1')

    alt key exists in Keychain
        EncryptedStorage-->>DatabaseService: existing 32-byte hex key
    else key missing (first launch or wipe)
        EncryptedStorage-->>DatabaseService: null
        DatabaseService->>DatabaseService: generate 32-byte random hex key
        DatabaseService->>EncryptedStorage: setItem('polar_db_key_v1', newKey)
    end

    DatabaseService->>OPSQLite: open({ name, location, encryptionKey })
    OPSQLite-->>DatabaseService: rawDb handle

    DatabaseService->>OPSQLite: PRAGMA user_version

    alt key matches file (normal path)
        OPSQLite-->>DatabaseService: ok (returns version number)
        loop 5x DDL statements
            DatabaseService->>OPSQLite: CREATE TABLE IF NOT EXISTS ...
        end
        DatabaseService->>DatabaseService: runMigrationV1()
        note over DatabaseService: migrate legacy EncryptedStorage<br/>JSON blobs → SQLite (one-time)
        DatabaseService-->>App: ✅ ready
    else key/file mismatch (stale encrypted file)
        OPSQLite-->>DatabaseService: ❌ "file is not a database"
        note over DatabaseService: Recovery path triggered
        DatabaseService->>OPSQLite: rawDb.delete() — remove stale file
        DatabaseService->>OPSQLite: open({ name, location, encryptionKey })
        OPSQLite-->>DatabaseService: fresh rawDb handle
        loop 5x DDL statements
            DatabaseService->>OPSQLite: CREATE TABLE IF NOT EXISTS ...
        end
        DatabaseService-->>App: ✅ ready (empty DB, data unrecoverable)
    end
```

## When does recovery trigger?

| Scenario                                      | Cause                                                          |
| --------------------------------------------- | -------------------------------------------------------------- |
| Device restore from backup                    | iOS restores the `.db` file but generates a new Keychain entry |
| `handleWipeEncryptedStorage` crash mid-flight | Key wiped but file survived                                    |
| Dev — "Simulate Stale DB" button              | Manual test: key deleted, file left on disk                    |

# Full Wipe Flow

`DevScreen → "Wipe EncryptedStorage"` performs a safe, ordered teardown:
DB file deleted **before** the key is wiped so key and file are never
simultaneously present in a mismatched state. A fresh DB is created
immediately so still-mounted screens don't hit "Database not initialized".

```mermaid
sequenceDiagram
    participant User
    participant DevScreen
    participant DatabaseService
    participant EncryptedStorage
    participant authStore
    participant MountedScreens

    User->>DevScreen: tap "Wipe EncryptedStorage"
    DevScreen-->>User: Alert "Wipe everything? This cannot be undone."

    alt User cancels
        User->>DevScreen: tap Cancel
    else User confirms
        User->>DevScreen: tap "Wipe"

        DevScreen->>DatabaseService: closeAndDelete()
        note over DatabaseService: Step 1 — remove DB file BEFORE key
        DatabaseService->>DatabaseService: _db.delete() — deletes polar_sessions.db from disk
        DatabaseService->>DatabaseService: _db = null
        DatabaseService-->>DevScreen: done

        DevScreen->>EncryptedStorage: clear()
        note over EncryptedStorage: Step 2 — wipe ALL Keychain items
        note over EncryptedStorage: polar_db_key_v1 deleted<br/>app-user deleted
        EncryptedStorage-->>DevScreen: done

        DevScreen->>DatabaseService: initialize()
        note over DatabaseService: Step 3 — re-create DB immediately<br/>so still-mounted screens work
        DatabaseService->>EncryptedStorage: getItem('polar_db_key_v1')
        EncryptedStorage-->>DatabaseService: null
        DatabaseService->>DatabaseService: generate new 32-byte key
        DatabaseService->>EncryptedStorage: setItem('polar_db_key_v1', newKey)
        DatabaseService->>DatabaseService: open new empty DB + run DDL
        DatabaseService-->>DevScreen: ready (empty DB)

        DevScreen->>authStore: logout()
        note over authStore: Step 4 — clear in-memory auth state
        authStore->>authStore: user = null, isAuthenticated = false
        authStore-->>DevScreen: done

        DevScreen->>DevScreen: refreshKeys()
        DevScreen-->>User: Keychain key list now empty

        note over MountedScreens: useFocusEffect / useEffect re-fires on<br/>tab switch — queries empty DB → shows empty state
        MountedScreens-->>User: CoachBanner shows "Welcome!"<br/>Recent Activities shows empty state
    end
```

## Why this ordering matters

```
❌ Wrong order: clear() → closeAndDelete()
   Key gone first → file still encrypted with old key
   → next launch: new key generated → PRAGMA throws → recovery fires (data loss)

✅ Correct order: closeAndDelete() → clear() → initialize()
   File gone before key is gone
   → no stale file can exist → clean slate guaranteed
```

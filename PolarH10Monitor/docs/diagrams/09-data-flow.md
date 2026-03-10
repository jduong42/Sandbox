# End-to-End Data Flow

From the Polar H10 sensor through BLE, storage, analytics, and into the AI coach.

```mermaid
flowchart LR
    subgraph HW [Hardware]
        PH10([Polar H10\nHR Sensor])
    end

    subgraph BLE [BLE Layer]
        BLESvc([BLEService\nreact-native-ble-plx])
    end

    subgraph REC [Recording]
        SRSvc([SessionRecordingService])
        Hook([useSessionRecording\nhook])
    end

    subgraph DB [Storage]
        SR([SessionRepository\nSQLite CRUD])
        SQLite[(polar_sessions.db\nSQLCipher AES-256)]
        KC([iOS Keychain\npolar_db_key_v1])
    end

    subgraph AN [Analytics]
        AS([AnalyticsService\nTRIMP enrichment])
        ACWR([ACWRCalculator\nacute:chronic ratio\nrisk classification])
        STR([StreakCalculator\nstreak + milestones])
    end

    subgraph AI [AI Layer]
        TCS([TrainingContextService\nprompt context builder])
        LLM([llama.rn\nLlama 3.2 3B Q4_K_M\nfully on-device GGUF])
    end

    subgraph UI [UI]
        CB([CoachBanner\ncontextual advice card])
        CHAT([FigmaAIChatScreen\nstreaming chat])
        HOME([FigmaHomeScreen\ndashboard])
    end

    PH10 -- "BLE GATT\nHR characteristic" --> BLESvc
    BLESvc -- "raw HR stream" --> SRSvc
    SRSvc --> Hook
    Hook -- "insert on stop" --> SR
    SR --> SQLite
    KC -. "decryption key" .-> SQLite

    SQLite -- "SELECT recent 90 days" --> SR
    SR -- "TrainingSession[]" --> AS
    AS -- "TRIMP-enriched sessions" --> ACWR
    AS -- "sessions" --> STR
    ACWR -- "risk + loads" --> TCS
    STR -- "streak + milestones" --> TCS
    TCS -- "structured prompt" --> LLM
    LLM -- "streamed tokens" --> CHAT

    ACWR -- "risk level" --> CB
    STR -- "streak data" --> CB
    CB -- "prefill question\nnavigation" --> CHAT

    SR -- "getRecent(5)" --> HOME
    AS -- "enriched sessions" --> HOME
```

## Key design decisions

| Decision | Reason |
|---|---|
| All inference on-device (`llama.rn`) | No cloud dependency, no API key, works offline |
| SQLCipher page-level encryption | Health data encrypted even if device storage is accessed directly |
| `getRecent(90)` for ACWR | Covers the 28-day chronic window with buffer; avoids loading full history |
| TRIMP enriched before ACWR | ACWR needs a continuous load signal; TRIMP provides it from raw HR data |
| `TrainingContextService` as prompt layer | Decouples analytics logic from LLM prompting format |

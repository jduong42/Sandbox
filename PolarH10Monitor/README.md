# PolarH10Monitor

A React Native app for Polar H10 athletes — real-time heart rate monitoring, evidence-based training load analytics, and an on-device AI coach that runs entirely offline. No cloud. No subscriptions. Open source.

> Built as a personal training tool and portfolio project. All AI inference, analytics, and data storage run locally on device.

---

## 📱 Features

### Heart Rate & BLE

- **Bluetooth LE** — Connects to Polar H10 sensors via `react-native-ble-plx`
- **Real-time Monitoring** — Live heart rate display during training
- **Session Recording** — Start/stop sessions with full HR stream capture
- **Device History** — Persistent connection history with auto-reconnect

### Training Load Analytics

- **TRIMP (Banister 1991)** — Training impulse score per session, sex-adjusted
- **ACWR (Gabbett 2016)** — Acute:Chronic Workload Ratio with risk classification: `detraining` / `optimal` / `moderate_risk` / `high_risk`
- **Monotony & Strain (Foster 2001)** — Weekly training variation index
- **Karvonen Heart Rate Zones** — Computed from real resting HR and age-predicted max HR
- **TDEE** — Mifflin-St Jeor + optional Katch-McArdle when body fat % is known

### AI Coach (On-Device)

- **Llama 3.2 3B GGUF** — Fully offline inference via `llama.rn`; no API key, no internet
- **Streaming Chat** — Real-time token streaming with rendered markdown output
- **Sports Science Context** — Every prompt is enriched with TRIMP, ACWR, zones, and physiology
- **Quick Prompt Chips** — One-tap presets: "What should I do today?", "Am I making progress?", etc.
- **Summary Range Chips** — Ask for a weekly / 2-week / monthly / 3-month recap in one tap
- **Prefill Navigation** — CoachBanner suggestions deep-link directly into the chat with the question pre-filled

### Coach Dashboard

- **CoachBanner** — Contextual advice card on the home screen; priority logic: no data → long absence → streak celebration → ACWR-based load guidance. Tapping opens the AI chat with the suggestion pre-filled
- **StreakCard** — Current and best streak, total session count, milestone progress dots
- **Milestones** — Session milestones (1, 5, 10, 25, 50, 100) and streak milestones (3, 7, 14, 30 days)
- **Training Load Card** — ACWR risk badge + monotony/strain summary

### User & Profile

- **Local Auth** — Sign up/log in (name, email, password) — no backend required
- **Physiology Store** — Sex, age, height, weight, resting HR, max HR, activity level, body fat %
- **SQLCipher Encrypted Database** — All training sessions and summaries stored in an encrypted SQLite database (`@op-engineering/op-sqlite` + SQLCipher). The 256-bit database key is generated once and stored in the OS secure store (iOS Keychain / Android EncryptedSharedPreferences) via `react-native-encrypted-storage`
- **Crash-safe key/file recovery** — If the encryption key and DB file fall out of sync (device restore, Keychain wipe), `DatabaseService.initialize()` detects the mismatch, deletes the undecryptable file, and recreates a clean empty database — preventing a permanent crash loop

### UX

- **Figma Design System** — Full dark/light theme rebuilt from Figma design files
- **Animated Toasts** — Slide-up success/error/warning notifications with auto-dismiss
- **Profile Modal** — Inline sign-up/login sheet from the home screen avatar

---

## 🏗 Architecture

```
src/
├── components/
│   ├── figma/
│   │   ├── CoachBanner.tsx       # Contextual home screen advice + deep-link to chat
│   │   ├── StreakCard.tsx        # Streak + milestone progress display
│   │   ├── TrainingLoadCard.tsx  # ACWR risk + monotony/strain
│   │   ├── ChatMessage.tsx       # Streaming markdown message bubble
│   │   └── …
│   └── common/                  # Toast, ErrorBoundary, NativeIcon, …
├── hooks/
│   ├── useBLEScanning.ts
│   └── useSessionRecording.ts
├── navigation/
│   ├── RootStackNavigator.ts    # Stack: Main tabs + ProfileSettings
│   ├── MainTabNavigator.ts      # Home / Workout / Chat / More / Dev*
│   └── NavigationTypes.ts
├── screens/
│   ├── FigmaHomeScreen.tsx      # Dashboard: banner + rings + streaks + load
│   ├── FigmaAIChatScreen.tsx    # LLM chat with chips, prefill, streaming
│   └── …
├── services/
│   ├── DatabaseService.ts         # SQLCipher DB lifecycle — open, DDL, migration, recovery
│   ├── SessionRepository.ts       # CRUD operations against the sessions table
│   ├── SummaryComputeService.ts   # Derives ACWR / streak / zone summaries from raw rows
│   ├── BLEService.ts
│   ├── SessionRecordingService.ts
│   ├── TrainingContextService.ts  # Builds enriched prompt context block
│   ├── LlamaTextGenerationService.ts
│   └── DeviceHistoryService.ts
├── store/
│   ├── authStore.ts             # Zustand — user session
│   └── physiologyStore.ts       # Zustand — physiology values
├── theme/
│   ├── figmaTheme.ts            # Dark/light design tokens
│   └── ThemeContext.tsx
├── utils/
│   ├── secureStorage.ts         # secureRead / secureWrite / secureRemove (AES-256)
│   ├── StreakCalculator.ts      # Streak + milestone computation from session history
│   ├── ACWRCalculator.ts        # ACWR, monotony, strain
│   ├── TRIMPCalculator.ts       # TRIMP Banister per session
│   └── CalorieCalculator.ts     # TDEE
└── prompts/
    └── sportsPrompts.ts         # Structured prompt templates with context injection
```

> **State**: Zustand v5 throughout. Object selectors use `useShallow` to prevent re-render loops.

---

## 📦 Key Dependencies

| Package                                     | Purpose                             |
| ------------------------------------------- | ----------------------------------- |
| `react-native-ble-plx`                      | Bluetooth LE (Polar H10)            |
| `llama.rn`                                  | On-device LLM inference (GGUF)      |
| `@op-engineering/op-sqlite`                 | SQLite engine with SQLCipher        |
| `zustand`                                   | State management                    |
| `react-native-encrypted-storage`            | OS-level secure storage (DB key)    |
| `react-native-get-random-values`            | `crypto.getRandomValues()` polyfill |
| `@react-native-async-storage/async-storage` | Storage fallback                    |
| `react-navigation`                          | Stack + bottom-tab navigation       |
| `react-native-linear-gradient`              | Gradient UI                         |
| `react-native-safe-area-context`            | Safe area insets                    |

---

## 🚀 Getting Started

> Complete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) before proceeding.

### 1. Install dependencies

```sh
npm install
```

### 2. iOS — install CocoaPods

```sh
bundle install          # first clone only
bundle exec pod install
```

> SQLCipher is enabled via `"op-sqlite": { "sqlcipher": true }` in `package.json`. CocoaPods picks this up automatically — no extra steps needed.

### 3. Start Metro

```sh
npm start
```

### 4. Run the app

```sh
npm run ios       # iOS simulator
npm run android   # Android emulator
```

---

## 🤖 AI Model Setup

The app bundles a GGUF model at `ios/model_q4km.gguf`. This file is **not tracked in git** (too large). To set up:

1. Download a Llama 3.2 3B Q4_K_M GGUF (e.g. from [HuggingFace](https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF))
2. Rename it to `model_q4km.gguf`
3. Place it in `ios/`
4. In Xcode, add it to the app bundle under **Copy Bundle Resources**

The AI badge on the chat screen will show **"Ready"** once the model initialises successfully.

---

## 🔒 Security

All health and session data is encrypted at rest:

- **Database**: `@op-engineering/op-sqlite` compiled with SQLCipher — the entire `.db` file is AES-256 encrypted at the page level
- **Encryption key**: a 32-byte random hex key generated on first launch, stored in the OS secure enclave via `react-native-encrypted-storage` (iOS Keychain / Android EncryptedSharedPreferences) under the key `polar_db_key_v1`
- **Key/file recovery**: if the Keychain is cleared without deleting the DB file (device restore, iCloud restore), `DatabaseService` detects the mismatch on the first SQL operation, deletes the undecryptable file, and recreates the schema — the app stays functional instead of crash-looping
- **Auth tokens**: user session data stored via `react-native-encrypted-storage` (never in plain AsyncStorage)

---

## 🔧 Troubleshooting

| Issue                               | Fix                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| `crypto.getRandomValues` error      | `import 'react-native-get-random-values'` must be the **first** import in `index.js`  |
| App opens empty after device restore | Expected — Keychain was cleared, DB key is gone. Recovery path recreates a fresh DB. |
| AI chat shows "Error"               | Confirm `model_q4km.gguf` is in `ios/` and added to Xcode bundle resources            |
| `Promise.allSettled` TS error       | `tsconfig.json` `lib` must include `"es2020"` or later                                |
| Infinite re-render (Zustand)        | Use `useShallow` for any selector returning an object                                 |
| BLE scan not finding device         | Ensure Bluetooth permission granted; Polar H10 must be in pairing mode                |
| SQLCipher not compiling             | Confirm `"op-sqlite": { "sqlcipher": true }` is in `package.json`, then re-run `pod install` |

---

## 🧪 Testing

```sh
npx jest               # run all tests
npx tsc --noEmit       # TypeScript check
```

Tests mock native modules (`react-native-ble-plx`, `llama.rn`, `react-native-encrypted-storage`, `react-native-fs`) so they run without a physical device or simulator.

---

## 🗺 Roadmap

- [ ] RPE 1–10 post-session rating
- [ ] BLE coaching cues during workout (real-time zone guidance)
- [ ] Weekly digest auto-generated by LLM
- [ ] Gamification badges for milestones
- [ ] Android BLE testing and polish

---

## 📄 License

MIT — free to use, fork, and modify.

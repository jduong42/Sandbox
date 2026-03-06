# Implementation Plan: Phased Training Data Pipeline Fix

**Created:** 6 March 2026  
**Status:** Ready for implementation

## Background

The app has correct TRIMP/ACWR math and a working local LLM, but the data pipeline
is broken in three ways:

- Physiology inputs (restingHR, maxHR, sex/gender) are hardcoded constants
- ACWR and training load are computed but never shown in the UI
- The workout screen is completely disconnected from real BLE — it shows fake
  device names, fake connection state, and saves no HR data

These are fixed in four small, independently commitable phases.

---

## Phase 1 — Fix Physiology Inputs for TRIMP & ACWR

**Goal:** TRIMP Banister uses real `restingHR`, `maxHR`, and `sex` from the user
profile. HR zones switch from % of maxHR to the more accurate Karvonen method.

### Steps

1. **Extend `PhysiologySettings`** in `src/store/physiologyStore.ts`

   - Add `restingHeartRate?: number` (default 60, valid range 30–100)
   - Add `maxHeartRate?: number | null` (null = derive as `220 − age`)
   - Both persist automatically via the existing EncryptedStorage Zustand config

2. **Add "Heart Rate" SectionCard** in `src/screens/FigmaProfileSettingsScreen.tsx`

   - Between Physical Attributes and Activity Level sections
   - Two `NumericField` rows with `unit="bpm"` (same component as Age/Height/Weight)
   - Max HR placeholder dynamically shows the `220 − age` estimate

3. **Add `sex` field to `UserProfile` type** in `src/types/training.ts`

   - Enables sex to flow through the analytics pipeline

4. **Fix `AnalyticsService.enrichSessionsWithTRIMP`** in `src/services/AnalyticsService.ts`

   - Replace hardcoded `gender: 'male'`, `restingHeartRate: 60`, and `maxHeartRate`
   - Use `usePhysiologyStore.getState().settings` reads (Zustand outside React)
   - Safe fallbacks: `'male'` / `60` / `220 − age` if fields are unset

5. **Fix `TrainingContextService.buildUserProfile`** in `src/services/TrainingContextService.ts`

   - Same pattern — replace hardcoded values on lines ~157–163 with live store reads

6. **Switch zones to Karvonen** in `src/services/TRIMPCalculator.ts`

   - `HeartRateZoneCalculator.calculateZoneThresholds()` already has the Karvonen path
   - Make it the default when `restingHR > 0`
   - Formula: `zoneMin = restingHR + (maxHR − restingHR) × fraction`

7. **Update DevScreen seeder** in `src/screens/DevScreen.tsx`

   - Pull `restingHR` / `maxHR` / `sex` from physiologyStore (lines ~107–108)

8. **Tests + commit**
   - Verify Banister TRIMP changes correctly with `sex = 'female'`
   - Verify Karvonen zone boundaries shift when `restingHR = 45`

---

## Phase 2 — Surface Training Load in the UI

**Goal:** Home screen shows ACWR risk, monotony, strain, and real session history.
A tappable detail modal explains every metric. Dummy data is a labeled fallback
when no real sessions exist.

### Steps

1. **Add monotony and strain to `ACWRCalculator`** in `src/utils/ACWRCalculator.ts`

   - `monotony` = mean(daily loads, 7 days) ÷ stdDev(daily loads, 7 days)
   - `strain` = 7-day acute load sum × monotony
   - Add both to the existing return object

2. **Create `TrainingLoadModal`** — `src/components/figma/TrainingLoadModal.tsx`

   - Slide-up modal sheet, opened by tapping the card
   - Shows: large ACWR value + color-coded risk zone label
   - Acute load (7-day Banister TRIMP sum) and chronic load (28-day normalized)
   - Monotony + Strain with a plain-language one-liner each
     - e.g. "Monotony measures how varied your training is. High monotony = same
       effort every day."
   - Visual risk scale bar with current zone highlighted
   - Risk zones: <0.8 detraining / 0.8–1.3 optimal / 1.3–1.5 moderate / >1.5 high

3. **Create `TrainingLoadCard`** — `src/components/figma/TrainingLoadCard.tsx`

   - Tappable summary card: ACWR value, color risk badge, acute/chronic numbers
   - `onPress` opens `TrainingLoadModal`
   - Placeholder state: "Complete 3+ sessions to see training load"

4. **Insert `TrainingLoadCard` into `FigmaHomeScreen`** in `src/screens/FigmaHomeScreen.tsx`

   - Between the Stats Grid and the Recent Activities section
   - Reads sessions via `TrainingContextService` (pipeline already exists)

5. **Replace hardcoded `ACTIVITIES` array** in `src/screens/FigmaHomeScreen.tsx`

   - Read real enriched sessions from AsyncStorage
   - Fallback to `DummyDataGenerator` output with a `"Sample data"` badge on each
     row when no real sessions exist
   - Each row shows: session name, date, duration, Banister TRIMP score

6. **Add TRIMP score to session history rows** in `src/screens/FigmaStartWorkoutScreen.tsx`

   - Sessions already carry `trimpScore` after enrichment — just surface it in the
     list row UI

7. **Tests + commit**

---

## Phase 3 — Wire Real BLE + Session Recording + Manual Diary

**Goal:** Start/stop session connects to real Polar H10 with background BLE.
Live BPM + zone badge shown during workout. Manual (no-sensor) sessions store
name, activity type, duration, RPE, and free-text notes — and still contribute
to ACWR via Foster's RPE-TRIMP.

### Steps

1. **Implement `useTrainingSession` hook** in `src/hooks/useTrainingSession.ts`
   (currently an empty stub)

   - Orchestrates `useBLEScanning` + `useHeartRateMonitoring` + `SessionRecordingService`
   - Supports two modes:
     - **BLE mode:** live HR, automatic TRIMP enrichment on stop
     - **Manual mode:** no HR, duration timed by app or entered manually, TRIMP via
       Foster's RPE method
   - Exposes: `{ mode, isConnected, deviceName, currentHR, currentZone, isRecording,
startSession(params), stopSession, sessionDuration }`

2. **Extend `RecordingSession`** in `src/services/SessionRecordingService.ts`

   - Add `name: string`, `activityType?: string`, `notes?: string`, `rpe?: number` (0–10)
   - Add `heartRateReadings?`, `averageHeartRate?`, `peakHeartRate?`, `trimpScore?`,
     `zoneSummary?`
   - All additions optional to preserve backward compatibility

3. **Add Foster's RPE-TRIMP** to `src/services/TRIMPCalculator.ts`

   - `TRIMP_RPE = durationMinutes × RPE_multiplier`
   - RPE multiplier maps 0–10 scale to Foster's validated points scale
   - Used when `heartRateReadings` is absent (manual sessions)

4. **Wire session lifecycle to HR buffering**

   - On `startSession()`: begin collecting HR readings from `HeartRateService`
   - On `stopSession()`: compute Banister TRIMP (BLE) or Foster RPE-TRIMP (manual),
     build zone summary, write enriched session to AsyncStorage

5. **Expand `StartSessionModal`** in `src/components/figma/StartSessionModal.tsx`

   - Activity type picker: run / cycle / strength / swim / other
   - Duration input (for manual sessions)
   - RPE slider 0–10 (shown after session ends, or pre-set for manual)
   - Multi-line notes TextInput
   - Notes injected verbatim into LLM context via `TrainingContextService`

6. **Fix session naming**

   - Wire `onStart(params)` → `useTrainingSession.startSession(params)`
   - Auto-generate `"Session – Mar 6 09:41"` format if name left blank

7. **Live HR display during BLE workout**

   - Large BPM number + color-coded zone badge in the active recording view
   - No graph — keep it simple

8. **Background BLE on iOS**

   - Add `bluetooth-central` to `UIBackgroundModes` in
     `ios/PolarH10Monitor/Info.plist`
   - Register a background task (react-native-background-actions or equivalent)
     to keep the BLE event loop alive when the app is backgrounded
   - HR readings continue buffering; session timer continues
   - A persistent notification displays elapsed time

9. **Fix `ScanDevicesModal`** in `src/components/figma/ScanDevicesModal.tsx`

   - Replace `MOCK_DEVICES` + `setTimeout` with real `useBLEScanning`
   - Spinner during scan, real peripheral names, connect on tap

10. **Fix `FigmaSettingsScreen`** in `src/screens/FigmaSettingsScreen.tsx`

    - Replace `INITIAL_DEVICES` hardcoded array with `DeviceHistoryService` data
    - Remove `Math.random()` battery level (show "–" if unsupported)

11. **Remove hardcoded BLE state from `FigmaStartWorkoutScreen`**

    - Remove `isConnected = useState(true)` and `'FitBand Pro'`
    - Use `useTrainingSession` hook

12. **Tests + commit**

---

## Phase 4 — Multi-Device & SDK Support

**Goal:** Detect connected device brand and route through Polar's native SDK when
available. Fall back to generic GATT for Garmin, Suunto, and unknown devices.

### Steps

1. **Create `DeviceCapabilityResolver`**

   - Util that pattern-matches peripheral name / manufacturer data
   - Returns `'polar' | 'generic'`
   - Polar prefixes to match: `"Polar H"`, `"Polar OH"`, `"Polar M"`, etc.

2. **Define `IHRDataSource` interface**

   - `{ startMonitoring(deviceId), stopMonitoring(), on('heartRate', cb),
on('rrInterval', cb) }`
   - Implemented by both existing `HeartRateService` (generic GATT) and new Polar adapter

3. **Evaluate and integrate `react-native-polar`**

   - If viable: create `PolarHRDataSource` implementing `IHRDataSource`
   - Unlocks the two commented-out TODOs in `src/services/SessionRecordingService.ts`:
     `startInternalRecording()` and `stopInternalRecording()`

4. **Route through `useTrainingSession`**

   - Call `DeviceCapabilityResolver` at session start
   - Select correct `IHRDataSource`
   - TRIMP/ACWR math is device-agnostic and unchanged

5. **Tests + commit**

---

## Verification (per phase)

| Check                    | How                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Unit tests               | `jest --watchAll`                                                                     |
| TRIMP with real profile  | Dev screen seeder → inspect Banister TRIMP with `sex = 'female'` + custom `restingHR` |
| Karvonen zones           | Log thresholds in Dev screen after setting `restingHR = 45`                           |
| TrainingLoadCard + modal | Seed 5+ sessions → Home → tap card → verify modal                                     |
| Manual session TRIMP     | Enter RPE 7, 45 min → verify Foster's TRIMP in history                                |
| Background BLE           | Start session → lock phone → unlock after 5 min → verify HR buffer                    |
| Real Polar H10           | Full start/stop workout test on device (Phase 3+)                                     |
| Git                      | One descriptive commit per phase                                                      |

---

## Decisions Log

| Decision               | Choice                                                                            |
| ---------------------- | --------------------------------------------------------------------------------- |
| TRIMP method in UI     | Banister only (Foster's RPE for manual sessions)                                  |
| HR zone method         | Karvonen (heart rate reserve)                                                     |
| New profile fields     | `restingHR` + optional `maxHR`                                                    |
| Session naming         | Save user-entered; auto-generate if blank                                         |
| Manual sessions        | Allowed — name, activity type, duration, RPE, free-text notes                     |
| Manual TRIMP           | Foster's session RPE method                                                       |
| Notes in LLM context   | Yes — notes field injected into TrainingContextService context block              |
| Home activities        | Real sessions; labeled dummy data fallback when none exist                        |
| Training load display  | Tappable `TrainingLoadCard` → `TrainingLoadModal` with explanations               |
| Live HR during workout | BPM number + zone badge only (no graph)                                           |
| Background BLE (iOS)   | Yes — `bluetooth-central` entitlement + background task + persistent notification |
| Multi-sensor           | Single HR sensor only for now                                                     |
| Multi-device SDK       | Phase 4 — Polar SDK first, generic GATT fallback for others                       |
| figmaMake/ folder      | Historical artifact — not updated                                                 |
| AI/LLM                 | Local only (no internet queries)                                                  |
| Auth                   | Local mock — no backend needed                                                    |
| Phase cadence          | Implement → test → commit → push                                                  |

---

## Key Files Reference

| File                                         | Role                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `src/store/physiologyStore.ts`               | User physiology (sex, age, height, weight — adding restingHR, maxHR) |
| `src/services/TRIMPCalculator.ts`            | All TRIMP methods + zone calculation                                 |
| `src/services/AnalyticsService.ts`           | Enriches sessions with TRIMP — hardcoded gender fixed here           |
| `src/services/TrainingContextService.ts`     | Builds LLM context block — hardcoded HR values fixed here            |
| `src/utils/ACWRCalculator.ts`                | ACWR rolling sum — monotony + strain added here                      |
| `src/services/SessionRecordingService.ts`    | Session storage — extended with HR data + name                       |
| `src/hooks/useTrainingSession.ts`            | Empty stub — fully implemented in Phase 3                            |
| `src/screens/FigmaHomeScreen.tsx`            | Receives TrainingLoadCard + real session history                     |
| `src/screens/FigmaProfileSettingsScreen.tsx` | Receives restingHR + maxHR fields                                    |
| `src/screens/FigmaStartWorkoutScreen.tsx`    | Hardcoded BLE state removed in Phase 3                               |
| `src/components/figma/ScanDevicesModal.tsx`  | Mock BLE scan replaced in Phase 3                                    |
| `src/screens/FigmaSettingsScreen.tsx`        | Hardcoded device list replaced in Phase 3                            |
| `ios/PolarH10Monitor/Info.plist`             | Background BLE entitlement added in Phase 3                          |

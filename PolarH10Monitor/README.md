# PolarH10Monitor

A React Native application for monitoring and recording training sessions with Polar H10 heart rate sensors. The app features Bluetooth Low Energy connectivity, real-time heart rate tracking, AI-powered sports science coaching, and a full user account system with encrypted local storage.

## 📱 Features

### Core

- **Bluetooth LE Integration** — Connect to Polar H10 heart rate monitors via `react-native-ble-plx`
- **Session Recording** — Start/stop recording sessions with device-internal storage
- **Real-time Monitoring** — Live heart rate data display during training
- **Session History** — Track and manage completed training sessions
- **Device Management** — Automatic device discovery and connection history
- **Cross-platform** — Native iOS and Android support

### AI Sports Coaching

- **Streaming AI Chat** — On-device LLM inference via `llama.rn` with real-time token streaming
- **Sports Science Prompts** — Structured prompt system (v4.0) with JSON output contract for calorie, TRIMP, and recovery recommendations
- **Markdown Rendering** — AI responses rendered with proper formatting (bold, lists, headers)
- **Response Logger** — Persistent log viewer for debugging AI output history
- **Model Switcher** — Swap between bundled GGUF models at runtime

### User & Profile

- **Accounts** — Sign up / log in with name, email, and password (local auth, no backend)
- **Encrypted Storage** — Credentials and profile data stored with AES-256 encryption via `react-native-encrypted-storage` (iOS Keychain / Android EncryptedSharedPreferences), with an AsyncStorage fallback for simulator environments
- **Profile Settings** — Sex, age, height, weight, activity level, and body fat percentage
- **Calorie Targets** — Mifflin-St Jeor TDEE with optional Katch-McArdle formula when body fat is known
- **Physiology Store** — Zustand-backed store for user physiology, persisted across sessions

### UX

- **Figma Design System** — Full dark/light theme UI rebuilt from Figma mockups
- **Animated Toast Notifications** — Slide-up success/error/warning toasts with auto-dismiss (4.5s), replacing all inline error boxes
- **Profile Modal** — Inline sign-up/login sheet accessible from the home screen avatar

### Developer Tools

- **Dev Tab** — `__DEV__`-only bottom tab (automatically hidden in production) for:
  - Viewing and deleting the current user
  - Wiping EncryptedStorage and/or AsyncStorage
  - Inspecting all AsyncStorage keys and their (encrypted) values

---

## 🏗 Architecture

```
src/
├── components/
│   ├── figma/          # Figma-sourced UI components (ProfileModal, StatCard, …)
│   ├── common/         # Shared primitives (Toast, ErrorBoundary, …)
│   └── AppContainer    # Root layout, AuthProvider, splash logic
├── context/
│   └── AuthContext     # Thin wrapper over authStore — backwards-compatible useAuth()
├── hooks/              # useBLEConnection, useSessionRecording, useSportsAI, useToast, …
├── navigation/
│   ├── RootStackNavigator   # Stack: Main tabs + ProfileSettings modal
│   ├── MainTabNavigator     # Bottom tabs (Home / Workout / Chat / More / Dev*)
│   └── NavigationTypes      # Typed param lists
├── screens/            # FigmaHomeScreen, FigmaAIChatScreen, FigmaProfileSettingsScreen, DevScreen, …
├── services/           # BLEService, SportsAIService, SessionRecordingService, …
├── store/
│   ├── authStore       # Zustand — user session, login/signup/logout actions
│   └── physiologyStore # Zustand — height, weight, age, activity, body fat
├── theme/              # figmaTheme (dark/light tokens), legacy theme files
├── utils/
│   ├── secureStorage   # secureWrite / secureRead / secureRemove (AES-256 + fallback)
│   ├── CalorieCalculator # TDEE (Mifflin-St Jeor + Katch-McArdle)
│   └── ResponseLogger  # AI response persistence
└── prompts/            # Sports science prompt templates (v4.0)
```

> **State management**: Zustand v5 throughout. All object selectors use `useShallow` from `zustand/react/shallow` to prevent infinite re-render loops.

---

## 📦 Key Dependencies

| Package                                     | Purpose                                    |
| ------------------------------------------- | ------------------------------------------ |
| `react-native-ble-plx`                      | Bluetooth LE                               |
| `llama.rn`                                  | On-device LLM inference (GGUF)             |
| `zustand`                                   | Lightweight state management               |
| `react-native-encrypted-storage`            | OS-level secure storage                    |
| `crypto-js`                                 | AES-256 encryption layer                   |
| `react-native-get-random-values`            | `crypto.getRandomValues()` polyfill for RN |
| `@react-native-async-storage/async-storage` | Storage fallback + general cache           |
| `react-navigation`                          | Stack + bottom-tab navigation              |
| `react-native-linear-gradient`              | Gradient UI elements                       |
| `react-native-safe-area-context`            | Safe area insets                           |

---

## 🚀 Getting Started

> **Prerequisites**: Complete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) first.

### 1. Install dependencies

```sh
npm install
```

### 2. iOS — install CocoaPods

```sh
bundle install          # first clone only
bundle exec pod install
```

### 3. Start Metro

```sh
npm start
```

### 4. Run the app

```sh
# iOS
npm run ios

# Android
npm run android
```

---

## 🔧 Troubleshooting

| Issue                               | Fix                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `crypto.getRandomValues` error      | Ensure `import 'react-native-get-random-values'` is the **first** import in `index.js` |
| EncryptedStorage fails on simulator | Expected — app automatically falls back to AsyncStorage (data stays AES-encrypted)     |
| `Promise.allSettled` TS error       | `tsconfig.json` `lib` must be `"es2020"` or later                                      |
| Infinite re-render from Zustand     | Use `useShallow` for any selector that returns an object                               |

For more help see the [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

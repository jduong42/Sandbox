# App Navigation

```mermaid
flowchart TD
    A([App Launch]) --> B[AppContainer\nAuthProvider]
    B --> C{initialize\nsecureRead app-user}
    C -->|user found| D[isAuthenticated = true]
    C -->|no user| E[isAuthenticated = false]
    D --> NAV
    E --> NAV

    subgraph NAV[RootStackNavigator]
        direction TB
        MAIN[Main\nMainTabNavigator]
        PS[ProfileSettings\nFigmaProfileSettingsScreen\nslides up from bottom]
        MAIN -.->|navigate ProfileSettings| PS
        PS -.->|goBack| MAIN
    end

    subgraph TABS[MainTabNavigator]
        direction LR
        HOME[🏠 Home\nFigmaHomeScreen]
        WORKOUT[💪 Workout\nFigmaStartWorkoutScreen]
        CHAT[🤖 Chat\nFigmaAIChatScreen]
        MORE[⚙️ More\nFigmaSettingsScreen]
        DEV[🛠 Dev\nDevScreen\n__DEV__ only]
    end

    MAIN --> TABS

    HOME -->|tap CoachBanner\nprefill question| CHAT
    MORE -->|tap avatar / login| PS
    HOME -->|tap avatar / login| PS
```

## Screen responsibilities

| Screen | Primary purpose |
|---|---|
| `FigmaHomeScreen` | Dashboard — CoachBanner, rings, streak card, recent activities |
| `FigmaStartWorkoutScreen` | BLE scan, connect, start/stop session recording |
| `FigmaAIChatScreen` | Streaming AI chat with sports-science context injection |
| `FigmaSettingsScreen` | Physiology profile, theme, app preferences |
| `FigmaProfileSettingsScreen` | Sign up / log in modal (vertical slide) |
| `DevScreen` | Seed data, wipe storage, inspect AI context, simulate stale DB |

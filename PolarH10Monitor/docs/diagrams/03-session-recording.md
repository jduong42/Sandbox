# Session Recording Flow

`useSessionRecording` orchestrates the UI state. `SessionRecordingService` manages
the active session lifecycle. `SessionRepository` persists the completed session
to SQLite.

```mermaid
sequenceDiagram
    participant User
    participant WorkoutScreen
    participant useSessionRecording
    participant SessionRecordingService
    participant SessionRepository

    User->>WorkoutScreen: tap "Start Recording"
    WorkoutScreen->>useSessionRecording: startRecording(sessionName)

    note over useSessionRecording: Guard checks (Alert + return false if any fail):<br/>• BLE not connected<br/>• session name blank<br/>• activeSession already exists

    useSessionRecording->>SessionRecordingService: startRecording(name, deviceId, deviceName)
    SessionRecordingService-->>useSessionRecording: session { status: 'recording', startTime }
    useSessionRecording->>useSessionRecording: setActiveSession(session)
    useSessionRecording->>useSessionRecording: setSessionDuration(0)
    useSessionRecording-->>WorkoutScreen: isRecording = true
    WorkoutScreen-->>User: timer starts, Stop button shown

    loop setInterval — every 1 second
        useSessionRecording->>useSessionRecording: setSessionDuration(Date.now() - startTime)
        WorkoutScreen-->>User: timer display updates
    end

    User->>WorkoutScreen: tap "Stop Recording"
    WorkoutScreen->>useSessionRecording: stopRecording()
    useSessionRecording-->>User: Alert "Stop Recording?"

    alt User cancels
        User->>useSessionRecording: tap Cancel
        useSessionRecording-->>WorkoutScreen: no change
    else User confirms
        User->>useSessionRecording: tap "Stop Recording"
        useSessionRecording->>SessionRecordingService: stopRecording()
        SessionRecordingService->>SessionRecordingService: compute duration, zones, TRIMP
        SessionRecordingService->>SessionRepository: insert(completedSession)
        SessionRepository->>SessionRepository: INSERT OR REPLACE INTO sessions
        SessionRepository-->>SessionRecordingService: done
        SessionRecordingService-->>useSessionRecording: completedSession
        useSessionRecording->>useSessionRecording: setActiveSession(null)
        useSessionRecording->>useSessionRecording: setSessionDuration(0)
        useSessionRecording->>useSessionRecording: loadSessionHistory()
        useSessionRecording-->>WorkoutScreen: isRecording = false
        WorkoutScreen-->>User: Alert "Recording Completed"
    end
```

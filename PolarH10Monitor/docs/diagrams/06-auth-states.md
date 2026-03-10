# Auth State Diagram

`authStore` (Zustand) manages the single auth lifecycle. There is currently no
navigation gate — the navigator renders the same tab layout regardless of
`isAuthenticated`. The profile modal is presented modally when the user taps
their avatar.

```mermaid
stateDiagram-v2
    [*] --> Loading : app boot

    Loading --> Unauthenticated : secureRead('app-user') returns null\nor throws
    Loading --> Authenticated : secureRead('app-user') returns User

    Unauthenticated --> Authenticated : login(email, password)\n→ secureWrite('app-user', user)
    Unauthenticated --> Authenticated : signup(name, email, password)\n→ secureWrite('app-user', user)

    Authenticated --> Unauthenticated : logout()\n→ secureRemove('app-user')
    Authenticated --> Unauthenticated : handleWipeEncryptedStorage()\n→ EncryptedStorage.clear() + logout()

    state Authenticated {
        [*] --> ActiveSession
        ActiveSession --> ActiveSession : physiology updated\nrecording started/stopped
    }

    state Unauthenticated {
        [*] --> ShowingProfileModal
        ShowingProfileModal --> ShowingProfileModal : validation errors
    }
```

## User object shape

```typescript
{
  id:     string   // '1' (hardcoded — no backend yet)
  name:   string
  email:  string
  avatar: string   // first letter of name, uppercased
}
```

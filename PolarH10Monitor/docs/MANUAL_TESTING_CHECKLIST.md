# Manual Testing Checklist for Session Recording

## Setup
1. Make sure a Polar H10 device is available for testing
2. Have the app running on a device or simulator
3. Navigate to the Training Data screen

## 📱 iPhone 15 Pro Max Specific Tests

### Device-Specific UI Testing
- [ ] **iPhone Test 1**: Check Dynamic Island compatibility
  - Expected: UI elements don't overlap with Dynamic Island
  - Expected: Status information displays clearly

- [ ] **iPhone Test 2**: Test large screen utilization
  - Expected: Content scales properly on 6.7" display
  - Expected: Touch targets are appropriately sized
  - Expected: Text remains readable at all scales

- [ ] **iPhone Test 3**: Portrait/Landscape orientation
  - Action: Rotate device between orientations
  - Expected: UI adapts gracefully
  - Expected: No content is cut off or overlapping

### iOS Permissions Testing
- [ ] **iPhone Test 4**: Bluetooth permission flow
  - Action: First time opening Settings tab and scanning
  - Expected: iOS system permission dialog appears
  - Expected: After granting, Bluetooth functions work normally

- [ ] **iPhone Test 5**: Background app refresh
  - Action: Start recording, go to iOS Settings → General → Background App Refresh
  - Expected: PolarH10Monitor appears in the list
  - Expected: Can enable/disable background refresh

### iOS-Specific Features
- [ ] **iPhone Test 6**: Control Center interaction
  - Action: During recording, swipe down for Control Center
  - Action: Toggle Bluetooth off/on from Control Center
  - Expected: App handles Bluetooth state changes gracefully

- [ ] **iPhone Test 7**: Lock screen behavior
  - Action: Start recording, lock iPhone for 1 minute, unlock
  - Expected: App resumes exactly where it was
  - Expected: Recording duration continues accurately

- [ ] **iPhone Test 8**: Notifications and alerts
  - Action: Trigger various app alerts (start recording, stop recording, errors)
  - Expected: Alerts appear above all other content
  - Expected: Alert buttons are easily tappable

### Performance on iPhone 15 Pro Max
- [ ] **iPhone Test 9**: A17 Pro performance
  - Expected: Instant app launch
  - Expected: Smooth 120Hz scrolling in session history
  - Expected: No lag when switching between tabs

- [ ] **iPhone Test 10**: Battery usage
  - Action: Run a 10+ minute recording session
  - Expected: Reasonable battery drain
  - Expected: No excessive heat generation

## Test Cases

### Connection Status Testing
- [ ] **Test 1.1**: Open app with Bluetooth disabled
  - Expected: Shows "Bluetooth is disabled" message
  - Expected: Start recording button is disabled

- [ ] **Test 1.2**: Enable Bluetooth but don't connect device
  - Expected: Shows "Not connected to any device"
  - Expected: Start recording button is disabled with error message

- [ ] **Test 1.3**: Connect to Polar H10 device
  - Expected: Shows "Connected to [Device Name]"
  - Expected: Start recording button becomes enabled

### Session Creation Testing
- [ ] **Test 2.1**: Start recording without session name
  - Action: Leave session name empty and tap "Start Recording"
  - Expected: Shows alert "Session Name Required"

- [ ] **Test 2.2**: Start recording with valid session name
  - Action: Enter "Test Session" and tap "Start Recording"
  - Expected: Success alert appears
  - Expected: UI switches to "Recording Active" mode
  - Expected: Session name input field is cleared

- [ ] **Test 2.3**: Use "Generate name" button
  - Action: Tap "Generate name" link
  - Expected: Session name field fills with timestamp-based name

- [ ] **Test 2.4**: Try to start second session while recording
  - Action: Start one session, then try to start another
  - Expected: Shows alert "Session Already Active"

### Active Recording Testing
- [ ] **Test 3.1**: Verify recording indicator
  - Expected: Red recording indicator appears
  - Expected: "Recording Active" title is visible
  - Expected: Session details show correct information

- [ ] **Test 3.2**: Check duration counter
  - Expected: Duration updates every second
  - Expected: Format shows as "XXs", "XXm XXs", or "XXh XXm XXs"

- [ ] **Test 3.3**: Verify session details display
  - Expected: Shows session name, device name, start time
  - Expected: All information matches what was entered

### Session Stop Testing
- [ ] **Test 4.1**: Stop recording normally
  - Action: Tap "Stop Recording" button
  - Expected: Confirmation dialog appears
  - Action: Tap "Stop Recording" in dialog
  - Expected: Success message with final duration
  - Expected: UI returns to "Start Recording" mode
  - Expected: Session appears in history

- [ ] **Test 4.2**: Cancel stop recording
  - Action: Tap "Stop Recording" button
  - Action: Tap "Cancel" in dialog
  - Expected: Recording continues
  - Expected: UI remains in recording mode

### Session History Testing
- [ ] **Test 5.1**: Check completed session in history
  - Expected: Most recent session appears at top
  - Expected: Shows session name, date/time, and duration
  - Expected: History shows "Recent Sessions (X)" with correct count

- [ ] **Test 5.2**: Create multiple sessions
  - Action: Complete 3-5 recording sessions
  - Expected: All sessions appear in chronological order (newest first)
  - Expected: Each shows unique session name and correct duration

### Emergency Clear Testing
- [ ] **Test 6.1**: Use emergency clear
  - Action: During recording, tap "Clear Session (Emergency)"
  - Expected: Warning dialog about data loss
  - Action: Confirm clear
  - Expected: Recording stops immediately
  - Expected: Session is removed (not saved to history)

### App Lifecycle Testing
- [ ] **Test 7.1**: App backgrounding during recording
  - Action: Start recording, then background the app for 30 seconds
  - Action: Return to app
  - Expected: Recording continues
  - Expected: Duration has increased by ~30 seconds

- [ ] **Test 7.2**: App restart during recording
  - Action: Start recording, force-quit app, restart app
  - Expected: App recovers active session
  - Expected: Duration continues from correct time
  - Expected: All session details are preserved

### Error Scenarios Testing
- [ ] **Test 8.1**: Disconnect device during recording
  - Action: Start recording, then turn off or move away from Polar H10
  - Expected: Connection status updates to "Not connected"
  - Expected: Recording session remains active (internal recording)

- [ ] **Test 8.2**: Bluetooth disabled during recording
  - Action: Start recording, then disable Bluetooth
  - Expected: Shows "Bluetooth is disabled"
  - Expected: Recording session remains active

## Performance Testing
- [ ] **Test 9.1**: Long recording session
  - Action: Let a session run for 5+ minutes
  - Expected: Duration updates smoothly
  - Expected: No memory leaks or performance issues
  - Expected: UI remains responsive

- [ ] **Test 9.2**: Multiple session history
  - Action: Create 10+ sessions
  - Expected: History loads quickly
  - Expected: Only shows last 5 sessions in UI
  - Expected: All sessions stored properly

## Edge Cases
- [ ] **Test 10.1**: Very long session names
  - Action: Enter 50+ character session name
  - Expected: Name is truncated or handled gracefully

- [ ] **Test 10.2**: Special characters in session name
  - Action: Use emojis, special characters
  - Expected: Handles gracefully, no crashes

- [ ] **Test 10.3**: Rapid start/stop
  - Action: Start and immediately stop recording multiple times
  - Expected: No race conditions or errors
  - Expected: Each session is handled correctly

## Pass Criteria
✅ All connection states display correctly
✅ Recording sessions create and store properly
✅ Duration tracking works accurately
✅ Session history persists across app restarts
✅ Error handling provides clear user feedback
✅ No crashes or data loss in any scenario

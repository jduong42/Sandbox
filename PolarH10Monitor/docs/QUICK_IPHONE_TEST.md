# 📋 iPhone 15 Pro Max - Session Recording Quick Test

## ✅ Pre-Test Setup
- [ ] iPhone 15 Pro Max connected to Mac
- [ ] Polar H10 device available and charged
- [ ] App successfully installed on iPhone

## 🚀 Test Sequence (Execute in Order)

### Test 1: Basic App Launch
- [ ] **Action**: Tap PolarH10Monitor app icon on iPhone
- [ ] **Expected**: App launches without crashes
- [ ] **Check**: All tabs visible at bottom (Home, Data, Settings, Training)

### Test 2: Training Data Screen Access
- [ ] **Action**: Tap "Training Data" tab
- [ ] **Expected**: Session recording interface appears
- [ ] **Check**: 
  - Connection status shows (likely "Not connected")
  - "Start Recording Session" card is visible
  - Session name input field is present
  - "Recent Sessions" section shows (likely empty)

### Test 3: Session Name Generation
- [ ] **Action**: Tap "Generate name" link
- [ ] **Expected**: Session name field populates with timestamp-based name
- [ ] **Format**: Should be like "Training Session 14:30 7/6/2025"

### Test 4: Recording Without Device (Error Test)
- [ ] **Action**: Enter session name and tap "Start Recording"
- [ ] **Expected**: Alert appears: "Device Not Connected"
- [ ] **Message**: Should mention connecting to Polar H10 device

### Test 5: Bluetooth Permission Request
- [ ] **Action**: Go to Settings tab, tap "Scan"
- [ ] **Expected**: iOS permission dialog for Bluetooth access
- [ ] **Action**: Tap "Allow"
- [ ] **Expected**: Scanning begins, "Scanning..." button appears

### Test 6: Polar H10 Connection (If Available)
- [ ] **Action**: Turn on Polar H10, wait for discovery
- [ ] **Expected**: Polar H10 appears in discovered devices list
- [ ] **Action**: Tap on Polar H10 device
- [ ] **Expected**: Connection success, device appears in history

### Test 7: Connected Session Recording
- [ ] **Action**: Return to Training Data tab
- [ ] **Expected**: Connection status shows "Connected to Polar H10"
- [ ] **Action**: Enter session name and tap "Start Recording"
- [ ] **Expected**: 
  - Success alert appears
  - UI switches to "Recording Active" mode
  - Red recording indicator appears
  - Duration counter starts (00s, 01s, 02s...)

### Test 8: Active Recording Verification
- [ ] **Check Duration Counter**: Updates every second
- [ ] **Check Session Details**: 
  - Session name displays correctly
  - Device name shows "Polar H10"
  - Start time shows current time
- [ ] **Check UI State**: "Stop Recording" button is visible

### Test 9: iPhone-Specific Tests
- [ ] **Lock Screen Test**: 
  - Lock iPhone for 30 seconds
  - Unlock and return to app
  - Duration should have increased by ~30 seconds
- [ ] **App Backgrounding**:
  - Press home button, wait 10 seconds
  - Return to app
  - Recording should continue normally

### Test 10: Stop Recording
- [ ] **Action**: Tap "Stop Recording" button
- [ ] **Expected**: Confirmation dialog appears
- [ ] **Action**: Tap "Stop Recording" in dialog
- [ ] **Expected**:
  - Success message with duration
  - UI returns to "Start Recording" mode
  - Session appears in "Recent Sessions" list

### Test 11: Session History Verification
- [ ] **Check**: Completed session appears in history
- [ ] **Verify**: Session name, date/time, and duration are correct
- [ ] **Count**: "Recent Sessions (1)" shows correct count

## 🐛 Issues to Watch For

### Performance Issues
- [ ] App feels sluggish or unresponsive
- [ ] UI elements don't appear immediately
- [ ] Duration counter skips seconds or freezes

### UI Issues on iPhone 15 Pro Max
- [ ] Text too small or too large
- [ ] Buttons difficult to tap
- [ ] Elements overlap with Dynamic Island
- [ ] Poor layout in landscape mode

### Bluetooth Issues
- [ ] Permission dialog doesn't appear
- [ ] Scanning doesn't work
- [ ] Connection fails repeatedly
- [ ] Device doesn't stay connected

### Session Recording Issues
- [ ] Duration doesn't update
- [ ] Session doesn't save to history
- [ ] App crashes during recording
- [ ] Data loss after app restart

## 📊 Success Criteria

### Core Functionality
✅ App launches and runs smoothly on iPhone 15 Pro Max
✅ Session recording workflow works end-to-end
✅ Duration tracking is accurate
✅ Session history persists correctly

### iPhone Experience
✅ Touch interactions feel natural
✅ UI scales properly for 6.7" screen
✅ App handles backgrounding/foregrounding
✅ Battery drain is reasonable

### Bluetooth Performance
✅ Reliable device discovery
✅ Stable connection to Polar H10
✅ Proper error handling

## 📝 Quick Notes Section
```
Test Date: _____________
App Version: ___________
iOS Version: ___________

Quick Notes:
- Overall performance: ⭐⭐⭐⭐⭐
- UI experience: ⭐⭐⭐⭐⭐
- Bluetooth reliability: ⭐⭐⭐⭐⭐
- Session recording: ⭐⭐⭐⭐⭐

Issues found:
_________________________
_________________________

Suggestions:
_________________________
_________________________
```

**🎯 Main Goal**: Verify that the session recording system works flawlessly on your iPhone 15 Pro Max and provides a smooth, intuitive user experience for training sessions with the Polar H10!

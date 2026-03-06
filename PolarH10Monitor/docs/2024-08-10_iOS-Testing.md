# 📱 iPhone 15 Pro Max Testing Guide

## 🚀 Getting Started

### Prerequisites
✅ Xcode 16.4 installed
✅ iPhone 15 Pro Max connected via USB
✅ Polar H10 device available for testing
✅ CocoaPods dependencies installed

### Step 1: Connect Your iPhone
1. Connect your iPhone 15 Pro Max to your Mac via USB cable
2. Trust the computer if prompted on your iPhone
3. In Xcode, ensure your device appears in the device list

### Step 2: Configure Development Team
```bash
# Open the project in Xcode
open ios/PolarH10Monitor.xcworkspace
```

In Xcode:
1. Select the PolarH10Monitor project in the navigator
2. Select the PolarH10Monitor target
3. Go to "Signing & Capabilities" tab
4. Select your Apple Developer Team
5. Xcode will automatically configure provisioning

### Step 3: Build and Run
```bash
# From the project root directory
cd /Users/juhaduong/Desktop/Sanbox_projects/PolarH10Monitor

# Method 1: Using React Native CLI (Recommended)
npx react-native run-ios --device "iPhone 15 Pro Max"

# Method 2: Using Xcode directly
# Just open ios/PolarH10Monitor.xcworkspace and click Run
```

## 📋 Testing Workflow

### Phase 1: Basic App Launch
- [ ] App launches successfully on iPhone
- [ ] No crashes during startup
- [ ] All tabs are visible and navigable
- [ ] UI appears correctly on iPhone 15 Pro Max screen

### Phase 2: Bluetooth Permission Testing
- [ ] When app first requests Bluetooth access, iOS permission dialog appears
- [ ] Grant permission and verify app can detect Bluetooth status
- [ ] Toggle Bluetooth off/on in Settings and verify app responds correctly

### Phase 3: Training Data Screen Testing
- [ ] Navigate to Training Data tab
- [ ] Verify all UI elements render correctly
- [ ] Test connection status display

### Phase 4: Polar H10 Connection Testing
- [ ] Turn on your Polar H10 device
- [ ] Use Settings tab to scan for devices
- [ ] Connect to your Polar H10
- [ ] Verify connection status updates in Training Data screen

### Phase 5: Session Recording Testing
Follow the manual testing checklist, focusing on:

#### Critical iPhone-Specific Tests:
- [ ] **Lock Screen Test**: Start recording, lock iPhone, unlock after 1 minute
  - Expected: Recording continues, duration updated correctly
  
- [ ] **App Backgrounding**: Start recording, go to home screen for 30 seconds
  - Expected: Recording continues when returning to app
  
- [ ] **Phone Call Interruption**: Start recording, simulate incoming call
  - Expected: Recording state preserved after call ends
  
- [ ] **Low Power Mode**: Enable Low Power Mode during recording
  - Expected: App continues to function properly

#### iPhone 15 Pro Max Specific:
- [ ] **Dynamic Island**: Verify no UI interference with Dynamic Island
- [ ] **Action Button**: Ensure no conflicts if Action Button is pressed
- [ ] **Touch Responsiveness**: All buttons and inputs work smoothly
- [ ] **Screen Rotation**: Test portrait/landscape orientations

## 🔧 Troubleshooting

### Build Issues
```bash
# Clean and rebuild if needed
cd ios
xcodebuild clean
pod install
cd ..
npx react-native run-ios --device "iPhone 15 Pro Max"
```

### Metro Bundle Issues
```bash
# Reset Metro cache
npx react-native start --reset-cache
```

### Device Not Found
```bash
# List available devices
xcrun devicectl list devices
# Or
xcrun xctrace list devices
```

### Signing Issues
1. In Xcode: Product → Archive
2. Resolve any signing issues in Organizer
3. Use automatic signing with your Apple ID

## 📊 Performance Monitoring

### Memory Usage
- [ ] Monitor memory usage during long recording sessions
- [ ] Check for memory leaks when starting/stopping sessions
- [ ] Verify app doesn't exceed reasonable memory limits

### Battery Impact
- [ ] Monitor battery drain during active recording
- [ ] Test with screen off during recording
- [ ] Compare battery usage with other fitness apps

### Real-world Scenarios
- [ ] **Gym Workout**: 45-minute session with phone in pocket
- [ ] **Running**: 30-minute outdoor run with GPS apps running
- [ ] **Cycling**: 1-hour ride with other Bluetooth devices connected

## 🎯 Key Success Metrics

### Stability
- [ ] No crashes during 24-hour period
- [ ] Successful session recovery after app termination
- [ ] Stable connection during device movement

### User Experience
- [ ] Intuitive session start/stop workflow
- [ ] Clear visual feedback for all states
- [ ] Responsive touch interactions
- [ ] Readable text on iPhone screen

### Bluetooth Performance
- [ ] Reliable device discovery
- [ ] Stable connection maintenance
- [ ] Proper handling of connection interruptions

## 📝 Testing Log Template

```
Date: ___________
Device: iPhone 15 Pro Max
iOS Version: ___________
App Version: ___________
Polar H10 Device: ___________

Test Results:
□ App Launch: PASS/FAIL
□ Bluetooth Permissions: PASS/FAIL
□ Device Connection: PASS/FAIL
□ Session Recording: PASS/FAIL
□ App Backgrounding: PASS/FAIL
□ Session Recovery: PASS/FAIL

Notes:
_________________________________
_________________________________

Issues Found:
_________________________________
_________________________________
```

## 🚨 Known iPhone-Specific Considerations

### iOS 17+ Features
- Background app refresh settings affect recording
- Focus modes may impact notifications
- Screen Time limits could interfere with long sessions

### Hardware Features
- iPhone 15 Pro Max has excellent Bluetooth 5.3 support
- Ultra Wideband (UWB) won't interfere with Polar H10
- Multiple camera apps may compete for background processing

### Privacy & Security
- App Store Connect requires privacy manifest
- Location services may be requested by iOS for BLE scanning
- Background processing is limited without special entitlements

Start with the basic build and launch, then progress through each testing phase systematically!

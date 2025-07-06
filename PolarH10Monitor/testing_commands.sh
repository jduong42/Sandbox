#!/bin/bash

# Quick Testing Commands for Session Recording

echo "🧪 Session Recording Testing Commands"
echo "====================================="

echo ""
echo "📋 1. Run All Tests"
echo "npm test"

echo ""
echo "🔬 2. Run Specific Test Suites"
echo "npm test -- --testPathPattern='SessionRecordingService'"
echo "npm test -- --testPathPattern='useSessionRecording'"

echo ""
echo "👀 3. Run Tests in Watch Mode"
echo "npm test -- --watch"

echo ""
echo "📊 4. Run Tests with Coverage"
echo "npm test -- --coverage"

echo ""
echo "🏗️ 5. Build and Run App"
echo "npm run android  # For Android"
echo "npm run ios      # For iOS"

echo ""
echo "🔍 6. Type Check"
echo "npx tsc --noEmit"

echo ""
echo "🧹 7. Lint Code"
echo "npx eslint src/ --ext .ts,.tsx"

echo ""
echo "📱 8. Test on Device"
echo "# Connect device via USB"
echo "# Enable Developer Options & USB Debugging"
echo "npm run android"

echo ""
echo "🐛 9. Debug Mode"
echo "# Start Metro bundler"
echo "npx react-native start"
echo "# In another terminal:"
echo "npx react-native run-android --variant=debug"

echo ""
echo "🔧 10. Clear All Caches (if issues)"
echo "npx react-native start --reset-cache"
echo "cd android && ./gradlew clean && cd .."
echo "rm -rf node_modules && npm install"

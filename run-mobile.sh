#!/bin/bash

echo "🚀 Starting ParkSathi Mobile App Setup..."

# Navigate to mobile directory
cd /Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/parksathi-mobile

# Check if device is connected
echo "📱 Checking for connected Android devices..."
adb devices

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java 17 first."
    echo "Download from: https://adoptium.net/temurin/releases/?os=macos&arch=x64&package=jdk&version=17"
    exit 1
fi

echo "✅ Java found: $(java -version 2>&1 | head -n 1)"

# Start Metro bundler in background
echo "🔥 Starting Metro bundler..."
npm start &
METRO_PID=$!

# Wait a few seconds for Metro to start
sleep 5

# Run on Android
echo "📱 Building and installing on Android device..."
npm run android

echo "🎉 ParkSathi mobile app should now be running on your Android device!"
echo "📝 If there are issues, press 'R' twice on your device to reload"
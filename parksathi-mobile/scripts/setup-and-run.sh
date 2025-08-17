#!/bin/bash
# Quick Setup and Run Script for ParkSathi Mobile
# Author: Shreeraj Tuladhar - 1Ox4Fox LLC

set -e

echo "🚀 ParkSathi Mobile App Setup & Launch Script"
echo "© 2025 1Ox4Fox LLC - Conceptualized by Shreeraj Tuladhar"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${2}${1}${NC}"
}

check_command() {
    if command -v $1 >/dev/null 2>&1; then
        print_status "✅ $1 is installed" "$GREEN"
        return 0
    else
        print_status "❌ $1 is not installed" "$RED"
        return 1
    fi
}

# Check prerequisites
print_status "🔍 Checking Prerequisites..." "$BLUE"

check_node() {
    if check_command "node"; then
        NODE_VERSION=$(node --version)
        print_status "   Node.js version: $NODE_VERSION" "$GREEN"
        
        # Check if version is >= 16
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$MAJOR_VERSION" -lt 16 ]; then
            print_status "⚠️  Warning: Node.js 16+ recommended (current: $NODE_VERSION)" "$YELLOW"
        fi
    else
        print_status "📝 Install Node.js 16+ from: https://nodejs.org/" "$YELLOW"
        exit 1
    fi
}

check_react_native() {
    if check_command "npx"; then
        print_status "✅ npx is available for React Native CLI" "$GREEN"
    else
        print_status "❌ npm/npx not found" "$RED"
        exit 1
    fi
}

check_platform_tools() {
    print_status "🔍 Checking Platform-specific Tools..." "$BLUE"
    
    # Check for Android tools
    if check_command "adb"; then
        print_status "✅ Android Debug Bridge (adb) found" "$GREEN"
        ADB_DEVICES=$(adb devices | grep -v "List of devices" | grep "device" | wc -l)
        print_status "   Connected Android devices: $ADB_DEVICES" "$GREEN"
    else
        print_status "⚠️  adb not found - install Android Studio for Android development" "$YELLOW"
    fi
    
    # Check for iOS tools (macOS only)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if check_command "xcodebuild"; then
            print_status "✅ Xcode command line tools found" "$GREEN"
        else
            print_status "⚠️  Xcode not found - needed for iOS development" "$YELLOW"
        fi
        
        if check_command "pod"; then
            print_status "✅ CocoaPods found" "$GREEN"
        else
            print_status "📝 Install CocoaPods: sudo gem install cocoapods" "$YELLOW"
        fi
    else
        print_status "ℹ️  iOS development only available on macOS" "$BLUE"
    fi
}

install_dependencies() {
    print_status "📦 Installing Dependencies..." "$BLUE"
    
    if [ -f "package.json" ]; then
        if [ -f "package-lock.json" ]; then
            npm ci
        else
            npm install
        fi
        print_status "✅ Node dependencies installed" "$GREEN"
    else
        print_status "❌ package.json not found - run from parksathi-mobile directory" "$RED"
        exit 1
    fi
    
    # Install iOS dependencies if on macOS
    if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
        print_status "📱 Installing iOS dependencies..." "$BLUE"
        cd ios && pod install && cd ..
        print_status "✅ iOS dependencies installed" "$GREEN"
    fi
}

setup_environment() {
    print_status "⚙️  Setting up Environment..." "$BLUE"
    
    if [ ! -f ".env" ]; then
        print_status "📝 Creating .env file..." "$YELLOW"
        cat > .env << EOF
# ParkSathi Mobile Environment Configuration
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000

# Google Maps API Key (get from Google Cloud Console)
GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# Firebase Configuration (get from Firebase Console)
FIREBASE_PROJECT_ID=parksathi-mobile
FIREBASE_API_KEY=your_firebase_key_here

# App Configuration
APP_VERSION=1.0.0
APP_BUILD_NUMBER=1
BUNDLE_ID=com.ox4fox.parksathi
EOF
        print_status "✅ .env file created - please update with your API keys" "$YELLOW"
    else
        print_status "✅ .env file already exists" "$GREEN"
    fi
}

start_metro() {
    print_status "🔄 Starting Metro Bundler..." "$BLUE"
    
    # Kill any existing Metro processes
    pkill -f "react-native start" || true
    pkill -f "metro" || true
    
    # Start Metro in background
    npm start &
    METRO_PID=$!
    
    print_status "✅ Metro Bundler starting (PID: $METRO_PID)" "$GREEN"
    print_status "⏳ Waiting for Metro to initialize..." "$YELLOW"
    sleep 5
}

run_android() {
    print_status "🤖 Launching Android App..." "$BLUE"
    
    # Check if Android device/emulator is connected
    ANDROID_DEVICES=$(adb devices | grep -v "List of devices" | grep "device" | wc -l)
    
    if [ "$ANDROID_DEVICES" -eq 0 ]; then
        print_status "⚠️  No Android device connected" "$YELLOW"
        print_status "   Please connect a device or start an emulator" "$YELLOW"
        print_status "   - Connect physical device via USB with USB debugging enabled" "$YELLOW"
        print_status "   - Or start Android emulator from Android Studio" "$YELLOW"
        return 1
    fi
    
    print_status "📱 Found $ANDROID_DEVICES Android device(s)" "$GREEN"
    
    # Run on Android
    npx react-native run-android
    
    if [ $? -eq 0 ]; then
        print_status "🎉 Android app launched successfully!" "$GREEN"
    else
        print_status "❌ Failed to launch Android app" "$RED"
        return 1
    fi
}

run_ios() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_status "⚠️  iOS development only available on macOS" "$YELLOW"
        return 1
    fi
    
    print_status "📱 Launching iOS App..." "$BLUE"
    
    # Run on iOS
    npx react-native run-ios --simulator="iPhone 15"
    
    if [ $? -eq 0 ]; then
        print_status "🎉 iOS app launched successfully!" "$GREEN"
    else
        print_status "❌ Failed to launch iOS app" "$RED"
        print_status "   Try running: npx react-native run-ios --simulator=\"iPhone 14\"" "$YELLOW"
        return 1
    fi
}

show_menu() {
    print_status "\n📱 Choose Platform to Run:" "$BLUE"
    echo "1) Android"
    echo "2) iOS (macOS only)"
    echo "3) Both (Android first, then iOS)"
    echo "4) Setup only (no launch)"
    echo "5) Exit"
    
    read -p "Enter choice (1-5): " choice
    
    case $choice in
        1)
            run_android
            ;;
        2)
            run_ios
            ;;
        3)
            run_android
            if [ $? -eq 0 ]; then
                sleep 3
                run_ios
            fi
            ;;
        4)
            print_status "✅ Setup completed!" "$GREEN"
            ;;
        5)
            print_status "👋 Goodbye!" "$BLUE"
            exit 0
            ;;
        *)
            print_status "❌ Invalid choice" "$RED"
            show_menu
            ;;
    esac
}

show_final_instructions() {
    print_status "\n🎉 ParkSathi Mobile Setup Complete!" "$GREEN"
    print_status "================================================" "$GREEN"
    echo ""
    print_status "📝 Next Steps:" "$BLUE"
    echo "1. Update .env file with your API keys"
    echo "2. Ensure your backend is running on http://localhost:3000"
    echo "3. Connect Android device or start iOS simulator"
    echo "4. Choose a platform to run the app"
    echo ""
    print_status "🛠️  Useful Commands:" "$BLUE"
    echo "- npm start                 # Start Metro bundler"
    echo "- npm run android           # Run on Android"
    echo "- npm run ios               # Run on iOS"
    echo "- npm run build:android     # Build Android APK"
    echo "- npx react-native doctor   # Check setup issues"
    echo ""
    print_status "🐛 Troubleshooting:" "$BLUE"
    echo "- Clear cache: npm start -- --reset-cache"
    echo "- Clean build: cd android && ./gradlew clean"
    echo "- Check devices: adb devices"
    echo ""
}

# Main execution
main() {
    check_node
    check_react_native
    check_platform_tools
    install_dependencies
    setup_environment
    start_metro
    show_final_instructions
    show_menu
}

# Handle Ctrl+C
trap 'print_status "\n🛑 Setup interrupted by user" "$YELLOW"; exit 130' INT

# Run main function
main
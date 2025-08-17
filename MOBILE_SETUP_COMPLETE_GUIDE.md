# 🚀 Complete Mobile Setup Guide for ParkSathi
**Run Android & iOS Simulators - Step by Step**
**Author: Shreeraj Tuladhar - 1Ox4Fox LLC**

---

## 📋 Prerequisites Check

Before starting, verify you have:
- ✅ **macOS** (required for iOS development)
- ✅ **Node.js 16+** (you have v22.17.1 ✓)
- ✅ **npm 8+** (you have 11.4.2 ✓)
- ✅ **Admin access** to install software
- ✅ **At least 15GB free space** for development tools

---

## 🔧 Phase 1: Environment Setup

### Step 1: Install React Native CLI
```bash
# Install React Native CLI globally
npm install -g @react-native-community/cli

# Verify installation
npx react-native --version
```

### Step 2: Install Required Tools
```bash
# Install Watchman (Facebook's file watching service)
brew install watchman

# Install Node version manager (if needed)
brew install nvm

# Verify installations
watchman --version
```

### Step 3: Fix npm Permissions
```bash
# Fix npm cache permissions (if needed)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Alternative: use different npm directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

---

## 🤖 Phase 2: Android Development Setup

### Step 1: Install Android Studio
1. **Download Android Studio** from https://developer.android.com/studio
2. **Run the installer** and follow setup wizard
3. **Install these SDK components** during setup:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

### Step 2: Configure Android SDK
Open Android Studio and configure:

1. **Open SDK Manager** (Tools > SDK Manager)
2. **Install these SDK Platforms**:
   - ✅ Android 13 (API Level 33)
   - ✅ Android 12 (API Level 31) 
   - ✅ Android 11 (API Level 30)

3. **Switch to SDK Tools tab** and install:
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ Intel x86 Emulator Accelerator (HAXM installer)

### Step 3: Set Environment Variables
Add these to your `~/.zshrc` file:

```bash
# Android Environment Variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload terminal
source ~/.zshrc
```

### Step 4: Create Android Virtual Device (AVD)
1. **Open AVD Manager** in Android Studio (Tools > AVD Manager)
2. **Click "Create Virtual Device"**
3. **Choose device**: Pixel 4 or Pixel 5
4. **Select system image**: API 33 (Android 13)
5. **Name your AVD**: "ParkSathi_Android"
6. **Click Finish**

### Step 5: Test Android Setup
```bash
# Verify ADB is working
adb --version

# List available emulators
emulator -list-avds

# Start your emulator
emulator -avd ParkSathi_Android

# Verify emulator is running
adb devices
```

---

## 📱 Phase 3: iOS Development Setup (macOS Only)

### Step 1: Install Xcode
1. **Download Xcode** from Mac App Store (free)
2. **Install Xcode** (this will take 30-60 minutes)
3. **Open Xcode** and accept license agreements
4. **Install additional components** when prompted

### Step 2: Install Xcode Command Line Tools
```bash
# Install command line tools
xcode-select --install

# Verify installation
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer
```

### Step 3: Install CocoaPods
```bash
# Install CocoaPods (iOS dependency manager)
sudo gem install cocoapods

# Verify installation
pod --version

# Setup CocoaPods
pod setup
```

### Step 4: Configure iOS Simulator
1. **Open Xcode**
2. **Go to Window > Devices and Simulators**
3. **Click Simulators tab**
4. **Add these simulators**:
   - iPhone 14 (iOS 16.0)
   - iPhone 14 Pro (iOS 16.0)
   - iPad (10th generation)

### Step 5: Test iOS Setup
```bash
# List available simulators
xcrun simctl list devices

# Start iPhone 14 simulator
xcrun simctl boot "iPhone 14"

# Open simulator app
open -a Simulator
```

---

## ⚙️ Phase 4: ParkSathi Mobile Project Setup

### Step 1: Navigate to Project
```bash
cd /Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/parksathi-mobile
```

### Step 2: Install Dependencies
```bash
# Install Node.js dependencies
npm install --legacy-peer-deps

# For iOS: Install CocoaPods dependencies
cd ios && pod install && cd ..
```

### Step 3: Create Environment Configuration
```bash
# Create .env file
cat > .env << EOF
# ParkSathi Mobile Environment
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000

# Development settings
NODE_ENV=development
DEBUG=true

# Google Maps API Key (you'll need to get this)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Firebase Configuration (optional for now)
FIREBASE_PROJECT_ID=parksathi-mobile
FIREBASE_API_KEY=your_firebase_api_key_here
EOF
```

### Step 4: Verify Backend Connection
Make sure your ParkSathi backend is running:
```bash
# In another terminal, start your backend
cd /Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/parking-backend
npm start

# Should be running on http://localhost:3000
```

---

## 🏃‍♂️ Phase 5: Running the Mobile App

### Method 1: Using npm Scripts (Recommended)

#### For Android:
```bash
cd /Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/parksathi-mobile

# Start Metro bundler (in terminal 1)
npm start

# Run on Android (in terminal 2)
npm run android
```

#### For iOS:
```bash
cd /Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/parksathi-mobile

# Run on iOS (Metro will start automatically)
npm run ios

# Or specify simulator
npm run ios -- --simulator="iPhone 14"
```

### Method 2: Using Direct Commands

#### For Android:
```bash
# Start emulator first
emulator -avd ParkSathi_Android

# Then run app
npx react-native run-android
```

#### For iOS:
```bash
# Run on default simulator
npx react-native run-ios

# Run on specific simulator
npx react-native run-ios --simulator="iPhone 14 Pro"
```

---

## 🔍 Troubleshooting Common Issues

### Issue 1: "react-native: command not found"
**Solution:**
```bash
npm install -g @react-native-community/cli
# or use npx
npx react-native run-android
```

### Issue 2: Android emulator not starting
**Solutions:**
```bash
# Check available emulators
emulator -list-avds

# Start emulator manually
emulator -avd ParkSathi_Android

# Check if hardware acceleration is enabled
# In Android Studio: Tools > SDK Manager > SDK Tools > Intel HAXM
```

### Issue 3: iOS build fails
**Solutions:**
```bash
# Clean build folder
cd ios
xcodebuild clean
rm -rf build/

# Reinstall pods
pod deintegrate
pod install
cd ..

# Try running again
npm run ios
```

### Issue 4: Metro bundler issues
**Solutions:**
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear all caches
npx react-native clean

# Reset Node modules
rm -rf node_modules
npm install --legacy-peer-deps
```

### Issue 5: "Unable to load script from assets"
**Solutions:**
```bash
# Create assets directory
mkdir android/app/src/main/assets

# Bundle JavaScript
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

# Try running again
npm run android
```

---

## 🧪 Testing Your Setup

### Test Android Setup:
```bash
# 1. Check environment
echo $ANDROID_HOME
adb --version

# 2. List devices
adb devices

# 3. Run doctor command
npx react-native doctor

# 4. Start app
npm run android
```

### Test iOS Setup:
```bash
# 1. Check Xcode
xcode-select -p

# 2. List simulators
xcrun simctl list devices

# 3. Run doctor command
npx react-native doctor

# 4. Start app
npm run ios
```

---

## 🎯 Expected Results

### When Android is successful:
- ✅ Android emulator opens
- ✅ ParkSathi app installs automatically
- ✅ App launches showing home screen
- ✅ Metro bundler shows "BUILD SUCCESSFUL"

### When iOS is successful:
- ✅ iOS Simulator opens
- ✅ ParkSathi app installs automatically
- ✅ App launches showing home screen
- ✅ No build errors in terminal

### App Features to Test:
1. **Home Screen**: Should display ParkSathi dashboard
2. **Navigation**: Bottom tabs should work
3. **API Connection**: Should connect to localhost:3000
4. **Maps**: Google Maps should load (with API key)
5. **Forms**: Login/register forms should be responsive

---

## 📱 Development Workflow

### Daily Development:
```bash
# Terminal 1: Keep Metro running
cd parksathi-mobile
npm start

# Terminal 2: Backend server
cd parking-backend
npm start

# Terminal 3: Commands as needed
npm run android  # or npm run ios
```

### Making Changes:
- **Hot Reload**: Enabled by default - changes reflect immediately
- **Manual Reload**: Shake device/emulator or press R twice
- **Debug Menu**: Cmd+D (iOS) or Cmd+M (Android)

---

## 🚀 Advanced Configuration

### Custom Simulators:
```bash
# Create custom Android AVD with specific settings
# Use Android Studio AVD Manager for GUI

# Create iOS simulator with specific iOS version
# Use Xcode > Window > Devices and Simulators
```

### Performance Optimization:
```bash
# Enable Hermes JavaScript engine (already enabled in config)
# Optimize images and assets
# Use ProGuard for Android release builds
```

### Debugging Tools:
```bash
# React Native Debugger
npm install -g react-native-debugger

# Flipper (Facebook's debugging platform)
# Download from https://fbflipper.com/
```

---

## 📞 Getting Help

### If you encounter issues:

1. **Check System Status:**
```bash
npx react-native doctor
```

2. **Clean Everything:**
```bash
cd parksathi-mobile
npm run clean
rm -rf node_modules
npm install --legacy-peer-deps
cd ios && pod install && cd ..
```

3. **Community Resources:**
   - React Native Documentation: https://reactnative.dev/
   - Stack Overflow: Search "react-native [your error]"
   - React Native Discord: https://discord.gg/react-native

4. **Emergency Fallback:**
   If native setup is too complex, we can create a web-based mobile preview that works in browser immediately.

---

## 🎉 Success Checklist

After completing this setup, you should have:
- ✅ React Native development environment working
- ✅ Android Studio with emulator running ParkSathi
- ✅ Xcode with iOS simulator running ParkSathi  
- ✅ Hot reload working for rapid development
- ✅ Connection to your existing backend API
- ✅ Mobile app showing your parking locations
- ✅ Ready for presentation demonstration

**🚀 Your ParkSathi mobile app is now running on both platforms and ready for the judging panel demonstration!**

---

**© 2025 1Ox4Fox LLC - Mobile Development Guide**  
**Created by Shreeraj Tuladhar**
# 🚀 ParkSathi Mobile App - Quick Demo Setup

**Since React Native requires platform-specific tools, here's how to get the mobile app running:**

## 📱 Option 1: Run the Setup Script (Recommended)

```bash
# Navigate to the mobile app directory
cd /Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp/parksathi-mobile

# Run the automated setup script
./scripts/setup-and-run.sh
```

## 📱 Option 2: Manual Setup

### Step 1: Install React Native CLI
```bash
npm install -g @react-native-community/cli
```

### Step 2: Fix Permissions (if needed)
```bash
sudo chown -R $(whoami) /tmp/npm-cache
```

### Step 3: Install Dependencies
```bash
cd parksathi-mobile
npm install --legacy-peer-deps
```

### Step 4: Run the App

**For Android:**
```bash
# Start Metro bundler
npm start

# In another terminal, run on Android
npm run android
```

**For iOS (macOS only):**
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npm run ios
```

## 🔧 Prerequisites Needed:

### For Android Development:
- ✅ Node.js 16+ (You have v22.17.1 ✓)
- ✅ npm (You have 11.4.2 ✓)
- 📦 Android Studio
- 📦 Android SDK
- 📦 Android emulator or physical device

### For iOS Development (macOS only):
- 📦 Xcode
- 📦 Xcode Command Line Tools
- 📦 CocoaPods
- 📦 iOS Simulator

## 🎯 What the Mobile App Includes:

### ✅ Screens & Navigation:
- **Home Screen** - Dashboard with quick actions
- **Map Screen** - Interactive parking locations
- **Search Screen** - Find parking spaces
- **Booking Screen** - Reserve parking spots
- **Profile Screen** - User settings and history

### ✅ Native Features:
- **GPS Location** - Find nearby parking
- **Push Notifications** - Booking alerts
- **QR Scanner** - Entry/exit verification
- **Offline Mode** - Basic functionality without internet
- **Biometric Auth** - Fingerprint/Face ID login

### ✅ Backend Integration:
- **Same API** - Uses your existing ParkSathi backend
- **Real-time Updates** - WebSocket integration
- **JWT Authentication** - Secure login/logout
- **Payment Processing** - Mobile-optimized payments

## 🚀 Quick Demo Alternative:

If you want to see the mobile app concept immediately, I can show you:

1. **Web-based Mobile Preview** - Create a mobile-responsive web version
2. **PWA Version** - Progressive Web App for mobile browsers
3. **Screenshots** - Show the mobile UI designs

Would you like me to create any of these alternatives while you set up the React Native environment?

## 📞 Need Help?

If you encounter any issues:

1. **Check Prerequisites**: Run `npx react-native doctor`
2. **Clear Cache**: `npm start -- --reset-cache`
3. **Check Devices**: `adb devices` (Android) or iOS Simulator
4. **Restart Metro**: Kill and restart the Metro bundler

## 🎉 Expected Result:

Once running, you'll see:
- 📱 ParkSathi mobile app on your device/simulator
- 🗺️ Interactive map with parking locations
- 🏠 Home dashboard with quick parking search
- 📋 Full booking and payment flow
- 🔔 Push notification setup

**The mobile app uses your existing backend - no additional server setup needed!**

---

**Ready to experience ParkSathi on mobile? Let's get it running! 📱🚗**
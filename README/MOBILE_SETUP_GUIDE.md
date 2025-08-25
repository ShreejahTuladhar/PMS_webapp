# ParkSathi Mobile App Setup Guide
**Conceptualized & Developed by Shreeraj Tuladhar - 1Ox4Fox LLC**

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 16+ and npm/yarn
- **React Native CLI** (`npm install -g react-native-cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **CocoaPods** (for iOS dependencies)

### 1. Initialize the React Native Project

```bash
# Navigate to your ParkSathi project
cd /Users/shreerajtuladhar/WorkSpace/PMS/PMS_webapp

# The mobile app is already created in parksathi-mobile/
cd parksathi-mobile

# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### 2. Environment Configuration

Create `.env` file in `parksathi-mobile/`:
```bash
# API Configuration
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000

# Maps API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_key
APPLE_MAPS_API_KEY=your_apple_maps_key

# Firebase Configuration
FIREBASE_PROJECT_ID=parksathi-mobile
FIREBASE_API_KEY=your_firebase_key
FIREBASE_SENDER_ID=your_sender_id

# App Configuration
APP_VERSION=1.0.0
APP_BUILD_NUMBER=1
BUNDLE_ID=com.ox4fox.parksathi
```

### 3. Platform Setup

#### Android Setup
```bash
# Make sure Android SDK is configured
npx react-native doctor

# Create release keystore (for production)
keytool -genkey -v -keystore android/app/my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### iOS Setup (macOS only)
```bash
# Install pods
cd ios && pod install && cd ..

# Open Xcode project
open ios/ParkSathi.xcworkspace
```

### 4. Running the App

#### Development Mode
```bash
# Start Metro bundler
npm start

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android

# Run on specific device
npx react-native run-android --deviceId=<device_id>
npx react-native run-ios --simulator="iPhone 14"
```

#### Production Build
```bash
# Android Release
npm run build:android

# iOS Archive (macOS only)
npm run build:ios
```

## 🔧 Integration with Existing Backend

### API Integration
The mobile app automatically connects to your existing ParkSathi backend:

- **Development**: `http://localhost:3000/api`
- **Production**: Update `API_BASE_URL` in `.env`

### Shared Features
- ✅ User authentication (login/register)
- ✅ Parking search and booking
- ✅ Payment processing
- ✅ Real-time updates via WebSocket
- ✅ Push notifications
- ✅ GPS location services

### Database
Uses the same MongoDB database as your web app - no additional setup required!

## 📱 Mobile-Specific Features

### Native Capabilities
- **GPS Location**: Real-time location tracking
- **Push Notifications**: Firebase Cloud Messaging
- **QR Code Scanner**: Camera-based parking entry/exit
- **Biometric Auth**: Fingerprint/Face ID login
- **Offline Mode**: Basic functionality without internet
- **Deep Linking**: Direct navigation from external apps

### Platform-Specific Features

#### iOS Features
- Apple Pay integration
- Siri Shortcuts for voice commands
- Apple Wallet parking passes
- 3D Touch quick actions
- iOS widgets
- CarPlay integration

#### Android Features
- Google Pay integration
- Android Auto integration
- Google Wallet passes
- Adaptive icons
- Android widgets
- Shortcuts

## 🧪 Testing

### Development Testing
```bash
# Unit tests
npm test

# Run specific test
npm test -- --testNamePattern="Button"

# Watch mode
npm test -- --watch
```

### Device Testing
```bash
# List connected devices
adb devices              # Android
xcrun simctl list        # iOS

# Install on specific device
npx react-native run-android --deviceId=<device_id>
npx react-native run-ios --device="<device_name>"
```

### Debugging
```bash
# React Native Debugger
npm install -g react-native-debugger

# Flipper (recommended)
npx react-native start
# Then open Flipper app
```

## 🔒 Security Configuration

### API Security
- JWT tokens stored in secure keychain
- Certificate pinning for API calls
- Biometric authentication support

### App Security
- Code obfuscation for production builds
- Root/Jailbreak detection
- Anti-tampering protection

## 📦 Building for Production

### Android Release
```bash
# Generate release APK
cd android && ./gradlew assembleRelease

# Generate App Bundle (recommended)
cd android && ./gradlew bundleRelease

# APK location: android/app/build/outputs/apk/release/
# Bundle location: android/app/build/outputs/bundle/release/
```

### iOS Release (macOS only)
```bash
# Archive for App Store
xcodebuild -workspace ios/ParkSathi.xcworkspace \
           -scheme ParkSathi \
           -configuration Release \
           -destination generic/platform=iOS \
           -archivePath ParkSathi.xcarchive \
           archive

# Or use Xcode:
# 1. Open ios/ParkSathi.xcworkspace
# 2. Select "Any iOS Device" as target
# 3. Product > Archive
# 4. Upload to App Store Connect
```

## 🚀 Deployment

### Google Play Store (Android)
1. Create developer account
2. Generate signed APK/Bundle
3. Upload to Google Play Console
4. Complete store listing
5. Submit for review

### Apple App Store (iOS)
1. Create developer account ($99/year)
2. Register app in App Store Connect
3. Archive and upload via Xcode
4. Complete app metadata
5. Submit for review

### CI/CD Pipeline
```yaml
# GitHub Actions example (.github/workflows/mobile-deploy.yml)
name: Deploy Mobile App
on:
  push:
    branches: [main]
    paths: ['parksathi-mobile/**']
jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd parksathi-mobile && npm ci
      - name: Build Android
        run: cd parksathi-mobile && npm run build:android
```

## 🛠️ Customization

### Branding
Update the following files:
- `parksathi-mobile/android/app/src/main/res/` (Android icons)
- `parksathi-mobile/ios/ParkSathi/Images.xcassets/` (iOS icons)
- `parksathi-mobile/src/assets/` (App images)

### App Name & Bundle ID
- **Android**: `android/app/build.gradle`
- **iOS**: Xcode project settings

### Colors & Themes
- `src/styles/colors.js` - Color constants
- `src/styles/themes.js` - Light/dark themes

## 🔄 Updates & Maintenance

### Over-the-Air Updates
Consider using:
- **CodePush** (Microsoft)
- **Expo Updates**
- **AppCenter** (Microsoft)

### Version Management
- Update `version` in `package.json`
- Update `versionCode`/`CFBundleVersion` for stores
- Tag releases in Git

## 📞 Support & Troubleshooting

### Common Issues

**Metro bundler not starting:**
```bash
npx react-native start --reset-cache
```

**Android build fails:**
```bash
cd android && ./gradlew clean
cd .. && npm run android
```

**iOS build fails:**
```bash
cd ios && pod install && cd ..
npm run ios
```

**Can't connect to development server:**
- Check `adb reverse tcp:8081 tcp:8081`
- Ensure device and computer on same network
- Check firewall settings

### Performance Optimization
- Enable Hermes JavaScript engine
- Use ProGuard for Android
- Optimize images (WebP format)
- Implement lazy loading
- Profile with Flipper

## 📈 Analytics & Monitoring

### Crash Reporting
- Firebase Crashlytics (recommended)
- Sentry
- Bugsnag

### Analytics
- Firebase Analytics
- Google Analytics for Firebase
- Mixpanel

### Performance Monitoring
- Firebase Performance
- New Relic
- AppDynamics

## 🎯 Next Steps

1. **Complete Setup**: Follow this guide to set up development environment
2. **Test on Devices**: Install on physical devices for testing
3. **Customize Branding**: Update app icons, colors, and branding
4. **Add API Keys**: Configure Google Maps, Firebase, and other services
5. **Test Core Features**: Verify all functionality works correctly
6. **Prepare for Store**: Create store listings and screenshots
7. **Submit to Stores**: Deploy to Google Play and App Store

## 🔗 Useful Links

- **React Native Documentation**: https://reactnative.dev/docs/getting-started
- **Firebase Console**: https://console.firebase.google.com/
- **Google Play Console**: https://play.google.com/console/
- **Apple Developer**: https://developer.apple.com/
- **Android Studio**: https://developer.android.com/studio
- **Xcode**: https://developer.apple.com/xcode/

---

**🎉 Your ParkSathi mobile app is ready to launch!**

**© 2025 1Ox4Fox LLC - All Rights Reserved**  
**Conceptualized & Developed by Shreeraj Tuladhar**

*Transform your parking experience with native mobile power!*
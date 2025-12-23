# Android Emulator Setup Guide

## Quick Setup (30 minutes)

### 1. Install Android Studio
Download from: https://developer.android.com/studio

### 2. Install Android SDK
1. Open Android Studio
2. Go to: **Tools > SDK Manager**
3. Install:
   - ✅ Android SDK Platform 34 (or latest)
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools

### 3. Create Virtual Device
1. Go to: **Tools > Device Manager**
2. Click **Create Device**
3. Select: **Phone > Pixel 5** (recommended)
4. Download a system image (e.g., Android 13 - Tiramisu)
5. Click **Finish**

### 4. Set Environment Variable
Add to System Environment Variables:
```
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

### 5. Start Emulator
```bash
# List available emulators
emulator -list-avds

# Start an emulator
emulator -avd Pixel_5_API_33
```

### 6. Run Expo on Emulator
With emulator running:
```bash
npm start
# Press 'a' for Android
```

---

## Alternative: Use Physical Device

1. Enable **Developer Options** on your Android phone:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times

2. Enable **USB Debugging**:
   - Settings > Developer Options > USB Debugging

3. Connect phone via USB

4. Check connection:
   ```bash
   adb devices
   ```

5. Run Expo:
   ```bash
   npm start
   # Press 'a' for Android
   ```

---

## Recommended: Use Expo Go (No Setup Needed!)

1. Install Expo Go from Play Store
2. Scan QR code from terminal
3. Done! ✨

This is the fastest way to test React Native apps.

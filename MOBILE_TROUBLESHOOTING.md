# Mobile App Connection Troubleshooting

**Issue:** Expo Go app keeps reloading and returns to home page

## Current Status
- ✅ Expo Metro Bundler: **Running** (Process ID: 20056)
- ✅ Mode: **Tunnel** (with @expo/ngrok)
- ✅ Server URL: `exp://ntamuoc-anonymous-8082.exp.direct`
- ⚠️ Phone Connection: **Not working** (reload loop)

## Possible Causes

### 1. JavaScript/TypeScript Errors
**Solution:** Check Metro Bundler console for errors
```bash
# The terminal running `npx expo start --tunnel` should show any errors
# Look for red error messages or warnings
```

### 2. Dependency Issues
**Solution:** Reinstall dependencies
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

### 3. React Native Calendars Compatibility
**Issue:** Recently updated react-native-calendars to v1.1313.0
**Solution:** Test if calendar component causes issues
```bash
# Temporarily comment out SchedulePaymentScreen import in App.tsx
# Test if app loads
```

### 4. Tunnel Connection Issues
**Solution:** Try different connection modes
```bash
# Option 1: LAN mode
npx expo start --lan

# Option 2: Local mode
npx expo start --localhost

# Option 3: Clear tunnel and restart
npx expo start --clear --tunnel
```

### 5. Expo Go Version Mismatch
**Solution:** Update Expo Go on phone
- Open Google Play Store
- Search "Expo Go"
- Update to latest version
- Restart app

### 6. Network Firewall
**Solution:** Check Windows Firewall
- Allow Node.js through Windows Defender Firewall
- Allow Metro Bundler port (8082)
- Allow ngrok tunnel connections

## Recommended Testing Order

### Step 1: Test Web Version First
```bash
cd mobile
npx expo start
# Press 'w' when terminal loads
```
This will open in browser and show any JavaScript errors immediately.

### Step 2: Check Metro Bundler Logs
Look in the terminal running Expo for:
- Red error messages
- Failed module imports
- Compilation errors
- TypeScript errors

### Step 3: Clear All Caches
```bash
cd mobile
npx expo start --clear
# This clears Metro bundler cache
# Scan QR code again
```

### Step 4: Try Android Emulator
```bash
# If you have Android Studio installed:
npx expo start
# Press 'a' when terminal loads
```

### Step 5: Check Component Errors
Common issues:
- Missing imports
- Undefined props
- Navigation errors
- Async storage issues

## Quick Fixes

### Fix 1: Update Expo CLI
```bash
npm install -g expo-cli@latest
```

### Fix 2: Check App.tsx
Verify all screen imports exist:
```typescript
// Ensure all these files exist:
- LandingScreen.tsx
- DashboardScreen.tsx
- MarketScreen.tsx
- SchedulePaymentScreen.tsx
// etc.
```

### Fix 3: Test Minimal App
Create a test version with just one screen to isolate the issue.

## Alternative: Use Android Emulator

If phone connection continues failing:

1. Install Android Studio
2. Create Android Virtual Device (AVD)
3. Start emulator
4. Run: `npx expo start` and press 'a'

## Backend is Working! ✅

**Important:** All blockchain features are working perfectly:
- ✅ Payment Scheduler: Fully operational
- ✅ Price Oracle: Live price updates
- ✅ Token Transfers: Send/receive working
- ✅ All 7 contracts: Initialized and active

**The mobile app connection issue doesn't affect backend functionality.**

## Next Steps

1. **Immediate:** Try web version to see if app logic works
2. **Short-term:** Debug Metro Bundler logs for specific errors
3. **Alternative:** Use Android emulator for testing
4. **Long-term:** Consider testing on different phone/network

## Support Commands

```bash
# Check Expo status
npx expo whoami

# Check dependencies
npm list

# Verify package.json integrity
npm install --package-lock-only

# Full clean install
rm -rf node_modules package-lock.json
npm install

# Start with maximum verbosity
npx expo start --tunnel --verbose
```

## Contact Info

If issues persist:
- Check Expo documentation: https://docs.expo.dev
- Expo forums: https://forums.expo.dev
- GitHub issues: https://github.com/expo/expo/issues

---

**Note:** The blockchain backend is 100% functional. The mobile app connection is a client-side issue that doesn't affect the smart contracts or transaction processing. All features can be tested via direct blockchain interactions as demonstrated in [FEATURE_VERIFICATION_REPORT.md](FEATURE_VERIFICATION_REPORT.md).

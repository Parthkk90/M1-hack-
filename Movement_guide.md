# 🚀 Movement Testnet Migration Guide

**Complete React Native App Configuration for Movement Network**  
Based on Monad Testnet Riga Wallet Implementation  
Last Updated: December 31, 2025

---

## 📋 Table of Contents

1. [Core Dependencies](#core-dependencies)
2. [Configuration Files](#configuration-files)
3. [Movement Network Setup](#movement-network-setup)
4. [Project Structure](#project-structure)
5. [Installation Steps](#installation-steps)
6. [Implementation Examples](#implementation-examples)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Core Dependencies

### Package.json - All Required Versions

```json
{
  "name": "your-movement-app",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@craftzdog/react-native-buffer": "^6.1.1",
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "buffer": "^6.0.3",
    "ethers": "^6.16.0",
    "expo": "~54.0.29",
    "expo-camera": "^17.0.10",
    "expo-clipboard": "~8.0.8",
    "expo-constants": "~18.0.12",
    "expo-crypto": "^15.0.8",
    "expo-font": "~14.0.10",
    "expo-haptics": "~15.0.8",
    "expo-linear-gradient": "~15.0.8",
    "expo-linking": "~8.0.10",
    "expo-router": "~6.0.19",
    "expo-secure-store": "^15.0.8",
    "expo-splash-screen": "~31.0.12",
    "expo-status-bar": "~3.0.9",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-chart-kit": "^6.12.0",
    "react-native-crypto": "^2.2.1",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-get-random-values": "~1.11.0",
    "react-native-gifted-charts": "^1.4.70",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-qrcode-svg": "^6.3.21",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "^15.12.1",
    "react-native-web": "~0.21.0",
    "readable-stream": "^4.7.0",
    "viem": "^2.41.2"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "typescript": "~5.9.2"
  }
}
```

### Dependency Categories Breakdown

**🔗 Blockchain Core:**
- `ethers`: ^6.16.0 - Ethereum library for wallet & contract interactions
- `viem`: ^2.41.2 - Modern EVM library with better TypeScript support

**🔐 Crypto Polyfills (CRITICAL):**
- `@craftzdog/react-native-buffer`: ^6.1.1
- `buffer`: ^6.0.3
- `react-native-crypto`: ^2.2.1
- `react-native-get-random-values`: ~1.11.0
- `readable-stream`: ^4.7.0

**💾 Storage:**
- `@react-native-async-storage/async-storage`: ^2.2.0 - General storage
- `expo-secure-store`: ^15.0.8 - Secure private key storage

**🧭 Navigation:**
- `@react-navigation/native`: ^7.1.8
- `@react-navigation/bottom-tabs`: ^7.4.0
- `expo-router`: ~6.0.19
- `react-native-screens`: ~4.16.0
- `react-native-safe-area-context`: ~5.6.0

**📊 Charts & Visualization:**
- `react-native-svg`: ^15.12.1
- `react-native-chart-kit`: ^6.12.0
- `react-native-gifted-charts`: ^1.4.70
- `react-native-linear-gradient`: ^2.8.3

**📱 Mobile Features:**
- `expo-camera`: ^17.0.10 - QR scanning
- `expo-clipboard`: ~8.0.8 - Copy addresses
- `expo-haptics`: ~15.0.8 - Haptic feedback
- `react-native-qrcode-svg`: ^6.3.21 - QR generation

---

## ⚙️ Configuration Files

### 1. app.json (Expo Configuration)

```json
{
  "expo": {
    "name": "Movement Wallet",
    "slug": "movement-wallet",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "movementwallet",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}
```

### 2. metro.config.js (CRITICAL - Crypto Support)

**⚠️ This is the most important file for blockchain functionality!**

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add polyfills for Node.js core modules required by ethers/viem
config.resolver.alias = {
  crypto: 'react-native-crypto',
  stream: 'readable-stream',
  buffer: '@craftzdog/react-native-buffer',
};

config.resolver.fallback = {
  crypto: require.resolve('react-native-crypto'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('buffer'),
};

module.exports = config;
```

### 3. tsconfig.json (TypeScript Configuration)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

### 4. eslint.config.js (Linting)

```javascript
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
```

### 5. expo-env.d.ts (TypeScript Types)

```typescript
/// <reference types="expo/types" />
```

---

## 🌐 Movement Network Setup

### Movement Testnet Configuration

Create or update `services/web3Service.ts`:

```typescript
import { ethers } from 'ethers';
import { createPublicClient, createWalletClient, defineChain, http } from 'viem';
import '../utils/globalPolyfills';

// Movement Testnet Chain Definition for Viem
export const movementTestnet = defineChain({
  id: 30732,
  name: 'Movement Testnet',
  network: 'movement-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MOVE',
    symbol: 'MOVE',
  },
  rpcUrls: {
    default: {
      http: ['https://mevm.testnet.imola.movementlabs.xyz'],
    },
    public: {
      http: ['https://mevm.testnet.imola.movementlabs.xyz'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Movement Explorer', 
      url: 'https://explorer.testnet.imola.movementlabs.xyz' 
    },
  },
  testnet: true,
});

// Network Configuration
export const MOVEMENT_CONFIG = {
  chain: movementTestnet,
  rpcUrls: ['https://mevm.testnet.imola.movementlabs.xyz'],
  chainId: 30732,
  name: 'Movement Testnet',
  blockExplorerUrl: 'https://explorer.testnet.imola.movementlabs.xyz',
};

// Your Contract Addresses (Deploy these first!)
export const CONTRACT_ADDRESSES = {
  YourContract: '0x...', // Add your deployed contract address
};

// Storage Keys
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  PRIVATE_KEY: 'private_key',
  WALLET_NAME: 'wallet_name',
  TRANSACTION_HISTORY: 'transaction_history',
};

class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private publicClient: any;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(MOVEMENT_CONFIG.rpcUrls[0]);
    this.publicClient = createPublicClient({
      chain: movementTestnet,
      transport: http(MOVEMENT_CONFIG.rpcUrls[0]),
    });
  }

  // Create new wallet
  async createWallet(name: string = 'My Wallet'): Promise<string> {
    const wallet = ethers.Wallet.createRandom();
    
    // Store private key securely
    await SecureStore.setItemAsync(STORAGE_KEYS.PRIVATE_KEY, wallet.privateKey);
    await AsyncStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, wallet.address);
    await AsyncStorage.setItem(STORAGE_KEYS.WALLET_NAME, name);
    
    this.wallet = new ethers.Wallet(wallet.privateKey, this.provider);
    return wallet.address;
  }

  // Load existing wallet
  async loadWallet(): Promise<string | null> {
    const privateKey = await SecureStore.getItemAsync(STORAGE_KEYS.PRIVATE_KEY);
    if (!privateKey) return null;
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    return this.wallet.address;
  }

  // Get balance
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Send transaction
  async sendTransaction(to: string, amount: string) {
    if (!this.wallet) throw new Error('Wallet not loaded');
    
    const tx = await this.wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount),
    });
    
    return await tx.wait();
  }

  // Interact with smart contract
  async callContract(contractAddress: string, abi: any, method: string, params: any[]) {
    if (!this.wallet) throw new Error('Wallet not loaded');
    
    const contract = new ethers.Contract(contractAddress, abi, this.wallet);
    const tx = await contract[method](...params);
    return await tx.wait();
  }
}

export default new Web3Service();
```

### Movement Network Details

| Parameter | Value |
|-----------|-------|
| Chain ID | `30732` |
| Network Name | Movement Testnet |
| RPC URL | `https://mevm.testnet.imola.movementlabs.xyz` |
| Symbol | `MOVE` |
| Decimals | `18` |
| Block Explorer | `https://explorer.testnet.imola.movementlabs.xyz` |
| Faucet | Use official Movement faucet |

---

## 📁 Project Structure

```
your-movement-app/
├── app/                           # Expo Router - File-based routing
│   ├── _layout.tsx               # Root layout with tabs
│   ├── index.tsx                 # Home/Wallet screen
│   ├── swap.tsx                  # Swap screen
│   ├── markets.tsx               # Markets screen
│   └── ...other screens
│
├── services/                     # Business logic
│   ├── web3Service.ts           # Blockchain interactions
│   ├── walletStorage.ts         # Secure storage helpers
│   ├── contractServices.ts      # Smart contract wrappers
│   └── priceService.ts          # Token price fetching
│
├── utils/                        # Utilities
│   └── globalPolyfills.ts       # Crypto polyfills (CRITICAL)
│
├── constants/                    # Constants
│   └── contractABIs.ts          # Your contract ABIs
│
├── hooks/                        # Custom React hooks
│   └── useWalletState.ts        # Wallet state management
│
├── assets/                       # Images, fonts, etc.
│   └── images/
│
├── app.json                      # Expo configuration
├── metro.config.js              # Metro bundler config (CRITICAL)
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

---

## 🚀 Installation Steps

### Step 1: Create Expo Project

```bash
# Create new project with TypeScript template
npx create-expo-app@latest movement-wallet --template blank-typescript

cd movement-wallet
```

### Step 2: Install Core Dependencies

```bash
# Expo & React Native core
npm install expo@~54.0.29 expo-router@~6.0.19

# Blockchain libraries
npm install ethers@^6.16.0 viem@^2.41.2

# Crypto polyfills (MUST HAVE)
npm install @craftzdog/react-native-buffer@^6.1.1
npm install buffer@^6.0.3
npm install react-native-crypto@^2.2.1
npm install react-native-get-random-values@~1.11.0
npm install readable-stream@^4.7.0

# Storage
npm install @react-native-async-storage/async-storage@^2.2.0
npm install expo-secure-store@^15.0.8
npm install expo-crypto@^15.0.8

# Navigation
npm install @react-navigation/native@^7.1.8
npm install @react-navigation/bottom-tabs@^7.4.0
npm install react-native-safe-area-context@~5.6.0
npm install react-native-screens@~4.16.0
npm install react-native-gesture-handler@~2.28.0
npm install react-native-reanimated@~4.1.1

# UI Components
npm install @expo/vector-icons@^15.0.3
npm install react-native-svg@^15.12.1
npm install expo-linear-gradient@~15.0.8
npm install expo-haptics@~15.0.8
```

### Step 3: Install Optional Dependencies

```bash
# QR Code functionality
npm install expo-camera@^17.0.10
npm install react-native-qrcode-svg@^6.3.21

# Charts
npm install react-native-chart-kit@^6.12.0
npm install react-native-gifted-charts@^1.4.70
npm install react-native-linear-gradient@^2.8.3

# Utilities
npm install expo-clipboard@~8.0.8
npm install expo-constants@~18.0.12
```

### Step 4: Create Essential Files

**Create `utils/globalPolyfills.ts`:**

```typescript
import { Buffer } from 'buffer';

// Make Buffer globally available for ethers and other crypto libraries
if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
}

// Also make it available on window for web environments
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).Buffer = Buffer;
}
```

**Create/Update `metro.config.js`:**

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  crypto: 'react-native-crypto',
  stream: 'readable-stream',
  buffer: '@craftzdog/react-native-buffer',
};

config.resolver.fallback = {
  crypto: require.resolve('react-native-crypto'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('buffer'),
};

module.exports = config;
```

**Create `app/_layout.tsx`:**

```typescript
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// CRITICAL: Import these FIRST before any blockchain code
import 'react-native-get-random-values';
import '../utils/globalPolyfills';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6C5CE7',
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Wallet' }}
        />
        {/* Add more tabs */}
      </Tabs>
    </SafeAreaProvider>
  );
}
```

### Step 5: Start Development

```bash
# Start Expo development server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

---

## 💻 Implementation Examples

### Example 1: Wallet Creation

```typescript
import web3Service from './services/web3Service';

const createNewWallet = async () => {
  try {
    const address = await web3Service.createWallet('My Movement Wallet');
    console.log('Wallet created:', address);
    
    // Get initial balance
    const balance = await web3Service.getBalance(address);
    console.log('Balance:', balance, 'MOVE');
  } catch (error) {
    console.error('Wallet creation failed:', error);
  }
};
```

### Example 2: Send Transaction

```typescript
const sendMOVE = async (toAddress: string, amount: string) => {
  try {
    const receipt = await web3Service.sendTransaction(toAddress, amount);
    console.log('Transaction hash:', receipt.hash);
    console.log('Block number:', receipt.blockNumber);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
};
```

### Example 3: Smart Contract Interaction

```typescript
import { ethers } from 'ethers';
import web3Service from './services/web3Service';
import YourContractABI from './constants/YourContractABI.json';

const interactWithContract = async () => {
  try {
    const result = await web3Service.callContract(
      '0xYourContractAddress',
      YourContractABI,
      'yourMethodName',
      [param1, param2]
    );
    console.log('Contract call result:', result);
  } catch (error) {
    console.error('Contract interaction failed:', error);
  }
};
```

### Example 4: QR Code Address Display

```typescript
import QRCode from 'react-native-qrcode-svg';
import { View, Text } from 'react-native';

const WalletQRCode = ({ address }: { address: string }) => {
  return (
    <View>
      <QRCode
        value={address}
        size={200}
        backgroundColor="white"
        color="black"
      />
      <Text>{address}</Text>
    </View>
  );
};
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### ❌ Error: "crypto module not found"

**Solution:**
1. Ensure `metro.config.js` has crypto aliases
2. Check that `react-native-crypto` is installed
3. Restart Metro bundler: `npx expo start -c`

```bash
# Reinstall crypto dependencies
npm install react-native-crypto react-native-get-random-values
```

#### ❌ Error: "Buffer is not defined"

**Solution:**
1. Import `globalPolyfills.ts` at the top of `app/_layout.tsx`
2. Make sure `@craftzdog/react-native-buffer` is installed
3. Import order matters: polyfills must come BEFORE ethers/viem

```typescript
// Correct order in _layout.tsx
import 'react-native-get-random-values';  // FIRST
import '../utils/globalPolyfills';         // SECOND
import { ethers } from 'ethers';          // THIRD
```

#### ❌ Error: "getRandomValues not available"

**Solution:**
```bash
npm install react-native-get-random-values
```

Then import at the top of `_layout.tsx`:
```typescript
import 'react-native-get-random-values';
```

#### ❌ Error: "Network connection failed"

**Solution:**
1. Verify Movement RPC URL is correct: `https://mevm.testnet.imola.movementlabs.xyz`
2. Check internet connection
3. Test RPC directly:

```bash
curl -X POST https://mevm.testnet.imola.movementlabs.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

#### ❌ Error: "Transaction reverted"

**Solution:**
1. Check you have sufficient MOVE tokens
2. Verify gas estimation is correct
3. Ensure contract ABI matches deployed contract
4. Check contract address is correct

#### ❌ Error: "Metro bundler cache issues"

**Solution:**
```bash
# Clear all caches and restart
npx expo start -c

# Or manually clear
rm -rf node_modules
rm -rf .expo
npm install
```

#### ❌ Error: "Module not found: stream, crypto, etc."

**Solution:**
Your `metro.config.js` is not properly configured. Copy the exact config from above.

---

## 📝 Development Checklist

### Before You Start

- [ ] Node.js installed (v18+ recommended)
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Android Studio or Xcode (for mobile testing)
- [ ] Movement testnet MOVE tokens from faucet

### Project Setup

- [ ] Create Expo project with TypeScript
- [ ] Install all blockchain dependencies
- [ ] Configure `metro.config.js` with crypto polyfills
- [ ] Create `utils/globalPolyfills.ts`
- [ ] Update `app.json` with your app details
- [ ] Set up `tsconfig.json`

### Movement Integration

- [ ] Update `web3Service.ts` with Movement config
- [ ] Test wallet creation
- [ ] Test wallet loading from storage
- [ ] Test balance fetching
- [ ] Test transaction sending
- [ ] Deploy contracts to Movement testnet
- [ ] Update contract addresses in code
- [ ] Test contract interactions

### Features to Implement

- [ ] Wallet creation/import
- [ ] Balance display
- [ ] Send transactions
- [ ] Receive (QR code)
- [ ] Transaction history
- [ ] Contract interactions
- [ ] Token swaps (if needed)
- [ ] Price feeds (if needed)

### Testing

- [ ] Test on iOS (physical device or simulator)
- [ ] Test on Android (physical device or emulator)
- [ ] Test on web (optional)
- [ ] Test offline behavior
- [ ] Test error handling
- [ ] Test transaction confirmations

---

## 🔐 Security Best Practices

1. **Private Key Storage**
   - Always use `expo-secure-store` for private keys
   - Never log private keys
   - Never commit private keys to git

2. **Network Security**
   - Use HTTPS for all RPC calls
   - Validate all user inputs
   - Implement rate limiting for API calls

3. **Transaction Safety**
   - Always show confirmation dialogs
   - Display gas fees before transactions
   - Implement transaction limits if needed

4. **Code Security**
   - Keep dependencies updated
   - Use TypeScript for type safety
   - Validate all contract addresses

---

## 🎯 Next Steps

1. **Set up your Movement project folder**
2. **Copy this guide** to your project
3. **Follow installation steps** exactly
4. **Test each feature** incrementally
5. **Deploy contracts** to Movement testnet
6. **Update contract addresses** in your code
7. **Build and test** your app

---

## 📚 Additional Resources

### Movement Network
- Docs: https://docs.movementlabs.xyz
- Explorer: https://explorer.testnet.imola.movementlabs.xyz
- Faucet: Check Movement Discord/docs for testnet faucet

### Development Tools
- Expo Docs: https://docs.expo.dev
- Ethers.js Docs: https://docs.ethers.org/v6
- Viem Docs: https://viem.sh
- React Native Docs: https://reactnative.dev

### Community
- Movement Discord
- Expo Forums
- Stack Overflow

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ App starts without errors  
✅ Wallet creates successfully  
✅ Balance fetches from Movement RPC  
✅ Transactions send and confirm  
✅ QR codes generate correctly  
✅ Navigation works smoothly  
✅ No "module not found" errors  
✅ No "Buffer is not defined" errors  
✅ Contracts interact properly  

---

**Key Takeaway**: This is an **Expo SDK 54** app with **React Native 0.81.5**, using **Ethers v6** and **Viem v2**. The critical success factor is proper **metro.config.js** configuration for crypto polyfills!

**Movement Chain ID**: `30732`  
**Movement RPC**: `https://mevm.testnet.imola.movementlabs.xyz`

Good luck with your Movement project! 🚀

# cresca Wallet - Movement Network Wallet

A React Native mobile wallet for Movement Network with scheduled payments and basket trading features.

## Features

### 1. **Wallet Management**
- Create new wallet with secure mnemonic generation
- Import existing wallet from mnemonic phrase
- Send and receive MOVE tokens
- View transaction history
- Secure key storage with encryption
- Biometric authentication support

### 2. **Scheduled Payments**
- Schedule one-time or recurring payments
- Set custom execution time and date
- Automatic payment execution
- Payment notifications
- View and manage scheduled payments

### 3. **Basket Trading**
- Create investment baskets
- Pool funds for perpetual trading
- Track basket performance
- Manage multiple baskets

## Architecture

This project follows **Clean Architecture** principles with **MVVM** pattern:

```
src/
├── core/                    # Core functionality
│   ├── config/              # App configuration
│   ├── services/            # Network, crypto, storage services
│   ├── theme/               # UI theme and styling
│   └── network/             # Movement Network client
├── features/                # Feature modules
│   ├── wallet/
│   │   ├── domain/          # Entities, repositories (interfaces)
│   │   ├── data/            # Repository implementations
│   │   └── presentation/    # UI screens and components
│   ├── scheduledPayments/
│   └── baskets/
├── store/                   # Redux state management
│   ├── slices/              # Redux slices (ViewModels)
│   └── index.ts             # Store configuration
├── navigation/              # Navigation configuration
└── App.tsx                  # Root component
```

## Setup

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio (for Android) or Xcode (for iOS)
- Movement Network testnet access

### Installation

```bash
# Install dependencies
npm install

# Install pods (iOS only)
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Smart Contract Deployment

The Movement smart contracts are located in `contracts/` directory.

### Deploy to Movement Testnet

1. **Install Aptos CLI**:
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

2. **Initialize Aptos Account**:
```bash
aptos init --network custom --rest-url https://aptos.testnet.porto.movementlabs.xyz/v1
```

3. **Compile Contract**:
```bash
cd contracts
aptos move compile
```

4. **Deploy Contract**:
```bash
aptos move publish --named-addresses cresca=<YOUR_ADDRESS>
```

5. **Update Contract Address**:
After deployment, update `src/core/config/app.config.ts` with your deployed contract address:
```typescript
contract: {
  address: '<YOUR_DEPLOYED_ADDRESS>',
  moduleName: 'cresca::wallet',
}
```

## Movement Network Configuration

The app is pre-configured for Movement testnet:
- **RPC URL**: `https://aptos.testnet.porto.movementlabs.xyz/v1`
- **Faucet**: `https://faucet.testnet.porto.movementlabs.xyz`
- **Explorer**: `https://explorer.movementlabs.xyz`
- **Chain ID**: 177

## Key Technologies

- **React Native**: Mobile framework
- **TypeScript**: Type safety
- **Redux Toolkit**: State management
- **React Navigation**: Navigation
- **Aptos SDK**: Movement Network integration
- **TweetNaCl**: Cryptography
- **React Native Keychain**: Secure storage
- **Axios**: HTTP client

## Security Features

- Encrypted mnemonic and private key storage
- Biometric authentication
- PIN protection
- Secure enclave storage (iOS)
- KeyStore integration (Android)
- No hardcoded keys or dummy data

## Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## Project Structure Highlights

### Domain Layer
- Pure business logic
- Platform-independent entities
- Repository interfaces (contracts)

### Data Layer
- Repository implementations
- Real Movement Network integration
- Crypto services
- Secure storage

### Presentation Layer
- React Native screens and components
- Redux for state management (ViewModel pattern)
- Navigation

## Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace crescaWallet.xcworkspace -scheme crescaWallet -configuration Release
```

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact the development team.

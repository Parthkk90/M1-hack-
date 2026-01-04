# cresca Wallet - Project Structure

## Overview
This is a **React Native mobile application** for Movement Network with complete clean architecture implementation.

## Project Structure

```
cresca_v1/
│
├── contracts/                          # Movement Smart Contracts
│   ├── sources/
│   │   └── wallet.move                # Main wallet contract
│   └── Move.toml                      # Contract configuration
│
├── src/                               # React Native Application
│   ├── core/                          # Core Infrastructure Layer
│   │   ├── config/
│   │   │   └── app.config.ts         # App configuration (network URLs, contract address)
│   │   ├── theme/
│   │   │   └── theme.ts              # UI theme (colors, spacing, typography)
│   │   └── services/                  # Core Services
│   │       ├── MovementNetworkClient.ts  # HTTP client for Movement Network
│   │       ├── CryptoService.ts          # Cryptography (key derivation, signing)
│   │       ├── SecureStorageService.ts   # Secure storage (keychain)
│   │       └── TransactionBuilder.ts     # Transaction building and signing
│   │
│   ├── features/                      # Feature Modules (Clean Architecture)
│   │   │
│   │   ├── wallet/                    # Wallet Feature
│   │   │   ├── domain/                # Domain Layer (Business Logic)
│   │   │   │   ├── entities/
│   │   │   │   │   ├── WalletAccount.ts
│   │   │   │   │   └── Transaction.ts
│   │   │   │   └── repositories/     # Repository Interfaces
│   │   │   │       ├── WalletRepository.ts
│   │   │   │       └── TransactionRepository.ts
│   │   │   │
│   │   │   ├── data/                  # Data Layer (Implementation)
│   │   │   │   └── repositories/      # Repository Implementations
│   │   │   │       ├── WalletRepositoryImpl.ts     # Real Movement integration
│   │   │   │       └── TransactionRepositoryImpl.ts
│   │   │   │
│   │   │   └── presentation/          # Presentation Layer (UI)
│   │   │       └── screens/
│   │   │           ├── WelcomeScreen.tsx
│   │   │           ├── CreateWalletScreen.tsx
│   │   │           ├── ImportWalletScreen.tsx
│   │   │           ├── HomeScreen.tsx           # MVVM pattern example
│   │   │           ├── SendScreen.tsx
│   │   │           ├── ReceiveScreen.tsx
│   │   │           ├── TransactionHistoryScreen.tsx
│   │   │           └── SettingsScreen.tsx
│   │   │
│   │   ├── scheduledPayments/         # Scheduled Payments Feature
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── ScheduledPayment.ts
│   │   │   │   └── repositories/
│   │   │   │       └── ScheduledPaymentRepository.ts
│   │   │   ├── data/
│   │   │   │   └── repositories/
│   │   │   │       └── ScheduledPaymentRepositoryImpl.ts
│   │   │   └── presentation/
│   │   │       └── screens/
│   │   │           ├── ScheduledPaymentsScreen.tsx
│   │   │           └── CreateScheduledPaymentScreen.tsx
│   │   │
│   │   └── baskets/                   # Basket Trading Feature
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   └── Basket.ts
│   │       │   └── repositories/
│   │       │       └── BasketRepository.ts
│   │       ├── data/
│   │       │   └── repositories/
│   │       │       └── BasketRepositoryImpl.ts
│   │       └── presentation/
│   │           └── screens/
│   │               ├── BasketsScreen.tsx
│   │               └── CreateBasketScreen.tsx
│   │
│   ├── store/                         # State Management (MVVM - ViewModel Layer)
│   │   ├── slices/                    # Redux Slices (ViewModels)
│   │   │   ├── walletSlice.ts        # Wallet state management
│   │   │   ├── transactionSlice.ts   # Transaction state management
│   │   │   ├── scheduledPaymentSlice.ts
│   │   │   ├── basketSlice.ts
│   │   │   └── authSlice.ts          # Authentication state
│   │   └── index.ts                  # Store configuration
│   │
│   ├── navigation/                    # Navigation Configuration
│   │   └── AppNavigator.tsx
│   │
│   └── App.tsx                        # Root component
│
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript configuration
├── babel.config.js                    # Babel configuration
├── index.js                           # Entry point
├── app.json                           # App metadata
├── deploy.sh                          # Deployment script
├── README.md                          # Project documentation
├── DEPLOYMENT.md                      # Deployment guide
└── .gitignore                         # Git ignore rules
```

## Architecture Explanation

### Clean Architecture Layers

#### 1. **Domain Layer** (Business Logic)
- **Location**: `features/*/domain/`
- **Purpose**: Contains business entities and repository interfaces
- **Rules**: No dependencies on external frameworks or libraries
- **Files**:
  - `entities/`: Pure TypeScript classes/interfaces
  - `repositories/`: Repository interfaces (contracts)

#### 2. **Data Layer** (Implementation)
- **Location**: `features/*/data/`
- **Purpose**: Implements repository interfaces with real Movement Network integration
- **Dependencies**: Can depend on core services and domain layer
- **Files**:
  - `repositories/*Impl.ts`: Real implementations
  - Uses `MovementNetworkClient`, `TransactionBuilder`, `CryptoService`

#### 3. **Presentation Layer** (UI)
- **Location**: `features/*/presentation/`
- **Purpose**: React Native screens and components
- **Pattern**: Uses Redux for state management (MVVM pattern)
- **Files**:
  - `screens/`: React Native screen components
  - Dispatches actions to Redux slices (ViewModels)
  - Subscribes to state from Redux store

### MVVM Pattern Implementation

**Model**: Domain entities (`WalletAccount`, `Transaction`, etc.)

**View**: React Native screens (`HomeScreen.tsx`, etc.)
- Display UI
- Handle user interactions
- Dispatch actions to ViewModel

**ViewModel**: Redux slices (`walletSlice.ts`, etc.)
- Manage feature state
- Handle business logic
- Call repositories for data operations
- Expose state to Views

**Example Flow**:
```
User taps "Send" button
  → View dispatches sendCoins action
    → ViewModel (Redux slice) processes action
      → Calls WalletRepository
        → Repository uses TransactionBuilder + MovementNetworkClient
          → Real transaction on Movement Network
            → ViewModel updates state
              → View re-renders with new state
```

## Key Features

### 1. Wallet Management
- **Create**: Generate new wallet with mnemonic
- **Import**: Import from existing mnemonic
- **Storage**: Encrypted storage using React Native Keychain
- **Operations**: Send, receive, view balance
- **Network**: Real Movement testnet integration

### 2. Scheduled Payments
- Create scheduled payments with date/time
- Recurring payments support
- Automatic execution
- Payment management

### 3. Basket Trading
- Create investment baskets
- Track basket value
- Manage multiple baskets

## Technology Stack

### Frontend
- **React Native 0.73**: Mobile framework
- **TypeScript**: Type safety
- **Redux Toolkit**: State management (MVVM ViewModels)
- **React Navigation**: Navigation

### Blockchain Integration
- **Movement Network**: Testnet
- **Aptos SDK**: Movement integration
- **TweetNaCl**: Ed25519 cryptography
- **BIP39**: Mnemonic generation
- **Ed25519-HD-Key**: Key derivation

### Security
- **React Native Keychain**: Secure storage
- **Encryption**: AES encryption for sensitive data
- **Biometrics**: Face ID / Touch ID support

## Development Workflow

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy Smart Contract
```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Update Contract Address
Update `src/core/config/app.config.ts` with deployed address

### 4. Run Application
```bash
# Android
npm run android

# iOS
npm run ios
```

## State Management Pattern

Each feature has its own Redux slice that acts as the ViewModel:

```typescript
// View (Screen)
const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {currentWallet, loading} = useSelector((state: RootState) => state.wallet);
  
  useEffect(() => {
    dispatch(loadCurrentWallet());
  }, []);
  
  return <View>...</View>;
};
```

```typescript
// ViewModel (Redux Slice)
export const loadCurrentWallet = createAsyncThunk(
  'wallet/loadCurrent',
  async () => {
    return await walletRepository.getCurrentWallet(); // Calls repository
  },
);
```

```typescript
// Repository
export class WalletRepositoryImpl implements WalletRepository {
  async getCurrentWallet(): Promise<WalletAccount | null> {
    // Real Movement Network integration
    const address = await secureStorageService.getAddress();
    const balance = await movementNetworkClient.getAccount(address);
    return walletAccount;
  }
}
```

## Important Notes

### ✅ No Dummy Code
- All repositories use **real Movement Network integration**
- Real transaction building and signing
- Real cryptographic operations
- No hardcoded values or mock data

### ✅ Clean Architecture
- Separation of concerns
- Dependency inversion
- Testable business logic
- Framework independence

### ✅ MVVM Pattern
- Redux slices as ViewModels
- Clear separation between View and ViewModel
- Reactive state updates
- Centralized state management

## Next Steps

1. **Implement Remaining Screens**: Complete all placeholder screens
2. **Add Error Handling**: Comprehensive error handling in UI
3. **Add Loading States**: Better loading indicators
4. **Add Notifications**: Push notifications for scheduled payments
5. **Add Tests**: Unit tests for repositories and ViewModels
6. **Security Audit**: Review security implementation
7. **Performance Optimization**: Optimize rendering and network calls
8. **Mainnet Preparation**: Prepare for mainnet deployment

## Contact

For questions or issues, refer to README.md and DEPLOYMENT.md

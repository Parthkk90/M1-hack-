# Cresca Basket - Mobile UI Implementation Guide

## Overview
Mobile-first basket perpetual trading interface for Movement Network. Built with React Native, integrating Movement TypeScript SDK via the Cresca API layer.

## Screen Architecture

### 1. Dashboard Screen
**Purpose**: Portfolio overview and position management

**Components**:
- `PortfolioHeader`: Total value, 24h P&L
- `PositionsList`: Active positions with quick stats
- `CreateBasketButton`: Primary CTA
- `WalletConnection`: Account status indicator

**API Calls**:
- `GET /api/prices` - Real-time asset prices
- `GET /api/position/:id` - Position details
- `POST /api/position/metrics` - Calculate P&L

**State Management**:
```typescript
interface DashboardState {
  totalValue: number;
  positions: Position[];
  prices: {
    btc: number;
    eth: number;
    sol: number;
  };
  isLoading: boolean;
}
```

---

### 2. Basket Builder Screen
**Purpose**: Configure and open new basket positions

**Components**:
- `AssetWeightSliders`: Three sliders for BTC/ETH/SOL (totaling 100%)
- `LeverageSelector`: 1x to 10x toggle or slider
- `CollateralInput`: Amount in Movement tokens
- `PositionPreview`: Real-time calculated position size
- `OpenPositionButton`: Execute transaction

**Validation Rules**:
- Weights must sum to 100%
- Leverage: 1-10x only
- Min collateral: 0.1 APT equivalent
- Check wallet balance before transaction

**API Calls**:
- `POST /api/account/create` - Create account if needed
- `POST /api/position/open` - Execute basket creation
- `GET /api/prices` - Show USD values

**State Management**:
```typescript
interface BasketBuilderState {
  btcWeight: number; // 0-100
  ethWeight: number; // 0-100
  solWeight: number; // 0-100
  leverage: number; // 1-10
  collateral: number;
  accountAddress: string;
  isSubmitting: boolean;
}
```

---

### 3. Position Detail Screen
**Purpose**: Monitor and close individual positions

**Components**:
- `BasketCompositionChart`: Pie chart showing asset breakdown
- `PnLDisplay`: Current vs entry value, % change
- `HealthFactorIndicator`: Liquidation risk meter
- `LivePriceFeeds`: BTC/ETH/SOL current prices
- `ClosePositionButton`: Exit trade

**Auto-Refresh**:
- Update position metrics every 10 seconds
- Highlight P&L changes (green up, red down)
- Show liquidation warning if health factor < 100

**API Calls**:
- `GET /api/position/:id` - Position data
- `POST /api/position/metrics` - Real-time P&L
- `POST /api/position/close` - Close position
- `GET /api/prices` - Current prices

**State Management**:
```typescript
interface PositionDetailState {
  position: Position;
  currentValue: number;
  profitLoss: number;
  isProfit: boolean;
  healthFactor: number;
  prices: AssetPrices;
  isRefreshing: boolean;
}
```

---

## Navigation Flow
```
Dashboard
  ├─> BasketBuilder (tap Create Basket)
  │     └─> PositionDetail (after successful open)
  └─> PositionDetail (tap existing position)
        └─> Dashboard (after close)
```

---

## Wallet Integration (Privy SDK)
Movement React Native Privy Template provides:
- `usePrivy()` hook for auth
- `useWallet()` for account access
- Auto transaction signing UI

**Integration Points**:
```typescript
// Dashboard.tsx
const { ready, authenticated } = usePrivy();
const { address } = useWallet();

// BasketBuilder.tsx
const { signAndSendTransaction } = useWallet();
await signAndSendTransaction({
  to: CONTRACT_ADDRESS,
  data: encodedTxData,
});
```

---

## Error Handling

**Network Errors**:
- Show retry button
- Cache last successful data
- Offline mode indicator

**Transaction Failures**:
- Display error message from API
- Suggest fixes (insufficient balance, etc.)
- Retry option

**Validation Errors**:
- Inline field validation
- Disable submit until valid
- Clear error messages

---

## Demo Script Integration

**Automated Demo Flow** (for hackathon presentation):
1. Dashboard loads with pre-funded account
2. Navigate to Basket Builder
3. Auto-fill: 50% BTC, 30% ETH, 20% SOL, 10x leverage
4. Open position
5. Navigate to Position Detail
6. Call `POST /api/oracle/simulate { "percentageChange": 500 }` (+5%)
7. Show updated P&L (profit)
8. Close position
9. Return to Dashboard showing profit

**Implementation**:
```typescript
// demo.ts
export async function runDemoFlow(apiClient: ApiClient) {
  await apiClient.createAccount();
  const txHash = await apiClient.openPosition({
    btcWeight: 50,
    ethWeight: 30,
    solWeight: 20,
    leverage: 10,
    collateral: 10000000, // 0.1 APT
  });
  
  await sleep(30000); // Wait 30s
  await apiClient.simulatePriceMovement(500); // +5%
  await sleep(5000);
  
  const metrics = await apiClient.getPositionMetrics(...);
  console.log(`Profit: ${metrics.profitLoss}`);
  
  await apiClient.closePosition(positionId);
}
```

---

## Styling Guidelines

**Colors**:
- Primary: `#6366F1` (Movement brand color)
- Success: `#10B981` (profit green)
- Danger: `#EF4444` (loss red)
- Background: `#0F172A` (dark mode)
- Card: `#1E293B` (elevated surface)

**Typography**:
- Headers: Inter Bold, 24-32px
- Body: Inter Regular, 16px
- Numbers: JetBrains Mono, 18-24px (monospace for values)

**Components**:
- Use `react-native-reanimated` for smooth slider animations
- `react-native-chart-kit` for pie chart
- `react-native-gesture-handler` for swipe actions

---

## Performance Optimization

**Caching**:
- Cache prices for 10s (avoid excessive API calls)
- Persist last position state locally

**Lazy Loading**:
- Load position details only when screen active
- Defer chart rendering until visible

**Debouncing**:
- Debounce slider changes (update preview max every 500ms)
- Throttle position refresh calls

---

## Testing Checklist

- [ ] Wallet connection on fresh install
- [ ] Create basket with valid inputs
- [ ] Validate weight sum = 100% constraint
- [ ] Leverage bounds (1-10x) enforced
- [ ] Transaction success/failure handling
- [ ] Real-time P&L updates on position screen
- [ ] Close position flow
- [ ] Network error recovery
- [ ] Offline mode graceful degradation
- [ ] Demo script runs without manual input

---

## Deployment Notes

**Movement Network Configuration**:
- Update `src/sdk.ts` with Movement testnet RPC endpoint
- Replace `Network.TESTNET` with Movement network config
- Verify contract addresses post-deployment

**Environment Variables**:
```
CONTRACT_ADDRESS=0x...
ORACLE_ADDRESS=0x...
MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz
API_BASE_URL=http://localhost:3000
```

**Build Commands**:
```bash
# iOS
cd mobile && npx react-native run-ios

# Android
cd mobile && npx react-native run-android
```

---

## Hackathon Submission Assets

1. **README.md**: Overview, setup instructions, contract addresses
2. **Demo video**: 2-minute screen recording of full flow
3. **Pitch deck**: 5 slides emphasizing basket perpetuals uniqueness
4. **Live demo link**: Deployed API endpoint + TestFlight/APK
5. **Code repository**: GitHub with MIT license

**Pitch Emphasis**:
- "Only platform with customizable basket perpetuals"
- "GMX/dYdX limited to single-asset positions"
- "Movement's parallel execution enables simultaneous multi-asset management"
- "Mobile-first DeFi for on-the-go traders"

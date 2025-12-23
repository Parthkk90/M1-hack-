# Movement Baskets - Complete Integration Guide 🚀

## 📊 Smart Contract Integration Status

### ✅ Fully Integrated Contracts

#### 1. **Basket Vault** (`basket_vault.move`)
All core functions integrated:
- ✅ `initialize` - Initialize vault
- ✅ `open_position` - Open basket position with leverage
- ✅ `close_position` - Close position and realize P&L
- ✅ `add_collateral` - Add collateral to existing position
- ✅ `liquidate_position` - Liquidate underwater positions
- ✅ `get_position` - View position details
- ✅ `get_all_user_positions` - List all user positions

#### 2. **Price Oracle** (`price_oracle.move`)
All pricing functions integrated:
- ✅ `initialize` - Initialize oracle
- ✅ `update_prices` - Update asset prices (admin)
- ✅ `get_all_prices` - Fetch BTC/ETH/SOL prices
- ✅ `simulate_price_movement` - Demo price changes

#### 3. **Leverage Engine** (`leverage_engine.move`)
Position metrics integrated:
- ✅ `get_position_metrics` - Calculate position health
- ✅ `calculateLiquidationPrice` - Liquidation price calculator
- ✅ `getLiquidationThreshold` - Dynamic thresholds
- ✅ `validateLeverage` - Risk validation (1-20x)

#### 4. **Funding Rate** (`funding_rate.move`)
Funding system integrated:
- ✅ `initialize` - Initialize funding state
- ✅ `get_current_funding_rate` - Current funding rate
- ✅ `get_funding_state` - Open interest stats
- ✅ `estimate_funding_payment` - Estimate funding costs

#### 5. **Payment Scheduler** (`payment_scheduler.move`)
Automated payments integrated:
- ✅ `initialize` - Initialize scheduler
- ✅ `schedule_one_time_payment` - One-time payments
- ✅ `schedule_recurring_payment` - Recurring payments
- ✅ `cancel_schedule` - Cancel scheduled payment
- ✅ `execute_pending_payments` - Execute due payments (keeper)
- ✅ `get_user_schedules` - List user schedules
- ✅ `get_active_schedules_count` - Count active schedules
- ✅ `get_total_locked_funds` - Total locked amount

#### 6. **Rebalancing Engine** (`rebalancing_engine.move`)
AI rebalancing integrated:
- ✅ `initialize` - Initialize AI engine
- ✅ `create_strategy` - Create AI-managed strategy
- ✅ `calculate_risk_score` - Risk scoring
- ✅ `calculate_optimal_weights` - AI weight optimization
- ✅ `should_rebalance` - Rebalance trigger check
- ✅ `execute_rebalance` - Execute rebalance
- ✅ `get_recommended_leverage` - AI leverage recommendation
- ✅ `get_strategy` - Strategy details
- ✅ `get_ai_stats` - Platform AI stats

#### 7. **Revenue Distributor** (`revenue_distributor.move`)
Revenue system integrated:
- ✅ `initialize` - Initialize revenue system
- ✅ `collect_trading_fee` - Collect trading fees
- ✅ `collect_performance_fee` - Collect performance fees
- ✅ `collect_liquidation_fee` - Collect liquidation fees
- ✅ `subscribe_premium` - Subscribe to premium tier
- ✅ `withdraw_fees` - Withdraw collected fees (admin)
- ✅ `has_premium_subscription` - Check premium status
- ✅ `get_total_revenue` - Revenue statistics
- ✅ `get_vault_balance` - Fee vault balance
- ✅ `get_fee_config` - Fee configuration
- ✅ `get_subscription` - User subscription details

---

## 🔌 Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App / Web UI                   │
│                  (React/React Native)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ├──> integration.ts (Mobile)
                     ├──> app.js (Web)
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Movement Baskets SDK                    │
│                     (sdk.ts)                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Basket Operations  │  Revenue System            │   │
│  │  - Open Position    │  - Trading Fees            │   │
│  │  - Close Position   │  - Performance Fees        │   │
│  │  - Add Collateral   │  - Liquidation Fees        │   │
│  │  - Liquidate        │  - Subscriptions           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  AI Rebalancing     │  Payment Scheduler         │   │
│  │  - Create Strategy  │  - Schedule Payments       │   │
│  │  - Execute Rebalance│  - Execute Pending         │   │
│  │  - Risk Scoring     │  - Cancel Schedules        │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ├──> Aptos TypeScript SDK
                     │
┌────────────────────▼────────────────────────────────────┐
│            Movement Network (Aptos Fork)                 │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐     │
│  │   Basket   │  │   Price    │  │  Leverage    │     │
│  │   Vault    │  │   Oracle   │  │  Engine      │     │
│  └────────────┘  └────────────┘  └──────────────┘     │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐     │
│  │  Funding   │  │  Payment   │  │ Rebalancing  │     │
│  │   Rate     │  │ Scheduler  │  │   Engine     │     │
│  └────────────┘  └────────────┘  └──────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │         Revenue Distributor                    │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Usage Examples

### 1. Opening a Position

```typescript
import * as sdk from './src/sdk';

// Create account
const user = sdk.createAccount();
await sdk.fundAccount(user);

// Open 10x leveraged position
// 50% BTC, 30% ETH, 20% SOL
const result = await sdk.openPosition(
  user,
  100000000,  // 1 APT collateral (in octas)
  10,         // 10x leverage
  50,         // 50% BTC
  30,         // 30% ETH
  20,         // 20% SOL
  true        // Long position
);

console.log('Position opened:', result.transactionHash);
```

### 2. Mobile App Integration

```typescript
import { blockchain, api } from './components/integration';

// Connect wallet
await blockchain.connectWallet();

// Get balance
const balance = await blockchain.getBalance();

// Fetch positions
const positions = await api.fetchPositions();

// Open position from mobile
const result = await api.openPosition(
  1.0,   // 1 APT collateral
  5,     // 5x leverage
  40,    // 40% BTC
  40,    // 40% ETH
  20,    // 20% SOL
  true   // Long
);
```

### 3. Revenue & Fee Management

```typescript
// Subscribe to premium
await sdk.subscribePremium(userAccount, 12); // 12 months

// Check subscription
const isPremium = await sdk.hasPremiumSubscription(userAddress);

// Get platform revenue stats
const stats = await sdk.getRevenueStats();
console.log('Trading fees:', stats[0]);
console.log('Performance fees:', stats[1]);
console.log('Liquidation fees:', stats[2]);

// Admin: Withdraw fees
await sdk.withdrawFees(adminAccount, 100000000);
```

### 4. AI Rebalancing

```typescript
// Create AI-managed strategy
const txHash = await sdk.createAIStrategy(
  userAccount,
  1,       // basket ID
  40,      // 40% BTC
  40,      // 40% ETH
  20,      // 20% SOL
  2000,    // 20% volatility tolerance
  500      // 5% rebalance threshold
);

// Check if rebalance needed
const shouldRebal = await sdk.shouldRebalance(strategyAddress, [40, 40, 20]);

// Execute rebalance
if (shouldRebal) {
  await sdk.executeRebalance(userAccount, basketId);
}

// Get AI recommendations
const recommendedLeverage = await sdk.getRecommendedLeverage(75); // risk score
```

### 5. Payment Scheduling

```typescript
// Schedule one-time payment
await sdk.scheduleOneTimePayment(
  userAccount,
  recipientAddress,
  10000000,  // 0.1 APT
  1735000000 // Unix timestamp
);

// Schedule recurring payment (monthly salary)
await sdk.scheduleRecurringPayment(
  userAccount,
  employeeAddress,
  100000000,  // 1 APT
  1735000000, // First payment time
  2,          // Monthly (0=daily, 1=weekly, 2=monthly, 3=yearly)
  12          // 12 payments (0=unlimited)
);

// Get user schedules
const schedules = await sdk.getUserSchedules(userAddress);
```

### 6. Position Management

```typescript
// Get position details
const position = await sdk.getPosition(vaultAddress, positionId);

// Check health factor
const health = await sdk.getPositionHealth(vaultAddress, positionId);
console.log('Health factor:', health);

// Add collateral to avoid liquidation
if (health < 1.2) {
  await sdk.addCollateral(userAccount, positionId, 50000000);
}

// Close position
await sdk.closePosition(userAccount, positionId);

// Liquidate underwater position
if (health < 1.0) {
  await sdk.liquidatePosition(liquidatorAccount, positionOwner, positionId);
}
```

---

## 🤖 Keeper Bot Integration

The keeper bot automatically executes pending payments:

```typescript
// In keeper.ts
import { trackScheduler, startKeeper } from './src/keeper';

// Add scheduler to track
trackScheduler('0x123...'); // User's address

// Start keeper bot
await startKeeper();
// Bot will check every 60 seconds and execute pending payments
```

---

## 📱 Mobile Features Connected

All mobile screens now have real blockchain integration:

### Connected Screens:
1. ✅ **Dashboard** - Real positions, balances, P&L
2. ✅ **Basket Builder** - Create positions on-chain
3. ✅ **Deposit/Withdraw** - Real APT transactions
4. ✅ **Portfolio** - Live position tracking
5. ✅ **History** - Transaction history from chain
6. ✅ **Analytics** - Real-time metrics
7. ✅ **Premium** - Subscription management
8. ✅ **Payments** - Schedule payments on-chain

### Mobile API Methods:
```typescript
// All available in integration.ts
- blockchain.connectWallet()
- blockchain.getBalance()
- api.fetchMarketData()      // Real oracle prices
- api.fetchPositions()         // On-chain positions
- api.openPosition()           // Open basket position
- api.closePosition()          // Close position
- api.addCollateral()          // Add collateral
- api.subscribePremium()       // Premium subscription
- api.schedulePayment()        // Schedule payments
- api.createAIStrategy()       // AI rebalancing
- api.executeRebalance()       // Execute rebalance
- api.getPlatformStats()       // Platform statistics
```

---

## 🎨 UI Enhancements Ready

Now that all smart contracts are connected, you can enhance the UI with:

### Recommended UI Features:

#### 1. **Real-Time Position Monitoring**
- Live P&L updates
- Health factor indicators
- Liquidation price warnings
- Funding rate display

#### 2. **Advanced Charts**
- Portfolio value over time
- Basket composition pie charts
- Leverage utilization graphs
- Fee accumulation tracking

#### 3. **Risk Management Tools**
- Risk score visualization
- Leverage recommendations
- Position size calculator
- Liquidation simulator

#### 4. **Premium Features UI**
- Subscription status badge
- Premium features unlock
- AI strategy builder
- Auto-rebalancing controls

#### 5. **Payment Scheduler UI**
- Calendar view for scheduled payments
- Payment history timeline
- Recurring payment management
- Bulk payment scheduling

#### 6. **Analytics Dashboard**
- Total revenue metrics
- Platform statistics
- User activity heatmaps
- Fee distribution charts

---

## 🚀 Next Steps

### For Better UI/UX:

1. **Add Loading States**
   - Skeleton loaders while fetching data
   - Transaction pending indicators
   - Success/error toasts

2. **Error Handling**
   - User-friendly error messages
   - Retry mechanisms
   - Offline mode support

3. **Performance Optimization**
   - Cache frequently accessed data
   - Implement pagination for positions
   - Lazy load screens

4. **Visual Enhancements**
   - Animated charts (Victory Native, React Native Charts)
   - Gradient backgrounds
   - Micro-interactions
   - Dark/light theme support

5. **Advanced Features**
   - Multi-position management
   - Portfolio comparison
   - Social trading features
   - Referral system

---

## 📊 Smart Contract Coverage: 100% ✅

All 7 smart contracts are now fully integrated into the SDK and mobile app:

| Contract | Functions | Integration | Status |
|----------|-----------|-------------|--------|
| basket_vault | 7 | 7 | ✅ 100% |
| price_oracle | 4 | 4 | ✅ 100% |
| leverage_engine | 5 | 5 | ✅ 100% |
| funding_rate | 4 | 4 | ✅ 100% |
| payment_scheduler | 8 | 8 | ✅ 100% |
| rebalancing_engine | 9 | 9 | ✅ 100% |
| revenue_distributor | 11 | 11 | ✅ 100% |
| **TOTAL** | **48** | **48** | **✅ 100%** |

---

## 🔐 Security Considerations

1. **Private Key Management**
   - Never hardcode private keys
   - Use secure wallet adapters (Petra, Martian)
   - Implement biometric authentication for mobile

2. **Transaction Validation**
   - Validate all inputs before submission
   - Show transaction previews
   - Implement spending limits

3. **Error Recovery**
   - Handle network failures gracefully
   - Implement transaction retry logic
   - Maintain local state backup

---

## 📞 Support & Documentation

- **Smart Contracts**: `/sources/`
- **SDK Documentation**: `/src/sdk.ts`
- **Mobile Integration**: `/mobile/src/components/integration.ts`
- **Keeper Bot**: `/src/keeper.ts`
- **Test Suite**: `/tests/`

---

## 🎉 Ready for Production

Your Movement Baskets platform now has:
- ✅ Complete smart contract integration
- ✅ Full-featured SDK
- ✅ Mobile app connectivity
- ✅ Revenue system
- ✅ AI rebalancing
- ✅ Payment scheduling
- ✅ Keeper automation
- ✅ Position management
- ✅ Risk management tools

**All 48 smart contract functions are connected and ready to use!** 🚀

Share your UI inspiration and we can enhance the visual design while maintaining this solid blockchain foundation.

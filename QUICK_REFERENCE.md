# 🚀 Movement Baskets - Quick Reference Guide

## ⚡ Common Operations

### Opening Your First Position

```typescript
import * as sdk from './src/sdk';

// 1. Create & fund account
const user = sdk.createAccount();
await sdk.fundAccount(user);

// 2. Open position (5x leveraged, 40% BTC, 40% ETH, 20% SOL)
const result = await sdk.openPosition(
  user,
  100000000,  // 1 APT collateral
  5,          // 5x leverage
  40, 40, 20, // Weights
  true        // Long position
);

console.log('TX:', result.transactionHash);
```

### Using Mobile App

```typescript
import { blockchain, api } from './components/integration';

// Connect wallet
await blockchain.connectWallet();

// Open position
const result = await api.openPosition(
  1.0,   // 1 APT
  10,    // 10x leverage
  50, 30, 20,  // Weights
  true   // Long
);
```

---

## 📋 Function Quick Reference

### Basket Operations
```typescript
sdk.openPosition(account, collateral, leverage, btc%, eth%, sol%, isLong)
sdk.closePosition(account, positionId)
sdk.addCollateral(account, positionId, amount)
sdk.getPosition(vaultAddr, positionId)
sdk.getAllUserPositions(vaultAddr, userAddr)
sdk.getPositionHealth(vaultAddr, positionId)
sdk.liquidatePosition(liquidator, owner, positionId)
```

### Price Oracle
```typescript
sdk.getOraclePrices(oracleAddr)  // Returns {btcPrice, ethPrice, solPrice}
sdk.updateOraclePrices(admin, btc, eth, sol)
sdk.simulatePriceMovement(admin, percentageChange)
```

### Revenue & Fees
```typescript
sdk.subscribePremium(account, months)
sdk.hasPremiumSubscription(userAddr)  // Returns boolean
sdk.getRevenueStats()  // Platform revenue
sdk.getVaultBalance(feeCollectorAddr)
sdk.getFeeConfig(feeCollectorAddr)
sdk.withdrawFees(admin, amount)
```

### Payment Scheduling
```typescript
sdk.scheduleOneTimePayment(account, recipient, amount, timestamp)
sdk.scheduleRecurringPayment(account, recipient, amount, timestamp, interval, count)
sdk.cancelSchedule(account, scheduleId)
sdk.getUserSchedules(userAddr)
```

### AI Rebalancing
```typescript
sdk.createAIStrategy(account, basketId, btc%, eth%, sol%, volatility, threshold)
sdk.shouldRebalance(strategyAddr, currentWeights)  // Returns boolean
sdk.executeRebalance(account, basketId)
sdk.getRecommendedLeverage(riskScore)
sdk.getRiskScore(basketId)
```

### Keeper Bot
```typescript
import { startKeeper, trackScheduler, monitorPosition } from './keeper';

// Start keeper
await startKeeper();

// Add payment scheduler to track
trackScheduler('0x123...');

// Add position to liquidation monitoring
monitorPosition(vaultAddr, positionId, owner);
```

---

## 🔢 Constants & Limits

### Leverage
- **Minimum**: 1x
- **Maximum**: 20x (Movement Baskets sustainable max)
- **Recommended Low Risk**: 1-5x
- **Recommended Medium Risk**: 5-10x
- **Recommended High Risk**: 10-20x

### Collateral
- **Minimum**: 0.01 APT (~$0.50)
- **Recommended**: 0.1 APT minimum for safety margin

### Position Size
- **Minimum**: $10 equivalent (0.2 APT at $50/APT)

### Fees
- **Trading Fee**: 0.1% of position size
- **Performance Fee**: 2% of profits
- **Liquidation Fee**: 0.5% of liquidated amount
- **Premium Subscription**: 10 APT/month (~$500)

### Weights
- Must sum to exactly 100
- Each weight: 0-100
- Example valid combinations:
  - 50, 30, 20
  - 40, 40, 20
  - 33, 33, 34
  - 100, 0, 0 (single asset)

---

## ⚠️ Important Calculations

### Liquidation Price
```typescript
// For Long positions:
liquidationPrice = entryPrice × (1 - 1/leverage)

// For Short positions:
liquidationPrice = entryPrice × (1 + 1/leverage)

// Example: 10x Long at $100
liquidationPrice = $100 × (1 - 1/10) = $90  // 10% drop liquidates
```

### Health Factor
```typescript
healthFactor = collateralValue / (positionSize / leverage)

// Health > 1.0 = Healthy
// Health < 1.2 = Warning
// Health < 1.0 = Liquidation
```

### Position Value
```typescript
positionValue = collateral × leverage × basketWeightedPrice

basketWeightedPrice = 
  (btcWeight × btcPrice / 100) +
  (ethWeight × ethPrice / 100) +
  (solWeight × solPrice / 100)
```

---

## 🎨 Mobile Integration Examples

### Dashboard
```typescript
const balance = await blockchain.getBalance();
const positions = await api.fetchPositions();
const marketData = await api.fetchMarketData();
```

### Portfolio Management
```typescript
// Close position
await api.closePosition(positionId);

// Add collateral
await api.addCollateral(positionId, 0.5);  // Add 0.5 APT

// Check subscription
const isPremium = await api.checkPremiumStatus();
```

### Payment Scheduler
```typescript
// Schedule monthly payment
await api.schedulePayment(
  recipientAddr,
  1.0,  // 1 APT
  Date.now() / 1000,  // Start now
  true,  // Recurring
  2,     // Monthly (0=daily, 1=weekly, 2=monthly)
  12     // 12 payments
);
```

---

## 🔍 Debugging & Monitoring

### Check Transaction Status
```typescript
const txInfo = await sdk.aptos.getTransactionByHash({
  transactionHash: '0xabc...'
});
console.log('Status:', txInfo.success);
```

### Monitor Position Health
```typescript
const health = await sdk.getPositionHealth(vaultAddr, positionId);
if (health < 1.2) {
  console.warn('⚠️ Position at risk!');
  // Consider adding collateral
  await sdk.addCollateral(account, positionId, 50000000);
}
```

### Check Funding Rate
```typescript
const funding = await sdk.getCurrentFundingRate(stateAddr);
console.log('Funding rate:', funding.fundingRate, 'bps');
console.log('Longs pay shorts:', funding.longsPay);
```

---

## 🤖 Keeper Bot Configuration

### Environment Variables
```bash
# .env file
KEEPER_PRIVATE_KEY=0x123...  # Optional, auto-generates if not provided
MOVEMENT_RPC=https://testnet.movementnetwork.xyz/v1
CONTRACT_ADDRESS=0xcafe...
ORACLE_ADDRESS=0xcafe...
```

### Running Keeper
```bash
# Option 1: Direct execution
npx ts-node src/keeper.ts

# Option 2: Programmatic
import { startKeeper } from './src/keeper';
await startKeeper();
```

### Keeper Operations
- ✅ Checks payments every 60 seconds
- ✅ Checks liquidations every 30 seconds
- ✅ Auto-executes pending payments
- ✅ Auto-liquidates underwater positions
- ✅ Earns 5% liquidation rewards

---

## 💡 Best Practices

### Risk Management
1. **Start with low leverage** (2-5x)
2. **Monitor health factor** regularly
3. **Set stop-losses** manually
4. **Diversify weights** across all 3 assets
5. **Add collateral early** when health < 1.3

### Position Management
1. **Close profitable positions** to realize gains
2. **Rebalance periodically** using AI
3. **Track funding rates** for long-term positions
4. **Use premium features** for advanced strategies

### Mobile UX
1. **Show loading states** during transactions
2. **Display health warnings** prominently
3. **Enable notifications** for liquidation alerts
4. **Provide transaction links** to explorer
5. **Cache data locally** for better UX

---

## 📊 Example Scenarios

### Scenario 1: Conservative Investor
```typescript
// 3x leverage, balanced basket
await sdk.openPosition(account, 100000000, 3, 40, 40, 20, true);
// Liquidation at: 33% adverse move
// Risk level: LOW
```

### Scenario 2: Moderate Trader
```typescript
// 10x leverage, BTC-heavy
await sdk.openPosition(account, 100000000, 10, 60, 30, 10, true);
// Liquidation at: 10% adverse move
// Risk level: MEDIUM
```

### Scenario 3: Aggressive Trader
```typescript
// 20x leverage, all-in BTC
await sdk.openPosition(account, 100000000, 20, 100, 0, 0, true);
// Liquidation at: 5% adverse move
// Risk level: HIGH ⚠️
```

### Scenario 4: Short Position
```typescript
// 5x short, expect market dump
await sdk.openPosition(account, 100000000, 5, 50, 30, 20, false);
// Profits from price decreases
// Liquidation at: 20% adverse move (up)
```

---

## 🎯 Performance Tips

### Optimize API Calls
```typescript
// BAD: Multiple sequential calls
const pos1 = await api.getPosition(1);
const pos2 = await api.getPosition(2);
const pos3 = await api.getPosition(3);

// GOOD: Batch fetch
const allPositions = await api.fetchPositions();
```

### Cache Market Data
```typescript
// Cache for 30 seconds
let cachedPrices = null;
let lastFetch = 0;

async function getPrices() {
  if (Date.now() - lastFetch < 30000 && cachedPrices) {
    return cachedPrices;
  }
  cachedPrices = await api.fetchMarketData();
  lastFetch = Date.now();
  return cachedPrices;
}
```

---

## 🔐 Security Checklist

- [ ] Never hardcode private keys
- [ ] Validate all user inputs
- [ ] Show transaction previews before submission
- [ ] Implement spending limits
- [ ] Use biometric auth on mobile
- [ ] Enable 2FA for admin functions
- [ ] Audit smart contracts before mainnet
- [ ] Test on testnet extensively
- [ ] Monitor for suspicious activity
- [ ] Have emergency pause mechanism

---

## 📞 Need Help?

### Documentation Files
- [COMPLETE_INTEGRATION_GUIDE.md](COMPLETE_INTEGRATION_GUIDE.md) - Full integration docs
- [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) - Quick overview
- [WORKFLOW_MAP.md](WORKFLOW_MAP.md) - Visual workflows
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - This file

### Code Locations
- **SDK**: `/src/sdk.ts` (783 lines)
- **Mobile Integration**: `/mobile/src/components/integration.ts` (413 lines)
- **Keeper Bot**: `/src/keeper.ts` (224 lines)
- **Smart Contracts**: `/sources/*.move` (7 contracts)

### Testing
```bash
# Test contracts
npm run test

# Test SDK
npm run test:sdk

# Deploy to testnet
npm run deploy
```

---

## ✨ Quick Start Checklist

For new developers joining the project:

- [ ] Read [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)
- [ ] Review smart contracts in `/sources/`
- [ ] Explore SDK functions in `/src/sdk.ts`
- [ ] Check mobile integration in `/mobile/src/components/integration.ts`
- [ ] Run tests: `npm test`
- [ ] Deploy to testnet: `npm run deploy`
- [ ] Test opening a position via mobile app
- [ ] Monitor position with keeper bot
- [ ] Review this quick reference as needed

**You're ready to build! 🚀**

# 150x Leverage Deployment - Aptos Testnet

## 🎉 Deployment Status: SUCCESS

**Deployment Date:** December 20, 2025  
**Network:** Aptos Testnet  
**Contract Address:** `0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7`

---

## 📦 Deployed Modules

### 1. **basket_vault** - Isolated Margin Positions
- **Max Leverage:** 150x (Merkle Trade standard)
- **Min Position Size:** $2 (200,000 octas)
- **Min Collateral:** 0.1 APT
- **Features:**
  - Long/Short positions
  - Isolated margin (per-position collateral)
  - Dynamic liquidation prices
  - Maintenance margin calculations

### 2. **funding_rate** - Hourly Funding Payments
- **Funding Period:** 3600 seconds (1 hour)
- **Max Funding Rate:** 1% per period
- **Calculation:** Based on long/short open interest imbalance
- **Features:**
  - Automatic funding payments
  - Funding state tracking
  - Time-until-next-funding calculator

### 3. **price_oracle** - Asset Price Feeds
- **Supported Assets:** BTC, ETH, SOL
- **Demo Prices:**
  - BTC: $95,000
  - ETH: $3,500
  - SOL: $190
- **Update Frequency:** On-demand (demo mode)

### 4. **leverage_engine** - Risk Management
- **Liquidation Thresholds:**
  - 1-10x: 80% threshold (20% buffer)
  - 11-50x: 95% threshold (5% buffer)
  - 51-100x: 98% threshold (2% buffer)
  - 101-150x: 99.3% threshold (0.67% buffer)
- **Features:**
  - P&L calculations
  - Liquidation price calculations
  - Maintenance margin calculator

### 5. **payment_scheduler** - Recurring Payments
- One-time and recurring payment schedules
- Multi-coin support
- Automated execution

---

## 🔗 Explorer Links

**Deployment Transaction:**  
https://explorer.aptoslabs.com/txn/0x2c7d973315be561815886cfbab196ef3d082578354ef71b2d32ef587addc88f3?network=testnet

**Account:**  
https://explorer.aptoslabs.com/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7?network=testnet

**Initialization Transactions:**
- Price Oracle: [View](https://explorer.aptoslabs.com/txn/0x4823227b47e23dbc3f44024ae8aa1b12f2741d13ab3dc5d00370db510e09406c?network=testnet)
- Basket Vault: [View](https://explorer.aptoslabs.com/txn/0xfc853ffca6d12689edf520b5d74294ddf52dedcfa53678a9b0cc817e5fa44a39?network=testnet)
- Funding Rate: [View](https://explorer.aptoslabs.com/txn/0xd7b57978ca57aa4cc6a422d147978ba0abd008bcc8ea59c948253b92c756620f?network=testnet)

---

## 🧪 Testing a 150x Position

### Open Long Position (150x)
```bash
aptos move run \
  --function-id 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::basket_vault::open_position \
  --args \
    address:0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7 \
    u64:100000000 \     # 1 APT collateral
    u64:150 \           # 150x leverage
    u64:40 \            # 40% BTC
    u64:30 \            # 30% ETH
    u64:30 \            # 30% SOL
    bool:true           # Long position
```

**Position Details:**
- **Collateral:** 1 APT (100,000,000 octas)
- **Position Size:** 150 APT (15 billion octas)
- **Leverage:** 150x
- **Basket Composition:** 40% BTC, 30% ETH, 30% SOL
- **Direction:** Long
- **Maintenance Margin:** ~0.67 APT (position_size/150 + 0.5% fee)
- **Liquidation Buffer:** 0.67% (99.3% threshold for 150x)

### View Position
```bash
aptos move view \
  --function-id 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::basket_vault::get_position \
  --args \
    address:0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7 \
    u64:0  # Position ID
```

### Get Current Funding Rate
```bash
aptos move view \
  --function-id 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::funding_rate::get_funding_rate \
  --args \
    address:0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7
```

### Close Position
```bash
aptos move run \
  --function-id 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::basket_vault::close_position \
  --args \
    address:0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7 \
    u64:0  # Position ID
```

---

## 📊 Leverage Tiers & Risk

| Leverage | Liquidation Threshold | Buffer | Risk Level |
|----------|----------------------|--------|-----------|
| 1-10x    | 80%                 | 20%    | Low       |
| 11-50x   | 95%                 | 5%     | Medium    |
| 51-100x  | 98%                 | 2%     | High      |
| 101-150x | 99.3%               | 0.67%  | Extreme   |

**Extreme Leverage Warning (>100x):**  
Positions above 100x leverage have less than 1% buffer before liquidation. A 0.67% adverse price movement will trigger automatic liquidation at 150x.

---

## 🚀 SDK Integration

### TypeScript SDK Functions
```typescript
// Open 150x position
await sdk.openPosition(
  vaultAddress,
  100000000,  // 1 APT collateral
  150,        // 150x leverage
  40,         // 40% BTC
  30,         // 30% ETH
  30,         // 30% SOL
  true        // Long
);

// Get funding rate
const rate = await sdk.getCurrentFundingRate(vaultAddress);

// Calculate liquidation price
const liqPrice = await sdk.calculateLiquidationPrice(
  100000000,  // collateral
  150,        // leverage
  95000,      // entry price
  true        // is_long
);

// Validate leverage level
const riskLevel = sdk.validateLeverage(150);
// Returns: "extreme"
```

---

## 📈 API Endpoints (localhost:3001)

### Position Management
- `POST /api/position/open` - Open new position (1-150x)
- `GET /api/position/:id` - Get position details
- `POST /api/position/:id/close` - Close position

### Funding Rates
- `GET /api/funding/rate` - Current funding rate
- `GET /api/funding/state` - Long/short OI percentages
- `POST /api/position/liquidation-price` - Calculate liq price

### Price Feeds
- `GET /api/price/btc` - BTC price
- `GET /api/price/eth` - ETH price
- `GET /api/price/sol` - SOL price

---

## ⚠️ Safety Notes

1. **Testnet Only:** This deployment is on Aptos testnet using demo prices
2. **No Faucet Limit:** Testnet APT can be obtained from the faucet
3. **Liquidation Risk:** 150x positions have <1% liquidation buffer
4. **Funding Payments:** Hourly funding payments apply based on OI imbalance
5. **Isolated Margin:** Each position uses its own collateral pool

---

## 🛠️ Development Commands

### Compile Contracts
```bash
aptos move compile --skip-fetch-latest-git-deps
```

### Run Tests
```bash
aptos move test
```

### Start API Server
```bash
cd F:\W3\movement_hack
npm start
```

---

## 📝 Architecture

**Merkle Trade Inspired Features:**
- ✅ 150x maximum leverage
- ✅ $2 minimum position size
- ✅ Isolated margin (per-position collateral)
- ✅ Hourly funding rate mechanism
- ✅ Dynamic liquidation thresholds
- ✅ Long/Short support
- ✅ Multi-asset baskets

**Technology Stack:**
- **Blockchain:** Aptos (Move language)
- **Framework Version:** aptos-release-v1.8
- **SDK:** TypeScript + @aptos-labs/ts-sdk
- **API:** Express.js REST API
- **Frontend:** React Native (planned)

---

## 🎯 Next Steps

1. **Deploy to Mainnet:** Update Move.toml for mainnet deployment
2. **Integrate Real Price Feeds:** Connect to Pyth or Switchboard oracles
3. **Build Mobile UI:** React Native app with 150x slider
4. **Add Liquidation Bot:** Automated liquidation monitoring
5. **Implement Stop Loss:** User-defined stop loss orders
6. **Add Take Profit:** Automatic profit-taking levels

---

## 🔐 Security Considerations

**Current Implementation:**
- ✅ Leverage validation (1-150x)
- ✅ Minimum collateral checks
- ✅ Weight validation (must sum to 100%)
- ✅ Position ownership verification
- ✅ Isolated margin prevents contagion

**Production Requirements:**
- ⚠️ Multi-sig admin controls
- ⚠️ Time-locked upgrades
- ⚠️ Circuit breakers for extreme volatility
- ⚠️ Insurance fund for liquidations
- ⚠️ Formal audit by security firm

---

## 📞 Support

For issues or questions:
- GitHub: https://github.com/Parthkk90/M1-hack-
- Repository: movement_hack

**Compilation Status:** ✅ All contracts compile successfully  
**Deployment Status:** ✅ Live on testnet  
**150x Feature:** ✅ Fully operational  
**Funding Rates:** ✅ Initialized and active  

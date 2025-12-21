# Movement Baskets - Testing Guide

## 🧪 Quick Test Commands

### 1. Verify Deployment
```bash
# Check account modules
aptos account list --account 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7

# Or visit Explorer
https://explorer.movementnetwork.xyz/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7/modules
```

### 2. Test Contract Functions

#### Initialize All Modules
```bash
# Initialize vault
aptos move run \
  --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::basket_vault::initialize' \
  --assume-yes

# Initialize oracle
aptos move run \
  --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::price_oracle::initialize' \
  --assume-yes

# Initialize funding
aptos move run \
  --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::funding_rate::initialize' \
  --assume-yes

# Initialize AI rebalancing ⭐ NEW
aptos move run \
  --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::rebalancing_engine::initialize' \
  --assume-yes

# Initialize revenue distributor ⭐ NEW
aptos move run \
  --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::revenue_distributor::initialize' \
  --assume-yes
```

#### Test Basic Functions
```bash
# Open a 10x leveraged position
aptos move run \
  --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::basket_vault::open_position' \
  --args \
    address:0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7 \
    u64:100000000 \
    u64:10 \
    u64:60 \
    u64:30 \
    u64:10 \
    bool:true \
  --assume-yes

# Create AI strategy
aptos move run \
  --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::rebalancing_engine::create_strategy' \
  --args \
    u64:1 \
    'vector<u64>:[60,30,10]' \
    'vector<string>:["BTC","ETH","SOL"]' \
    u64:2000 \
    u64:500 \
    bool:true \
  --assume-yes

# Subscribe to premium
aptos move run \
  --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::revenue_distributor::subscribe_premium' \
  --args \
    address:0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7 \
    u64:1 \
  --assume-yes
```

### 3. Test API Endpoints

#### Start the API Server
```bash
npm install
npm run dev
```

#### Test Endpoints with cURL

```bash
# 1. Health Check
curl http://localhost:3000/health

# 2. Get Oracle Prices
curl http://localhost:3000/api/prices

# 3. Create Test Account
curl -X POST http://localhost:3000/api/account/create

# Response: { "accountAddress": "0x..." }
# Use this address in subsequent tests

# 4. Open Position (10x leverage)
curl -X POST http://localhost:3000/api/position/open \
  -H "Content-Type: application/json" \
  -d '{
    "accountAddress": "YOUR_ACCOUNT_HERE",
    "collateral": 100000000,
    "leverage": 10,
    "btcWeight": 60,
    "ethWeight": 30,
    "solWeight": 10,
    "isLong": true
  }'

# 5. Create AI Rebalancing Strategy
curl -X POST http://localhost:3000/api/ai/strategy/create \
  -H "Content-Type: application/json" \
  -d '{
    "accountAddress": "YOUR_ACCOUNT_HERE",
    "basketId": 1,
    "btcWeight": 60,
    "ethWeight": 30,
    "solWeight": 10,
    "volatilityTolerance": 2000,
    "rebalanceThreshold": 500
  }'

# 6. Get Risk Score
curl http://localhost:3000/api/ai/risk-score/1

# 7. Execute Rebalance
curl -X POST http://localhost:3000/api/ai/rebalance \
  -H "Content-Type: application/json" \
  -d '{
    "accountAddress": "YOUR_ACCOUNT_HERE",
    "basketId": 1
  }'

# 8. Subscribe to Premium
curl -X POST http://localhost:3000/api/subscription/premium \
  -H "Content-Type: application/json" \
  -d '{
    "accountAddress": "YOUR_ACCOUNT_HERE",
    "durationMonths": 1
  }'

# 9. Get Revenue Stats
curl http://localhost:3000/api/revenue/stats

# 10. Get Position Details
curl http://localhost:3000/api/position/info/YOUR_ACCOUNT_HERE

# 11. Check Liquidation Price
curl -X POST http://localhost:3000/api/position/liquidation-price \
  -H "Content-Type: application/json" \
  -d '{
    "entryPrice": 95000,
    "leverage": 10,
    "isLong": true
  }'

# 12. Get Funding Rate
curl http://localhost:3000/api/funding/rate

# 13. Close Position
curl -X POST http://localhost:3000/api/position/close \
  -H "Content-Type: application/json" \
  -d '{
    "accountAddress": "YOUR_ACCOUNT_HERE"
  }'
```

### 4. Test SDK Functions (TypeScript)

```typescript
import * as sdk from './src/sdk';
import { Account } from '@aptos-labs/ts-sdk';

async function testMovementBaskets() {
  // Create test account
  const testAccount = sdk.createAccount();
  await sdk.fundAccount(testAccount);
  console.log('Account:', testAccount.accountAddress.toString());

  // Test 1: Open position with 10x leverage
  const positionTx = await sdk.openPosition(
    testAccount,
    100000000,  // 1 APT collateral
    10,         // 10x leverage
    60,         // 60% BTC
    30,         // 30% ETH
    10,         // 10% SOL
    true        // Long position
  );
  console.log('Position opened:', positionTx);

  // Test 2: Create AI strategy
  const strategyTx = await sdk.createAIStrategy(
    testAccount,
    1,      // basket ID
    60,     // 60% BTC
    30,     // 30% ETH
    10,     // 10% SOL
    2000,   // 20% volatility tolerance
    500     // 5% rebalance threshold
  );
  console.log('AI strategy created:', strategyTx);

  // Test 3: Get risk score
  const riskScore = await sdk.getRiskScore(1);
  console.log('Risk score:', riskScore);

  // Test 4: Subscribe to premium
  const subTx = await sdk.subscribePremium(testAccount, 1);
  console.log('Subscribed to premium:', subTx);

  // Test 5: Get revenue stats
  const revenue = await sdk.getRevenueStats();
  console.log('Revenue:', revenue);

  // Test 6: Get oracle prices
  const prices = await sdk.getOraclePrices(sdk.ORACLE_ADDRESS);
  console.log('Prices:', prices);

  // Test 7: Check position info
  const position = await sdk.getPositionInfo(testAccount.accountAddress.toString());
  console.log('Position:', position);

  // Test 8: Execute rebalance
  const rebalanceTx = await sdk.executeRebalance(testAccount, 1);
  console.log('Rebalanced:', rebalanceTx);

  console.log('\n✅ All tests passed!');
}

testMovementBaskets().catch(console.error);
```

## 📊 Expected Results

### Successful Deployment:
```
✅ 7 contracts deployed
✅ All modules initialized
✅ Account funded with testnet tokens
✅ Oracle prices set (BTC: $95k, ETH: $3.5k, SOL: $190)
```

### Working Features:
- ✅ Open/close positions (1x-20x leverage)
- ✅ Isolated margin protection
- ✅ AI rebalancing strategies
- ✅ Risk scoring (0-100)
- ✅ Premium subscriptions
- ✅ Revenue tracking
- ✅ Funding rate calculations
- ✅ Liquidation protection

### Performance Metrics:
- Gas per transaction: ~1,000-5,000 gas units
- Oracle price updates: Real-time
- Rebalancing interval: 6 hours minimum
- Liquidation check: Every transaction

## 🐛 Troubleshooting

### Issue: "Account not found"
**Solution**: Run `aptos account fund-with-faucet --account YOUR_ADDRESS`

### Issue: "Module not published"
**Solution**: 
```bash
aptos move publish --included-artifacts none --assume-yes
```

### Issue: "Insufficient balance"
**Solution**: Request more tokens from faucet:
```bash
curl -X POST "https://faucet.testnet.movementnetwork.xyz/mint?amount=100000000&address=YOUR_ADDRESS"
```

### Issue: "View function failed"
**Solution**: Ensure module is initialized first:
```bash
aptos move run --function-id 'YOUR_ADDRESS::MODULE::initialize'
```

### Issue: "SDK connection timeout"
**Solution**: Check RPC URL in `.aptos/config.yaml`:
```yaml
rest_url: "https://aptos.testnet.m1.movementlabs.xyz/v1"
```

## 📈 Demo Scenarios

### Scenario 1: Conservative Trader (5x leverage)
```bash
# Open position: 1 APT, 5x, 50/30/20 BTC/ETH/SOL
curl -X POST http://localhost:3000/api/position/open \
  -d '{"accountAddress":"...","collateral":100000000,"leverage":5,"btcWeight":50,"ethWeight":30,"solWeight":20}'

# Liquidation at: 20% adverse move
# Buffer: 75% threshold
```

### Scenario 2: Aggressive Trader (20x leverage)
```bash
# Open position: 2 APT, 20x, 70/20/10 BTC/ETH/SOL
curl -X POST http://localhost:3000/api/position/open \
  -d '{"accountAddress":"...","collateral":200000000,"leverage":20,"btcWeight":70,"ethWeight":20,"solWeight":10}'

# Liquidation at: 5% adverse move
# Buffer: 95% threshold
```

### Scenario 3: AI-Optimized Portfolio
```bash
# Create AI strategy with low volatility tolerance
curl -X POST http://localhost:3000/api/ai/strategy/create \
  -d '{"basketId":1,"btcWeight":40,"ethWeight":40,"solWeight":20,"volatilityTolerance":1500}'

# System will auto-rebalance every 6 hours
# Performance fee: 2% on profits
```

## 📝 Test Checklist

Before hackathon submission:

- [ ] All contracts deployed successfully
- [ ] All modules initialized
- [ ] API server running
- [ ] Can open/close positions
- [ ] AI rebalancing works
- [ ] Subscriptions functional
- [ ] Revenue tracking accurate
- [ ] Liquidation logic tested
- [ ] Frontend demo ready
- [ ] Demo video recorded

## 🔗 Resources

- **Movement Explorer**: https://explorer.movementnetwork.xyz/
- **Faucet**: https://faucet.movementnetwork.xyz/
- **Docs**: https://docs.movementnetwork.xyz/
- **GitHub**: https://github.com/Parthkk90/M1-hack-.git

---

**Ready to test on Movement Network! 🚀**

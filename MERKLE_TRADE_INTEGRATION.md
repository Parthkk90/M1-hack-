# Enhanced Leverage Engine - Merkle Trade Integration Plan

## Current vs Merkle Trade Architecture

### What We Have (Current Implementation)
```
✅ Basic 10x leverage
✅ 80% liquidation threshold
✅ Simple collateral ratio calculation
✅ Mock oracle prices
✅ Cross-margin positions
```

### What Merkle Trade Uses (150x System)
```
🎯 150x maximum leverage
🎯 Virtual AMM pricing model
🎯 Funding rate mechanism
🎯 Isolated margin per position
🎯 Pyth Network real-time oracles
🎯 Sponsored transactions (no gas)
🎯 Keyless authentication
🎯 Gamification layer
```

---

## Implementation Plan: Merkle-Inspired Enhancements

### Phase 1: Core Trading Engine Upgrades

#### 1.1 Update Maximum Leverage (Quick Win)
**File**: `sources/leverage_engine.move`
**Changes**:
```move
// OLD
const MAX_LEVERAGE: u64 = 10;
const LIQUIDATION_THRESHOLD: u64 = 80;

// NEW (Merkle-style)
const MAX_LEVERAGE: u64 = 150;
const LIQUIDATION_THRESHOLD: u64 = 993; // 99.3% for 150x safety
const MIN_POSITION_SIZE: u64 = 200000; // $2 minimum (in octas)
```

#### 1.2 Add Isolated Margin System
**New Struct**:
```move
struct IsolatedPosition has store {
    position_id: u64,
    trader: address,
    collateral: u64,          // Only at-risk amount
    leverage: u64,            // 1-150x
    entry_price: u64,
    position_size: u64,
    maintenance_margin: u64,  // Minimum to avoid liquidation
    is_long: bool,
    basket_weights: BasketWeights,
}

struct BasketWeights has store, copy, drop {
    btc: u64,
    eth: u64,
    sol: u64,
}
```

#### 1.3 Dynamic Liquidation Price
**New Function**:
```move
public fun calculate_liquidation_price_dynamic(
    entry_price: u64,
    leverage: u64,
    is_long: bool,
): u64 {
    // Liquidation at (1/leverage)% adverse move
    let liquidation_distance = 10000 / leverage; // bps
    
    if (is_long) {
        // Long: liquidates if price drops
        entry_price * (10000 - liquidation_distance) / 10000
    } else {
        // Short: liquidates if price rises
        entry_price * (10000 + liquidation_distance) / 10000
    }
}
```

---

### Phase 2: Funding Rate Mechanism

#### 2.1 Add Funding Rate Module
**New File**: `sources/funding_rate.move`
```move
module cresca::funding_rate {
    use std::signer;
    use aptos_framework::timestamp;
    
    const FUNDING_PERIOD: u64 = 3600; // 1 hour
    const MAX_FUNDING_RATE: u64 = 100; // 1% max per period
    
    struct FundingState has key {
        long_open_interest: u64,
        short_open_interest: u64,
        last_funding_time: u64,
        cumulative_funding_long: i64,
        cumulative_funding_short: i64,
    }
    
    /// Calculate funding rate based on position imbalance
    public fun calculate_funding_rate(
        long_oi: u64,
        short_oi: u64,
    ): i64 {
        let total_oi = long_oi + short_oi;
        if (total_oi == 0) return 0;
        
        // Imbalance = (Long - Short) / Total
        let imbalance = if (long_oi > short_oi) {
            ((long_oi - short_oi) * 10000) / total_oi
        } else {
            -((short_oi - long_oi) * 10000) / total_oi
        };
        
        // Funding rate = imbalance * 0.01% (capped at 1%)
        let funding_rate = (imbalance * 10) / 10000;
        if (funding_rate > MAX_FUNDING_RATE) {
            MAX_FUNDING_RATE
        } else if (funding_rate < -(MAX_FUNDING_RATE as i64)) {
            -(MAX_FUNDING_RATE as i64)
        } else {
            funding_rate
        }
    }
    
    /// Apply funding payment
    public fun apply_funding_payment(
        position_size: u64,
        is_long: bool,
        funding_rate: i64,
    ): (u64, bool) {
        let payment = (position_size * (funding_rate as u64)) / 10000;
        
        if (is_long) {
            if (funding_rate > 0) {
                // Long pays
                (payment, false)
            } else {
                // Long receives
                (payment, true)
            }
        } else {
            if (funding_rate > 0) {
                // Short receives
                (payment, true)
            } else {
                // Short pays
                (payment, false)
            }
        }
    }
}
```

---

### Phase 3: Gamification Layer (Merkle-Style)

#### 3.1 Trading Rewards Module
**New File**: `sources/trading_rewards.move`
```move
module cresca::trading_rewards {
    use std::signer;
    use std::vector;
    
    struct TraderProfile has key {
        trader: address,
        level: u64,
        total_volume: u64,
        winning_streak: u64,
        loot_boxes: u64,
        achievements: vector<u64>,
    }
    
    struct DailyMission has store {
        mission_type: u8, // 0=trade_volume, 1=positions, 2=streak
        target: u64,
        reward_points: u64,
        completed: bool,
    }
    
    /// Award points for trading volume
    public entry fun record_trade(
        trader: &signer,
        volume: u64,
    ) acquires TraderProfile {
        let addr = signer::address_of(trader);
        
        if (!exists<TraderProfile>(addr)) {
            move_to(trader, TraderProfile {
                trader: addr,
                level: 1,
                total_volume: 0,
                winning_streak: 0,
                loot_boxes: 0,
                achievements: vector::empty(),
            });
        };
        
        let profile = borrow_global_mut<TraderProfile>(addr);
        profile.total_volume = profile.total_volume + volume;
        
        // Award loot box every $10,000 volume
        if (profile.total_volume / 10000_00000000 > profile.loot_boxes) {
            profile.loot_boxes = profile.loot_boxes + 1;
        };
        
        // Level up every $100,000
        profile.level = profile.total_volume / 100000_00000000 + 1;
    }
    
    /// Increment winning streak
    public entry fun record_win(trader: &signer) acquires TraderProfile {
        let addr = signer::address_of(trader);
        assert!(exists<TraderProfile>(addr), 1);
        
        let profile = borrow_global_mut<TraderProfile>(addr);
        profile.winning_streak = profile.winning_streak + 1;
    }
}
```

---

### Phase 4: Walletless & Sponsored Transactions

#### 4.1 Keyless Authentication Integration
**Update**: `src/sdk.ts`
```typescript
import { KeylessAccount } from "@aptos-labs/ts-sdk";

/**
 * Create keyless account using Google OAuth
 */
export async function createKeylessAccount(
  jwt: string, // Google JWT token
  ephemeralKeyPair: any
): Promise<KeylessAccount> {
  const keylessAccount = await KeylessAccount.create({
    proof: jwt,
    ephemeralKeyPair,
    jwt,
  });
  
  return keylessAccount;
}

/**
 * Execute sponsored transaction (no gas for user)
 */
export async function executeWalletlessTransaction(
  keylessAccount: KeylessAccount,
  functionCall: string,
  args: any[]
) {
  const transaction = await aptos.transaction.build.simple({
    sender: keylessAccount.accountAddress,
    data: {
      function: functionCall,
      functionArguments: args,
    },
    options: {
      sponsorAddress: SPONSOR_ADDRESS, // Merkle-style gas sponsorship
    },
  });
  
  const committedTxn = await aptos.signAndSubmitTransaction({
    signer: keylessAccount,
    transaction,
  });
  
  return committedTxn;
}
```

#### 4.2 Update API for Walletless Trading
**Add to**: `src/index.ts`
```typescript
// Walletless sign-in endpoint
app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body;
  
  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Create keyless account
    const ephemeralKeyPair = EphemeralKeyPair.generate();
    const keylessAccount = await createKeylessAccount(idToken, ephemeralKeyPair);
    
    // Store session
    userAccounts.set(keylessAccount.accountAddress.toString(), keylessAccount);
    
    res.json({
      success: true,
      data: {
        address: keylessAccount.accountAddress.toString(),
        email: payload.email,
      }
    });
  } catch (error: any) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Sponsored transaction endpoint
app.post('/api/trade/sponsored', async (req, res) => {
  const { accountAddress, functionName, args } = req.body;
  
  const account = userAccounts.get(accountAddress);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  
  // Execute with gas sponsorship
  const result = await executeWalletlessTransaction(
    account,
    `${CONTRACT_ADDRESS}::basket_vault::${functionName}`,
    args
  );
  
  res.json({
    success: true,
    data: result,
    gasSponsored: true // User pays nothing!
  });
});
```

---

### Phase 5: Enhanced UI Features

#### 5.1 Merkle-Style Mobile Screens

**New Screen**: Gamification Dashboard
```typescript
// GamificationScreen.tsx
interface TraderStats {
  level: number;
  totalVolume: string;
  winningStreak: number;
  lootBoxes: number;
  achievements: string[];
}

const GamificationScreen = () => {
  return (
    <View>
      <Text>Level {stats.level} Trader</Text>
      <ProgressBar progress={stats.volumeToNextLevel} />
      
      <Text>🔥 Winning Streak: {stats.winningStreak}</Text>
      
      <Text>🎁 Loot Boxes: {stats.lootBoxes}</Text>
      <Button onPress={openLootBox}>Open Box</Button>
      
      <Text>Daily Missions:</Text>
      <MissionsList missions={dailyMissions} />
    </View>
  );
};
```

**Enhanced**: Basket Builder with 150x
```typescript
// BasketBuilder.tsx updates
const MAX_LEVERAGE = 150; // Merkle-style
const MIN_POSITION = 2; // $2 minimum

<LeverageSlider
  min={1}
  max={150}
  value={leverage}
  onChange={setLeverage}
  markers={[1, 10, 50, 100, 150]}
/>

<Text style={styles.warning}>
  ⚠️ 150x leverage: 0.67% adverse move = liquidation
</Text>
```

---

## Migration Timeline

### Week 1: Core Upgrades
- [ ] Update leverage limits to 150x
- [ ] Implement isolated margin system
- [ ] Add dynamic liquidation calculations
- [ ] Test with simulated prices

### Week 2: Funding Rates
- [ ] Create funding_rate.move module
- [ ] Integrate with position management
- [ ] Add funding payment UI
- [ ] Test imbalance scenarios

### Week 3: Gamification
- [ ] Create trading_rewards.move
- [ ] Build gamification dashboard
- [ ] Implement loot box mechanics
- [ ] Add achievement system

### Week 4: Walletless
- [ ] Integrate Keyless authentication
- [ ] Set up sponsored transactions
- [ ] Add Google OAuth flow
- [ ] Test end-to-end walletless trading

---

## Key Differences: Current vs Merkle-Enhanced

| Feature | Current | After Merkle Integration |
|---------|---------|-------------------------|
| **Max Leverage** | 10x | 150x |
| **Margin Type** | Cross | Isolated |
| **Min Position** | 0.1 APT (~$1) | $2 (Merkle standard) |
| **Gas Fees** | User pays | Sponsored (free) |
| **Authentication** | Wallet required | Google sign-in |
| **Funding Rates** | None | Hourly payments |
| **Gamification** | None | Streaks, loot boxes, missions |
| **Liquidation** | 80% threshold | Dynamic (99.3% for 150x) |

---

## Risk Considerations

### With 150x Leverage:
- **0.67% adverse move = liquidation** (vs 20% with 10x)
- **Requires real-time oracles** (Pyth Network, not mock prices)
- **Insurance fund needed** for extreme volatility
- **Stricter position limits** per user

### Recommended Approach:
1. **Hackathon Demo**: Keep 10x with mock prices (stable, easy to demo)
2. **Post-Hackathon**: Upgrade to 150x with Pyth integration
3. **Production**: Full Merkle-style system with all features

---

## Cost Estimate

### Development Time:
- Core upgrades (150x + isolated): **15-20 hours**
- Funding rate system: **10-15 hours**
- Gamification layer: **20-25 hours**
- Walletless integration: **15-20 hours**
- Testing & deployment: **10-15 hours**

**Total**: 70-95 hours (~2-3 weeks full-time)

### Infrastructure Costs:
- Pyth oracle fees: ~$0.01 per price update
- Sponsored gas budget: ~$500-1000/month for 1000 users
- Keeper bot hosting: ~$50/month

---

## Recommendation for Movement Hackathon

### Option A: Enhanced Demo (Recommended)
**Keep 10x leverage BUT add**:
- ✅ Keyless authentication (walletless trading)
- ✅ Sponsored transactions (no gas fees)
- ✅ Basic gamification (trading streaks)
- ✅ Better UI/UX mimicking Merkle

**Advantage**: Stable demo, proven tech, judge-friendly

### Option B: Full 150x Implementation
**Implement complete Merkle-style system**:
- ✅ 150x leverage with isolated margin
- ✅ Funding rate mechanism
- ✅ Advanced gamification
- ✅ Pyth oracle integration

**Risk**: Complex, harder to demo, potential bugs

---

## Next Steps

1. **Decide leverage strategy**: 10x (safe) or 150x (ambitious)?
2. **Prioritize features**: Which Merkle features add most value?
3. **Set timeline**: Hackathon deadline vs post-hackathon roadmap
4. **Test strategy**: Mock prices (safe) or Pyth (production-ready)?

Would you like me to implement the **Enhanced Demo (Option A)** or go full **150x Merkle-style (Option B)**?

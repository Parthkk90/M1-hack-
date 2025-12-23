# Movement Baskets - Complete Workflow Map 🗺️

## 🔄 Full User Journey - From UI to Blockchain

### 1. Opening a Position 📈

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (Mobile/Web)                   │
│                                                                  │
│  User fills Basket Builder form:                                │
│  • Collateral: 1.0 APT                                          │
│  • Leverage: 10x                                                │
│  • Weights: 50% BTC, 30% ETH, 20% SOL                          │
│  • Direction: LONG                                              │
│                                                                  │
│  [Open Position Button] ────────────┐                           │
└─────────────────────────────────────┼───────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              INTEGRATION LAYER (integration.ts)                  │
│                                                                  │
│  api.openPosition(1.0, 10, 50, 30, 20, true)                   │
│  • Converts APT to octas (1.0 → 100000000)                     │
│  • Validates inputs                                             │
│  • Checks wallet connection                                     │
│                                                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SDK LAYER (sdk.ts)                            │
│                                                                  │
│  sdk.openPosition(account, 100000000, 10, 50, 30, 20, true)   │
│  • Validates leverage (1-20x)                                   │
│  • Checks weight sum = 100                                      │
│  • Builds transaction                                           │
│  • Signs with user account                                      │
│                                                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              APTOS SDK (@aptos-labs/ts-sdk)                      │
│                                                                  │
│  aptos.transaction.build.simple({                               │
│    function: "basket_vault::open_position",                     │
│    arguments: [vault, 100000000, 10, 50, 30, 20, true]         │
│  })                                                             │
│                                                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│           MOVEMENT NETWORK (Aptos-based L2)                      │
│                                                                  │
│  ┌───────────────────────────────────────────────────┐          │
│  │  basket_vault.move: open_position()               │          │
│  │  • Validates collateral >= MIN_COLLATERAL         │          │
│  │  • Creates BasketPosition struct                  │          │
│  │  • Calculates maintenance margin                  │          │
│  │  • Fetches prices from price_oracle               │          │
│  │  • Locks collateral                               │          │
│  │  • Emits PositionOpened event                     │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                  │
│  ┌───────────────────────────────────────────────────┐          │
│  │  price_oracle.move: get_all_prices()              │          │
│  │  • Returns BTC: $95,000                           │          │
│  │  • Returns ETH: $3,500                            │          │
│  │  • Returns SOL: $180                              │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                  │
│  ┌───────────────────────────────────────────────────┐          │
│  │  leverage_engine.move: calculate_metrics()        │          │
│  │  • Position size: 10 APT (1 APT × 10x)            │          │
│  │  • Entry value: $500 (at $50/APT)                 │          │
│  │  • Liquidation price: $45/APT (10% drop)          │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                  │
│  ┌───────────────────────────────────────────────────┐          │
│  │  funding_rate.move: update_open_interest()        │          │
│  │  • Increases long_open_interest += 10 APT         │          │
│  │  • Recalculates funding rate                      │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                  │
│  ┌───────────────────────────────────────────────────┐          │
│  │  revenue_distributor.move: collect_trading_fee()  │          │
│  │  • Fee: 0.1% of 10 APT = 0.01 APT                 │          │
│  │  • Adds to total_trading_fees                     │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                  │
│  TX Hash: 0xabcd...                                             │
│  Status: SUCCESS ✅                                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE FLOW (Back to UI)                    │
│                                                                  │
│  Movement Network → Aptos SDK → SDK → Integration → UI         │
│                                                                  │
│  Returns: {                                                     │
│    success: true,                                               │
│    transactionHash: "0xabcd...",                                │
│    message: "Position opened with 10x leverage"                 │
│  }                                                              │
│                                                                  │
│  UI Updates:                                                    │
│  • Shows success toast ✅                                       │
│  • Refreshes positions list                                     │
│  • Updates portfolio value                                      │
│  • Shows transaction link                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Keeper Bot Operations 🤖

### Payment Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    KEEPER BOT (keeper.ts)                        │
│                                                                  │
│  Every 60 seconds:                                              │
│  for each tracked scheduler:                                    │
│    1. getUserSchedules(schedulerAddress)                        │
│    2. Check if execution_time <= now                            │
│    3. If pending → executePendingPayments()                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              PAYMENT SCHEDULER CONTRACT                          │
│                                                                  │
│  execute_pending_payments(scheduler_addr)                       │
│  • Iterates through all schedules                               │
│  • Finds execution_time <= current_time                         │
│  • Transfers funds to recipients                                │
│  • Updates next_execution_time (if recurring)                   │
│  • Deactivates if execution_count reached                       │
│  • Emits PaymentExecuted event                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Liquidation Monitoring Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    KEEPER BOT (keeper.ts)                        │
│                                                                  │
│  Every 30 seconds:                                              │
│  for each monitored position:                                   │
│    1. getPositionHealth(vaultAddr, positionId)                  │
│    2. If health < 1.0 → liquidatePosition()                     │
│    3. If health < 1.2 → warn user                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              HEALTH CALCULATION (sdk.ts)                         │
│                                                                  │
│  getPositionHealth(vaultAddr, positionId)                       │
│  1. Fetch position details                                      │
│  2. Fetch current oracle prices                                 │
│  3. Calculate weighted basket value                             │
│  4. Compare collateral vs position size                         │
│  5. Return health factor (>1 = healthy, <1 = liquidation)      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│            LIQUIDATION CONTRACT (basket_vault.move)              │
│                                                                  │
│  liquidate_position(vault_addr, owner, position_id)            │
│  • Validates position is underwater                             │
│  • Closes position                                              │
│  • Transfers remaining collateral to owner                      │
│  • Pays liquidation reward to keeper (5%)                       │
│  • Collects liquidation fee (0.5%)                              │
│  • Emits PositionLiquidated event                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. AI Rebalancing Workflow 🤖

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER CREATES AI STRATEGY                     │
│                                                                  │
│  api.createAIStrategy(                                          │
│    basketId: 1,                                                 │
│    btcWeight: 40, ethWeight: 40, solWeight: 20,                │
│    volatilityTolerance: 2000,  // 20%                          │
│    rebalanceThreshold: 500     // 5%                           │
│  )                                                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│           REBALANCING ENGINE (rebalancing_engine.move)           │
│                                                                  │
│  create_strategy()                                              │
│  • Stores target weights: [40, 40, 20]                         │
│  • Sets volatility_tolerance: 2000                              │
│  • Sets rebalance_threshold: 500                                │
│  • Marks is_ai_managed: true                                    │
│  • Sets last_rebalance_time: now                                │
└─────────────────────────────────────────────────────────────────┘

              ⏱️  Time passes... Market moves...

┌─────────────────────────────────────────────────────────────────┐
│                    PERIODIC CHECK (Optional)                     │
│                                                                  │
│  Current weights drift to [50, 35, 15]  (10% deviation)        │
│  should_rebalance(strategyAddr, [50, 35, 15])                  │
│  → Returns: TRUE (deviation > 5% threshold)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER TRIGGERS REBALANCE                       │
│                                                                  │
│  api.executeRebalance(basketId)                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│           REBALANCING ENGINE (rebalancing_engine.move)           │
│                                                                  │
│  execute_rebalance(basket_id)                                   │
│  1. calculate_risk_score() → 65/100                            │
│  2. calculate_optimal_weights() → [40, 40, 20]                 │
│  3. Update position weights                                     │
│  4. Collect performance fee (2% of profits)                     │
│  5. Update last_rebalance_time                                  │
│  6. Emit RebalanceExecuted event                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Revenue & Fee Collection 💰

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTOMATIC FEE COLLECTION                    │
│                                                                  │
│  Triggered on every operation:                                  │
│                                                                  │
│  open_position() → collect_trading_fee(0.1%)                   │
│  close_position() → collect_performance_fee(2% of profit)       │
│  liquidate_position() → collect_liquidation_fee(0.5%)          │
│  subscribe_premium() → collect_subscription_fee(10 APT/month)   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│         REVENUE DISTRIBUTOR (revenue_distributor.move)           │
│                                                                  │
│  FeeConfig {                                                    │
│    trading_fee_bps: 10,        // 0.1%                         │
│    performance_fee_bps: 200,   // 2%                           │
│    liquidation_fee_bps: 50,    // 0.5%                         │
│    total_trading_fees: 1000000000,                              │
│    total_performance_fees: 500000000,                           │
│    total_liquidation_fees: 250000000,                           │
│    total_subscription_fees: 10000000000                         │
│  }                                                              │
│                                                                  │
│  RevenueVault {                                                 │
│    balance: 11750000000  // ~117.5 APT                         │
│  }                                                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN WITHDRAWS FEES                          │
│                                                                  │
│  sdk.withdrawFees(adminAccount, 50000000)  // 0.5 APT          │
│  • Validates admin authorization                                │
│  • Transfers from RevenueVault to admin                         │
│  • Updates vault balance                                        │
│  • Emits FeeWithdrawn event                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Flow Architecture 🔄

```
┌────────────────────────────────────────────────────────────────┐
│                        USER DEVICES                             │
│                                                                 │
│  📱 Mobile App (React Native)    🖥️  Web App (React)          │
│     • Basket Builder                 • Dashboard              │
│     • Portfolio Manager              • Analytics             │
│     • Payment Scheduler              • Admin Panel           │
└────────────┬────────────────────────────────┬─────────────────┘
             │                                │
             │  integration.ts           app.js
             │                                │
             └────────────┬───────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                   TYPESCRIPT SDK (sdk.ts)                     │
│                                                               │
│  70+ Functions organized by module:                          │
│  • Basket Operations (7)                                     │
│  • Oracle Integration (4)                                    │
│  • Leverage Management (5)                                   │
│  • Funding Rates (4)                                         │
│  • Payment Scheduling (8)                                    │
│  • AI Rebalancing (9)                                        │
│  • Revenue System (11)                                       │
│  • Position Management (6)                                   │
│  • Analytics (5)                                             │
│  • Utilities (11)                                            │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│              APTOS TYPESCRIPT SDK                             │
│          (@aptos-labs/ts-sdk v1.x)                           │
│                                                               │
│  • Transaction building                                      │
│  • Account management                                        │
│  • Signing & submission                                      │
│  • View function calls                                       │
│  • Event listening                                           │
└─────────────────────────┬────────────────────────────────────┘
                          │
                    HTTPS/WSS
                          │
┌─────────────────────────▼────────────────────────────────────┐
│           MOVEMENT NETWORK (Aptos-based L2)                   │
│         testnet.movementnetwork.xyz                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Smart Contracts (Move Language)                     │    │
│  │                                                       │    │
│  │  cresca::basket_vault                                │    │
│  │  cresca::price_oracle                                │    │
│  │  cresca::leverage_engine                             │    │
│  │  cresca::funding_rate                                │    │
│  │  cresca::payment_scheduler                           │    │
│  │  cresca::rebalancing_engine                          │    │
│  │  cresca::revenue_distributor                         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  State Storage:                                              │
│  • Positions, Oracles, Schedules, Strategies, Fees          │
│                                                               │
│  Events:                                                     │
│  • PositionOpened, PositionClosed, PositionLiquidated       │
│  • PaymentScheduled, PaymentExecuted                         │
│  • RebalanceExecuted, FeesCollected                         │
└───────────────────────────────────────────────────────────────┘
```

---

## 📊 Complete Contract Interaction Map

### Open Position Flow:
```
User → integration.ts → sdk.ts → Aptos SDK → Movement Network
         ↓                ↓          ↓              ↓
     Validation     Transaction   Signing    basket_vault.move
                    Building                      ↓
                                            price_oracle.move
                                                  ↓
                                           leverage_engine.move
                                                  ↓
                                           funding_rate.move
                                                  ↓
                                        revenue_distributor.move
```

### Close Position Flow:
```
User → Close Button → sdk.closePosition() → basket_vault.move
                            ↓                      ↓
                      Get position           Calculate P&L
                      details                     ↓
                            ↓               price_oracle.move
                      Calculate fees              ↓
                            ↓               Return collateral
                  revenue_distributor.move    + profits
```

### Liquidation Flow:
```
Keeper Bot → getPositionHealth() → leverage_engine.move
    ↓              ↓                       ↓
Health < 1.0   Fetch prices          Calculate metrics
    ↓              ↓                       ↓
liquidatePosition() → basket_vault.move → Close position
                            ↓
                  revenue_distributor.move → Collect fee
                            ↓
                      Pay liquidator 5% reward
```

---

## 🎯 Summary

**Every UI action flows through:**
1. **Integration Layer** - Input validation, user feedback
2. **SDK Layer** - Business logic, transaction building  
3. **Aptos SDK** - Transaction signing, submission
4. **Movement Network** - Smart contract execution
5. **Response** - Success/error back to UI

**Keeper Bot independently:**
- Monitors schedules every 60s
- Monitors positions every 30s
- Executes autonomously
- Earns liquidation rewards

**All 48 contract functions accessible through:**
- TypeScript SDK (programmatic)
- Mobile app (user-friendly)
- Keeper bot (automated)

✅ **100% contract coverage achieved!**

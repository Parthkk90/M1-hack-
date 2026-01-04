# 🔐 Cresca Smart Contract Integration Guide
## Movement Network - Complete API Documentation

**Version:** 1.0.0  
**Network:** Movement Testnet (Aptos-based)  
**Last Updated:** December 31, 2025

---

## 📋 Table of Contents

1. [Deployed Contract Information](#deployed-contract-information)
2. [Network Configuration](#network-configuration)
3. [Authentication & Keys](#authentication--keys)
4. [Module 1: Payments Module](#module-1-payments-module)
5. [Module 2: Wallet Module](#module-2-wallet-module)
6. [Module 3: Bucket Protocol Module](#module-3-bucket-protocol-module)
7. [Integration Examples](#integration-examples)
8. [Error Codes Reference](#error-codes-reference)

---

## 🚀 Deployed Contract Information

### **Main Contract Address**
```
0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796
```

### **Module Names**
1. `cresca::payments` - Payment and transaction handling
2. `cresca::wallet` - Wallet management, scheduled payments, baskets
3. `cresca::bucket_protocol` - Perpetual trading and leveraged positions

### **Alternative Contract Address (App Config)**
```
0xf5fe51c654d6475b8bf41bd0697a81fec15dbfb5488e83970d98badcaaec97a1
```
*Note: Use the address from Move.toml (0x3aa36...) for actual deployment*

---

## 🌐 Network Configuration

### **Movement Testnet Details**

```typescript
const MOVEMENT_CONFIG = {
  // RPC Endpoints
  rpcUrl: 'https://testnet.movementnetwork.xyz/v1',
  indexerUrl: 'https://hasura.testnet.movementnetwork.xyz/v1/graphql',
  
  // Explorer & Faucet
  explorerUrl: 'https://explorer.movementnetwork.xyz/?network=bardock+testnet',
  faucetUrl: 'https://faucet.testnet.movementnetwork.xyz',
  
  // Chain Configuration
  chainId: '250',
  coinType: '0x1::aptos_coin::AptosCoin',
  
  // Transaction Settings
  maxGasAmount: 200000,
  gasUnitPrice: 100,
  timeoutSeconds: 30,
};
```

### **React Native Configuration**

```typescript
// src/core/config/app.config.ts
export const AppConfig = {
  movementNetwork: {
    url: 'https://testnet.movementnetwork.xyz/v1',
    faucetUrl: 'https://faucet.testnet.movementnetwork.xyz',
    explorerUrl: 'https://explorer.movementnetwork.xyz/?network=bardock+testnet',
    indexerUrl: 'https://hasura.testnet.movementnetwork.xyz/v1/graphql',
    chainId: '250',
  },
  contract: {
    address: '0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796',
    moduleName: 'cresca::payments',
  },
};
```

---

## 🔑 Authentication & Keys

### **⚠️ CRITICAL: For Development/Testing ONLY**

**DO NOT use these keys in production or commit to public repositories!**

### **Deployer Account (Main Contract Owner)**

```
Private Key: 0x4D0EFE6773051213CA4547FEE40C37FDE71BE25D99C2E8412507A0D9CEF2BE4B
Address: 0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796
```

**Purpose:** Contract deployment and administrative functions  
**File:** `contracts/deployer_key.txt`

### **Test Recipient 1**

```
Private Key: 0x00C03D098B526C6672B56CDD84687B575A37F9755CC7E323258D2AF74DF40627
```

**Purpose:** Testing payment receiving  
**File:** `contracts/test_recipient.txt`

### **Test Recipient 2**

```
Private Key: 0xD95B7C8CBB8611E566A677CB1E1D24B318D2D003E5A6727C7AADD499392C5384
```

**Purpose:** Testing batch payments and multi-user scenarios  
**File:** `contracts/test_recipient2.txt`

### **Example Test Account (from test script)**

```
Private Key: 0x855F7AB6FB12535AAF661AF350B88270DB2CFE801C68AB4BEFC73B40F6599050
```

**Purpose:** Bucket protocol testing  
**File:** `contracts/test_simple.ps1`

---

## 📦 Module 1: Payments Module

**Module ID:** `cresca::payments`  
**Contract Address:** `0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796`

### **📝 Entry Functions (Write Operations)**

#### 1. **initialize**
Initialize payment history for an account

```typescript
Function ID: ${CONTRACT_ADDRESS}::payments::initialize

Parameters: None (uses signer)

Example:
await client.submitTransaction(account, {
  function: "0x3aa36...::payments::initialize",
  type_arguments: [],
  arguments: []
});
```

**Purpose:** Sets up PaymentHistory resource for tracking sent/received payments  
**Required:** Call once before sending any payments  
**Gas Estimate:** ~50,000 units

---

#### 2. **send_payment**
Send payment with optional memo

```typescript
Function ID: ${CONTRACT_ADDRESS}::payments::send_payment

Parameters:
- recipient: address       // Recipient's wallet address
- amount: u64             // Amount in smallest unit (e.g., 1 APT = 100000000)
- memo: vector<u8>        // UTF-8 encoded memo/message

Example (TypeScript):
await client.submitTransaction(account, {
  function: "0x3aa36...::payments::send_payment",
  type_arguments: [],
  arguments: [
    "0x1234567890abcdef...", // recipient
    "100000000",            // 1.0 token
    new TextEncoder().encode("Payment for dinner")
  ]
});

Example (JavaScript/React Native):
import { Buffer } from 'buffer';

const sendPayment = async (recipient, amount, memo) => {
  const memoBytes = Array.from(Buffer.from(memo, 'utf8'));
  
  const payload = {
    function: `${CONTRACT_ADDRESS}::payments::send_payment`,
    type_arguments: [],
    arguments: [recipient, amount.toString(), memoBytes]
  };
  
  return await signAndSubmitTransaction(payload);
};
```

**Features:**
- Updates sender's payment history
- Updates recipient's payment history (if initialized)
- Emits `PaymentSentEvent` and `PaymentReceivedEvent`
- Stores timestamp and memo

**Gas Estimate:** ~100,000 units

---

#### 3. **tap_to_pay**
Quick send without custom memo (optimized for NFC/QR payments)

```typescript
Function ID: ${CONTRACT_ADDRESS}::payments::tap_to_pay

Parameters:
- recipient: address
- amount: u64

Example:
const tapToPay = async (recipient, amount) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::payments::tap_to_pay`,
    type_arguments: [],
    arguments: [recipient, amount.toString()]
  };
  
  return await signAndSubmitTransaction(payload);
};
```

**Features:**
- Faster than send_payment (no memo processing)
- Automatically adds "Tap to Pay" memo
- Perfect for in-person transactions
- Emits `TapToPayEvent`

**Gas Estimate:** ~80,000 units

---

#### 4. **batch_send**
Send to multiple recipients in one transaction

```typescript
Function ID: ${CONTRACT_ADDRESS}::payments::batch_send

Parameters:
- recipients: vector<address>  // Array of recipient addresses
- amounts: vector<u64>         // Array of amounts (must match recipients length)

Example:
const batchSend = async (recipientsArray, amountsArray) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::payments::batch_send`,
    type_arguments: [],
    arguments: [
      recipientsArray,                    // ["0xabc...", "0xdef..."]
      amountsArray.map(a => a.toString()) // ["100000000", "200000000"]
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};

// Usage
await batchSend(
  [
    "0x00C03D098B526C6672B56CDD84687B575A37F9755CC7E323258D2AF74DF40627",
    "0xD95B7C8CBB8611E566A677CB1E1D24B318D2D003E5A6727C7AADD499392C5384"
  ],
  [100000000, 200000000] // 1.0 and 2.0 tokens
);
```

**Features:**
- Gas efficient for multiple payments
- All payments in single transaction
- Automatically skips invalid recipients/amounts
- Adds "Batch Payment" memo

**Gas Estimate:** ~50,000 + (30,000 × number_of_recipients) units

---

### **👁️ View Functions (Read Operations)**

#### 1. **is_initialized**
Check if account has payment history

```typescript
Function: view(${CONTRACT_ADDRESS}::payments::is_initialized)

Parameters:
- addr: address

Returns: bool

Example:
const isInitialized = await client.view({
  function: `${CONTRACT_ADDRESS}::payments::is_initialized`,
  type_arguments: [],
  arguments: [accountAddress]
});
// Returns: true or false
```

---

#### 2. **get_payment_count**
Get sent and received payment counts

```typescript
Function: view(${CONTRACT_ADDRESS}::payments::get_payment_count)

Parameters:
- addr: address

Returns: (u64, u64) // (sent_count, received_count)

Example:
const [sentCount, receivedCount] = await client.view({
  function: `${CONTRACT_ADDRESS}::payments::get_payment_count`,
  type_arguments: [],
  arguments: [accountAddress]
});

console.log(`Sent: ${sentCount}, Received: ${receivedCount}`);
```

---

#### 3. **get_total_volume**
Get total sent and received amounts

```typescript
Function: view(${CONTRACT_ADDRESS}::payments::get_total_volume)

Parameters:
- addr: address

Returns: (u64, u64) // (total_sent, total_received)

Example:
const [totalSent, totalReceived] = await client.view({
  function: `${CONTRACT_ADDRESS}::payments::get_total_volume`,
  type_arguments: [],
  arguments: [accountAddress]
});

const sentAPT = Number(totalSent) / 100000000;
const receivedAPT = Number(totalReceived) / 100000000;
console.log(`Sent: ${sentAPT} APT, Received: ${receivedAPT} APT`);
```

---

#### 4. **get_sent_payments_count**
Get number of sent payments

```typescript
Function: view(${CONTRACT_ADDRESS}::payments::get_sent_payments_count)

Returns: u64
```

---

#### 5. **get_received_payments_count**
Get number of received payments

```typescript
Function: view(${CONTRACT_ADDRESS}::payments::get_received_payments_count)

Returns: u64
```

---

### **📡 Events**

#### **PaymentSentEvent**
```typescript
struct PaymentSentEvent {
  from: address,
  to: address,
  amount: u64,
  timestamp: u64,
  memo: string
}
```

#### **PaymentReceivedEvent**
```typescript
struct PaymentReceivedEvent {
  from: address,
  to: address,
  amount: u64,
  timestamp: u64
}
```

#### **TapToPayEvent**
```typescript
struct TapToPayEvent {
  sender: address,
  receiver: address,
  amount: u64,
  timestamp: u64
}
```

---

## 💼 Module 2: Wallet Module

**Module ID:** `cresca::wallet`  
**Contract Address:** `0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796`

### **📝 Entry Functions**

#### 1. **initialize_wallet**
Initialize wallet for user

```typescript
Function ID: ${CONTRACT_ADDRESS}::wallet::initialize_wallet

Parameters: None (uses signer)

Purpose:
- Creates Wallet resource
- Registers for AptosCoin
- Initializes scheduled payments
- Initializes baskets

Example:
await client.submitTransaction(account, {
  function: `${CONTRACT_ADDRESS}::wallet::initialize_wallet`,
  type_arguments: [],
  arguments: []
});
```

---

#### 2. **send_coins**
Send coins to recipient with event tracking

```typescript
Function ID: ${CONTRACT_ADDRESS}::wallet::send_coins

Parameters:
- recipient: address
- amount: u64

Example:
const sendCoins = async (recipient, amount) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::wallet::send_coins`,
    type_arguments: [],
    arguments: [recipient, amount.toString()]
  };
  
  return await signAndSubmitTransaction(payload);
};
```

**Difference from payments::send_payment:**
- Tracks transaction count in Wallet resource
- Emits TransactionEvent with type codes
- Does not store payment history details

---

#### 3. **schedule_payment**
Schedule a future or recurring payment

```typescript
Function ID: ${CONTRACT_ADDRESS}::wallet::schedule_payment

Parameters:
- recipient: address
- amount: u64
- execution_time: u64    // Unix timestamp (seconds)
- interval: u64          // 0 = one-time, >0 = recurring (seconds)

Example - Schedule one-time payment:
const scheduleOneTime = async (recipient, amount, executionDate) => {
  const executionTime = Math.floor(executionDate.getTime() / 1000);
  
  const payload = {
    function: `${CONTRACT_ADDRESS}::wallet::schedule_payment`,
    type_arguments: [],
    arguments: [
      recipient,
      amount.toString(),
      executionTime.toString(),
      "0" // one-time payment
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};

Example - Schedule recurring payment (monthly):
const scheduleRecurring = async (recipient, amount, startDate) => {
  const executionTime = Math.floor(startDate.getTime() / 1000);
  const monthlyInterval = 30 * 24 * 60 * 60; // 30 days in seconds
  
  const payload = {
    function: `${CONTRACT_ADDRESS}::wallet::schedule_payment`,
    type_arguments: [],
    arguments: [
      recipient,
      amount.toString(),
      executionTime.toString(),
      monthlyInterval.toString()
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};
```

**Features:**
- Schedule payments for future execution
- Support for recurring payments
- Auto-reschedules if interval > 0
- Emits `ScheduledPaymentEvent` with status

---

#### 4. **execute_scheduled_payment**
Execute a due scheduled payment

```typescript
Function ID: ${CONTRACT_ADDRESS}::wallet::execute_scheduled_payment

Parameters:
- payment_id: u64

Example:
const executePayment = async (paymentId) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::wallet::execute_scheduled_payment`,
    type_arguments: [],
    arguments: [paymentId.toString()]
  };
  
  return await signAndSubmitTransaction(payload);
};
```

**Validation:**
- Payment must not be already executed
- Current time >= execution_time
- Automatically reschedules if recurring

---

#### 5. **create_basket**
Create a basket for perpetual trading

```typescript
Function ID: ${CONTRACT_ADDRESS}::wallet::create_basket

Parameters:
- name: vector<u8>      // UTF-8 encoded basket name
- initial_value: u64    // Initial value to lock

Example:
const createBasket = async (name, initialValue) => {
  const nameBytes = Array.from(Buffer.from(name, 'utf8'));
  
  const payload = {
    function: `${CONTRACT_ADDRESS}::wallet::create_basket`,
    type_arguments: [],
    arguments: [
      nameBytes,
      initialValue.toString()
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};

// Usage
await createBasket("Tech Stocks", 1000000000); // 10 tokens
```

---

### **👁️ View Functions**

#### **is_wallet_initialized**
```typescript
Returns: bool
Example: await client.view({ function: `${CONTRACT_ADDRESS}::wallet::is_wallet_initialized`, arguments: [address] });
```

#### **get_balance**
```typescript
Returns: u64 (balance in smallest unit)
Example:
const balance = await client.view({
  function: `${CONTRACT_ADDRESS}::wallet::get_balance`,
  arguments: [address]
});
const balanceAPT = Number(balance) / 100000000;
```

#### **get_transaction_count**
```typescript
Returns: u64
```

#### **get_basket_count**
```typescript
Returns: u64
```

#### **get_scheduled_payment_count**
```typescript
Returns: u64
```

---

### **📡 Events**

#### **TransactionEvent**
```typescript
struct TransactionEvent {
  from: address,
  to: address,
  amount: u64,
  timestamp: u64,
  transaction_type: u8  // 0: send, 1: receive, 2: basket, 3: scheduled
}
```

#### **ScheduledPaymentEvent**
```typescript
struct ScheduledPaymentEvent {
  payment_id: u64,
  recipient: address,
  amount: u64,
  execution_time: u64,
  status: u8  // 0: created, 1: executed, 2: cancelled
}
```

---

## 🏦 Module 3: Bucket Protocol Module

**Module ID:** `cresca::bucket_protocol`  
**Contract Address:** `0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796`

**Purpose:** Perpetual trading with leveraged positions on asset buckets

### **📝 Entry Functions**

#### 1. **init**
Initialize bucket protocol for user

```typescript
Function ID: ${CONTRACT_ADDRESS}::bucket_protocol::init

Parameters: None (uses signer)

Example:
await client.submitTransaction(account, {
  function: `${CONTRACT_ADDRESS}::bucket_protocol::init`,
  type_arguments: [],
  arguments: []
});
```

**Initializes:**
- Buckets storage
- Positions storage
- Collaterals storage
- Mock Oracle
- Event handles

---

#### 2. **create_bucket**
Create a new trading bucket

```typescript
Function ID: ${CONTRACT_ADDRESS}::bucket_protocol::create_bucket

Parameters:
- assets: vector<address>    // Array of asset addresses
- weights: vector<u64>       // Array of weights (must match assets length)
- leverage: u8               // Leverage multiplier (1-20)

Example:
const createBucket = async (assets, weights, leverage) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::bucket_protocol::create_bucket`,
    type_arguments: [],
    arguments: [
      assets,
      weights.map(w => w.toString()),
      leverage.toString()
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};

// Usage - Create 50/50 BTC/ETH bucket with 5x leverage
await createBucket(
  [
    "0x1111111111111111111111111111111111111111111111111111111111111111", // BTC
    "0x2222222222222222222222222222222222222222222222222222222222222222"  // ETH
  ],
  [50, 50],      // 50% each
  5              // 5x leverage
);
```

**Constraints:**
- Assets and weights arrays must have same length
- Leverage: 1-20
- Emits `BucketCreatedEvent`

---

#### 3. **deposit_collateral**
Deposit collateral for trading

```typescript
Function ID: ${CONTRACT_ADDRESS}::bucket_protocol::deposit_collateral

Parameters:
- amount: u64

Example:
await signAndSubmitTransaction({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::deposit_collateral`,
  type_arguments: [],
  arguments: ["1000000000"] // 10 tokens
});
```

---

#### 4. **open_position**
Open a leveraged position on a bucket

```typescript
Function ID: ${CONTRACT_ADDRESS}::bucket_protocol::open_position

Parameters:
- bucket_id: u64
- is_long: bool          // true = long (bet on price increase), false = short
- margin: u64            // Collateral amount for position

Example:
const openLongPosition = async (bucketId, margin) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::bucket_protocol::open_position`,
    type_arguments: [],
    arguments: [
      bucketId.toString(),
      true,                // Long position
      margin.toString()
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};

const openShortPosition = async (bucketId, margin) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::bucket_protocol::open_position`,
    type_arguments: [],
    arguments: [
      bucketId.toString(),
      false,               // Short position
      margin.toString()
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};
```

**Process:**
1. Deducts margin from collateral
2. Records entry price
3. Creates position
4. Emits `PositionOpenedEvent`

---

#### 5. **close_position**
Close a position and realize P&L

```typescript
Function ID: ${CONTRACT_ADDRESS}::bucket_protocol::close_position

Parameters:
- position_id: u64

Example:
const closePosition = async (positionId) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::bucket_protocol::close_position`,
    type_arguments: [],
    arguments: [positionId.toString()]
  };
  
  return await signAndSubmitTransaction(payload);
};
```

**P&L Calculation:**
- Long: Profit if exit_price > entry_price
- Short: Profit if entry_price > exit_price
- Returns margin + profit (or margin - loss) to collateral
- Emits `PositionClosedEvent` with P&L

---

#### 6. **rebalance_bucket**
Update bucket weights (owner only)

```typescript
Function ID: ${CONTRACT_ADDRESS}::bucket_protocol::rebalance_bucket

Parameters:
- bucket_id: u64
- new_weights: vector<u64>

Example:
const rebalanceBucket = async (bucketId, newWeights) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::bucket_protocol::rebalance_bucket`,
    type_arguments: [],
    arguments: [
      bucketId.toString(),
      newWeights.map(w => w.toString())
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};

// Change from 50/50 to 70/30 BTC/ETH
await rebalanceBucket(0, [70, 30]);
```

---

#### 7. **update_oracle**
Update mock oracle prices (testing only)

```typescript
Function ID: ${CONTRACT_ADDRESS}::bucket_protocol::update_oracle

Parameters:
- prices: vector<u64>
- funding_rates: vector<u64>

Example:
const updateOracle = async (prices, fundingRates) => {
  const payload = {
    function: `${CONTRACT_ADDRESS}::bucket_protocol::update_oracle`,
    type_arguments: [],
    arguments: [
      prices.map(p => p.toString()),
      fundingRates.map(f => f.toString())
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};

// Update BTC=$50000, ETH=$3000
await updateOracle([50000, 3000], [10, 15]); // with funding rates
```

---

#### 8. **liquidate_position**
Liquidate undercollateralized position

```typescript
Function ID: ${CONTRACT_ADDRESS}::bucket_protocol::liquidate_position

Parameters:
- position_id: u64
- reason: vector<u8>     // UTF-8 encoded liquidation reason

Example:
const liquidatePosition = async (positionId, reason) => {
  const reasonBytes = Array.from(Buffer.from(reason, 'utf8'));
  
  const payload = {
    function: `${CONTRACT_ADDRESS}::bucket_protocol::liquidate_position`,
    type_arguments: [],
    arguments: [
      positionId.toString(),
      reasonBytes
    ]
  };
  
  return await signAndSubmitTransaction(payload);
};

// Usage
await liquidatePosition(5, "Health factor below threshold");
```

**Triggers when:**
- Health factor < 100 (liquidation threshold)
- Position becomes undercollateralized

---

### **👁️ View Functions**

#### **get_bucket_count**
```typescript
Returns: u64 (number of buckets)

const count = await client.view({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::get_bucket_count`,
  arguments: [userAddress]
});
```

---

#### **get_bucket**
```typescript
Returns: (vector<address>, vector<u64>, u8, address)
         (assets, weights, leverage, owner)

const [assets, weights, leverage, owner] = await client.view({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::get_bucket`,
  arguments: [userAddress, bucketId]
});
```

---

#### **get_all_bucket_ids**
```typescript
Returns: vector<u64> (array of bucket IDs)

const bucketIds = await client.view({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::get_all_bucket_ids`,
  arguments: [userAddress]
});
```

---

#### **get_position_count**
```typescript
Returns: u64
```

---

#### **get_position**
```typescript
Returns: (u64, bool, u64, u64, address, bool)
         (bucket_id, is_long, margin, entry_price, owner, is_active)

const [bucketId, isLong, margin, entryPrice, owner, isActive] = await client.view({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::get_position`,
  arguments: [userAddress, positionId]
});
```

---

#### **get_active_position_ids**
```typescript
Returns: vector<u64> (array of active position IDs)

const activePositions = await client.view({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::get_active_position_ids`,
  arguments: [userAddress]
});
```

---

#### **get_collateral_balance**
```typescript
Returns: u64

const balance = await client.view({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::get_collateral_balance`,
  arguments: [userAddress, ownerAddress]
});
```

---

#### **get_oracle_prices**
```typescript
Returns: vector<u64> (array of asset prices)

const prices = await client.view({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::get_oracle_prices`,
  arguments: [userAddress]
});
```

---

#### **get_bucket_market_value**
```typescript
Returns: u64 (weighted average price)

const marketValue = await client.view({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::get_bucket_market_value`,
  arguments: [userAddress, bucketId]
});
```

---

#### **get_position_health_factor**
```typescript
Returns: u64 (health factor as percentage, 100 = 1.0x)

const healthFactor = await client.view({
  function: `${CONTRACT_ADDRESS}::bucket_protocol::get_position_health_factor`,
  arguments: [userAddress, positionId, leverage]
});

// Health factor interpretation:
// > 150: Safe
// 100-150: At risk
// < 100: Liquidatable
```

---

### **📡 Events**

#### **BucketCreatedEvent**
```typescript
struct BucketCreatedEvent {
  bucket_id: u64,
  owner: address,
  assets: vector<address>,
  weights: vector<u64>,
  leverage: u8
}
```

#### **PositionOpenedEvent**
```typescript
struct PositionOpenedEvent {
  position_id: u64,
  bucket_id: u64,
  owner: address,
  is_long: bool,
  margin: u64,
  entry_price: u64
}
```

#### **PositionClosedEvent**
```typescript
struct PositionClosedEvent {
  position_id: u64,
  owner: address,
  pnl: u128,       // Profit and loss amount
  is_profit: bool   // true = profit, false = loss
}
```

#### **BucketRebalancedEvent**
```typescript
struct BucketRebalancedEvent {
  bucket_id: u64,
  new_weights: vector<u64>
}
```

#### **LiquidationEvent**
```typescript
struct LiquidationEvent {
  position_id: u64,
  owner: address,
  reason: vector<u8>
}
```

---

## 💻 Integration Examples

### **Complete React Native Integration**

```typescript
// services/MovementContractService.ts
import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from 'aptos';

const CONTRACT_ADDRESS = "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796";
const NODE_URL = "https://testnet.movementnetwork.xyz/v1";

class MovementContractService {
  private client: AptosClient;
  
  constructor() {
    this.client = new AptosClient(NODE_URL);
  }
  
  // Initialize payment history
  async initializePayments(account: AptosAccount) {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::payments::initialize`,
      type_arguments: [],
      arguments: []
    };
    
    const txn = await this.client.generateTransaction(account.address(), payload);
    const signedTxn = await this.client.signTransaction(account, txn);
    const result = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(result.hash);
    
    return result;
  }
  
  // Send payment with memo
  async sendPayment(account: AptosAccount, recipient: string, amount: string, memo: string) {
    const memoBytes = Array.from(Buffer.from(memo, 'utf8'));
    
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::payments::send_payment`,
      type_arguments: [],
      arguments: [recipient, amount, memoBytes]
    };
    
    const txn = await this.client.generateTransaction(account.address(), payload);
    const signedTxn = await this.client.signTransaction(account, txn);
    const result = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(result.hash);
    
    return result;
  }
  
  // Get payment statistics
  async getPaymentStats(address: string) {
    const [sentCount, receivedCount] = await this.client.view({
      function: `${CONTRACT_ADDRESS}::payments::get_payment_count`,
      type_arguments: [],
      arguments: [address]
    });
    
    const [totalSent, totalReceived] = await this.client.view({
      function: `${CONTRACT_ADDRESS}::payments::get_total_volume`,
      type_arguments: [],
      arguments: [address]
    });
    
    return {
      sentCount: Number(sentCount),
      receivedCount: Number(receivedCount),
      totalSent: Number(totalSent) / 100000000, // Convert to APT
      totalReceived: Number(totalReceived) / 100000000
    };
  }
  
  // Schedule payment
  async schedulePayment(
    account: AptosAccount,
    recipient: string,
    amount: string,
    executionTime: number,
    interval: number = 0
  ) {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::wallet::schedule_payment`,
      type_arguments: [],
      arguments: [
        recipient,
        amount,
        executionTime.toString(),
        interval.toString()
      ]
    };
    
    const txn = await this.client.generateTransaction(account.address(), payload);
    const signedTxn = await this.client.signTransaction(account, txn);
    const result = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(result.hash);
    
    return result;
  }
  
  // Create trading bucket
  async createBucket(
    account: AptosAccount,
    assets: string[],
    weights: number[],
    leverage: number
  ) {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::bucket_protocol::create_bucket`,
      type_arguments: [],
      arguments: [
        assets,
        weights.map(w => w.toString()),
        leverage.toString()
      ]
    };
    
    const txn = await this.client.generateTransaction(account.address(), payload);
    const signedTxn = await this.client.signTransaction(account, txn);
    const result = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(result.hash);
    
    return result;
  }
  
  // Open leveraged position
  async openPosition(
    account: AptosAccount,
    bucketId: number,
    isLong: boolean,
    margin: string
  ) {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::bucket_protocol::open_position`,
      type_arguments: [],
      arguments: [
        bucketId.toString(),
        isLong,
        margin
      ]
    };
    
    const txn = await this.client.generateTransaction(account.address(), payload);
    const signedTxn = await this.client.signTransaction(account, txn);
    const result = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(result.hash);
    
    return result;
  }
  
  // Get position details
  async getPosition(userAddress: string, positionId: number) {
    const [bucketId, isLong, margin, entryPrice, owner, isActive] = 
      await this.client.view({
        function: `${CONTRACT_ADDRESS}::bucket_protocol::get_position`,
        type_arguments: [],
        arguments: [userAddress, positionId.toString()]
      });
    
    return {
      bucketId: Number(bucketId),
      isLong: Boolean(isLong),
      margin: Number(margin),
      entryPrice: Number(entryPrice),
      owner: String(owner),
      isActive: Boolean(isActive)
    };
  }
}

export default new MovementContractService();
```

---

### **React Component Example**

```typescript
// components/SendPayment.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import MovementContractService from '../services/MovementContractService';

export const SendPaymentScreen = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSend = async () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      // Get account from secure storage
      const account = await getStoredAccount();
      
      // Convert APT to smallest unit
      const amountInOctas = (parseFloat(amount) * 100000000).toString();
      
      // Send payment
      const result = await MovementContractService.sendPayment(
        account,
        recipient,
        amountInOctas,
        memo || 'Payment'
      );
      
      Alert.alert('Success', `Transaction: ${result.hash}`);
      
      // Clear form
      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View>
      <TextInput
        placeholder="Recipient Address"
        value={recipient}
        onChangeText={setRecipient}
      />
      <TextInput
        placeholder="Amount (APT)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />
      <TextInput
        placeholder="Memo (optional)"
        value={memo}
        onChangeText={setMemo}
      />
      <Button
        title={loading ? "Sending..." : "Send Payment"}
        onPress={handleSend}
        disabled={loading}
      />
    </View>
  );
};
```

---

## ⚠️ Error Codes Reference

### **Payments Module**
```
E_NOT_INITIALIZED      = 1   // Account not initialized
E_ALREADY_INITIALIZED  = 2   // Already initialized
E_INVALID_AMOUNT       = 3   // Amount must be > 0
E_INVALID_RECIPIENT    = 4   // Recipient cannot be 0x0
E_TRANSFER_FAILED      = 5   // Coin transfer failed
E_LENGTH_MISMATCH      = 6   // Arrays length mismatch (batch_send)
```

### **Wallet Module**
```
E_NOT_INITIALIZED       = 1   // Wallet not initialized
E_ALREADY_INITIALIZED   = 2   // Already initialized
E_INSUFFICIENT_BALANCE  = 3   // Not enough balance
E_INVALID_AMOUNT        = 4   // Amount must be > 0
E_UNAUTHORIZED          = 5   // Not authorized
E_PAYMENT_NOT_DUE       = 6   // Payment not yet due
E_BASKET_NOT_FOUND      = 7   // Basket does not exist
```

### **Bucket Protocol Module**
```
Standard Aptos error codes:
error::already_exists(1)      // Resource already exists
error::invalid_argument(2-9)  // Invalid parameter
error::not_found(4,6,7,10,12) // Resource not found
error::permission_denied(8,11)// Not owner
error::invalid_state(16)      // Position not active
```

---

## 🔒 Security Best Practices

### **1. Private Key Management**

```typescript
// ✅ GOOD - Use secure storage
import * as SecureStore from 'expo-secure-store';

async function savePrivateKey(key: string) {
  await SecureStore.setItemAsync('private_key', key);
}

async function getPrivateKey() {
  return await SecureStore.getItemAsync('private_key');
}

// ❌ BAD - Never do this
const PRIVATE_KEY = "0x4D0E..."; // Hardcoded
AsyncStorage.setItem('key', privateKey); // Not secure
console.log(privateKey); // Logging sensitive data
```

### **2. Amount Handling**

```typescript
// ✅ GOOD - Precise amount conversion
const aptToOctas = (apt: number): string => {
  return (apt * 100000000).toString();
};

const octasToApt = (octas: string): number => {
  return Number(octas) / 100000000;
};

// ❌ BAD - Floating point errors
const amount = "0.1" * 100000000; // Can cause precision issues
```

### **3. Transaction Validation**

```typescript
// ✅ GOOD - Validate before sending
async function sendPayment(recipient: string, amount: string) {
  // Validate address
  if (!recipient.startsWith('0x') || recipient.length !== 66) {
    throw new Error('Invalid address format');
  }
  
  // Validate amount
  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Invalid amount');
  }
  
  // Check balance
  const balance = await getBalance(userAddress);
  if (Number(balance) < amountNum) {
    throw new Error('Insufficient balance');
  }
  
  // Execute transaction
  return await MovementContractService.sendPayment(...);
}
```

### **4. Error Handling**

```typescript
// ✅ GOOD - Comprehensive error handling
async function executeTransaction() {
  try {
    const result = await contract.sendPayment(...);
    return { success: true, hash: result.hash };
  } catch (error) {
    if (error.message.includes('INSUFFICIENT_BALANCE')) {
      return { success: false, error: 'Insufficient funds' };
    } else if (error.message.includes('INVALID_RECIPIENT')) {
      return { success: false, error: 'Invalid recipient address' };
    } else {
      return { success: false, error: 'Transaction failed' };
    }
  }
}
```

---

## 📚 Additional Resources

### **Movement Network**
- Documentation: https://docs.movementlabs.xyz
- Explorer: https://explorer.movementnetwork.xyz/?network=bardock+testnet
- Faucet: https://faucet.testnet.movementnetwork.xyz
- Discord: https://discord.gg/movementlabs

### **Aptos SDK**
- NPM: `npm install aptos`
- Docs: https://aptos.dev
- TypeScript SDK: https://aptos.dev/sdks/ts-sdk

### **Testing Tools**
- Aptos CLI: https://aptos.dev/cli-tools/aptos-cli-tool/use-aptos-cli
- Movement CLI: Similar to Aptos CLI

---

## 🎯 Quick Start Checklist

- [ ] Install dependencies: `npm install aptos buffer`
- [ ] Configure network endpoints
- [ ] Store contract address: `0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796`
- [ ] Implement secure key storage
- [ ] Initialize user accounts (payments, wallet, bucket_protocol)
- [ ] Implement payment functions
- [ ] Implement scheduled payments
- [ ] Implement bucket protocol trading
- [ ] Add error handling
- [ ] Test on Movement testnet
- [ ] Get testnet tokens from faucet
- [ ] Monitor transactions on explorer

---

**🎉 You're ready to integrate Cresca smart contracts into your React Native app!**

For questions or support, refer to the contract source code in `contracts/sources/` directory.

---

**Document Version:** 1.0.0  
**Last Updated:** December 31, 2025  
**Maintainer:** Cresca Team

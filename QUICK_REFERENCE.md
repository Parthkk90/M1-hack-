# 🚀 Cresca Smart Contracts - Quick Reference

**Contract Address:** `0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796`  
**Network:** Movement Testnet  
**RPC:** `https://testnet.movementnetwork.xyz/v1`

---

## 📦 Available Modules

1. **`cresca::payments`** - Send, receive, batch payments
2. **`cresca::wallet`** - Wallet management, scheduled payments, baskets
3. **`cresca::bucket_protocol`** - Leveraged trading on asset buckets

---

## ⚡ Most Used Functions

### **Send Payment**
```typescript
Function: ${CONTRACT_ADDRESS}::payments::send_payment
Args: [recipient: address, amount: u64, memo: vector<u8>]

await sendPayment("0xabc...", "100000000", "Coffee");
```

### **Tap to Pay**
```typescript
Function: ${CONTRACT_ADDRESS}::payments::tap_to_pay
Args: [recipient: address, amount: u64]

await tapToPay("0xabc...", "100000000");
```

### **Schedule Payment**
```typescript
Function: ${CONTRACT_ADDRESS}::wallet::schedule_payment
Args: [recipient, amount, execution_time, interval]

await schedulePayment("0xabc...", "100000000", futureTimestamp, 0);
```

### **Open Trading Position**
```typescript
Function: ${CONTRACT_ADDRESS}::bucket_protocol::open_position
Args: [bucket_id, is_long, margin]

await openPosition(0, true, "500000000"); // Long position
```

---

## 🔑 Test Accounts

```typescript
const ACCOUNTS = {
  // Main contract owner
  DEPLOYER: {
    privateKey: "0x4D0EFE6773051213CA4547FEE40C37FDE71BE25D99C2E8412507A0D9CEF2BE4B",
    address: "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796"
  },
  
  // Test recipient 1
  RECIPIENT_1: {
    privateKey: "0x00C03D098B526C6672B56CDD84687B575A37F9755CC7E323258D2AF74DF40627"
  },
  
  // Test recipient 2
  RECIPIENT_2: {
    privateKey: "0xD95B7C8CBB8611E566A677CB1E1D24B318D2D003E5A6727C7AADD499392C5384"
  },
  
  // Bucket protocol test
  TRADER: {
    privateKey: "0x855F7AB6FB12535AAF661AF350B88270DB2CFE801C68AB4BEFC73B40F6599050"
  }
};
```

---

## 📊 View Functions (Read Data)

```typescript
// Check initialization
await view("${CONTRACT_ADDRESS}::payments::is_initialized", [address])

// Get payment stats
await view("${CONTRACT_ADDRESS}::payments::get_payment_count", [address])
await view("${CONTRACT_ADDRESS}::payments::get_total_volume", [address])

// Get balance
await view("${CONTRACT_ADDRESS}::wallet::get_balance", [address])

// Get trading data
await view("${CONTRACT_ADDRESS}::bucket_protocol::get_bucket_count", [address])
await view("${CONTRACT_ADDRESS}::bucket_protocol::get_active_position_ids", [address])
await view("${CONTRACT_ADDRESS}::bucket_protocol::get_position_health_factor", [address, positionId, leverage])
```

---

## 💰 Amount Conversion

```typescript
// APT to Octas (smallest unit)
const toOctas = (apt) => (apt * 100000000).toString();

// Octas to APT
const toAPT = (octas) => Number(octas) / 100000000;

// Examples
toOctas(1.5)    // "150000000"
toAPT("150000000") // 1.5
```

---

## 🛠️ Setup Code

```typescript
import { AptosClient, AptosAccount } from 'aptos';

const CONTRACT = "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796";
const NODE_URL = "https://testnet.movementnetwork.xyz/v1";

const client = new AptosClient(NODE_URL);

// Load account
const account = AptosAccount.fromAptosAccountObject({
  privateKeyHex: YOUR_PRIVATE_KEY
});

// Submit transaction
async function submitTx(functionId, args = []) {
  const payload = {
    type: "entry_function_payload",
    function: functionId,
    type_arguments: [],
    arguments: args
  };
  
  const txn = await client.generateTransaction(account.address(), payload);
  const signed = await client.signTransaction(account, txn);
  const result = await client.submitTransaction(signed);
  await client.waitForTransaction(result.hash);
  return result;
}
```

---

## 🔄 Common Workflows

### **Payment Flow**
```
1. initialize → send_payment → check stats
```

### **Scheduled Payment Flow**
```
1. initialize_wallet → schedule_payment → wait → execute_scheduled_payment
```

### **Trading Flow**
```
1. init → deposit_collateral → create_bucket → open_position → close_position
```

---

## 🌐 Network Endpoints

```typescript
const ENDPOINTS = {
  rpc: "https://testnet.movementnetwork.xyz/v1",
  faucet: "https://faucet.testnet.movementnetwork.xyz",
  explorer: "https://explorer.movementnetwork.xyz/?network=bardock+testnet",
  indexer: "https://hasura.testnet.movementnetwork.xyz/v1/graphql"
};
```

---

## ⚠️ Error Codes

```
1 = Not initialized
2 = Already initialized
3 = Invalid amount / Insufficient balance
4 = Invalid recipient
5 = Transfer failed / Unauthorized
6 = Length mismatch / Payment not due
7 = Basket not found
```

---

## 📱 React Native Integration

```typescript
import MovementContractService from './services/MovementContractService';

// Send payment
await MovementContractService.sendPayment(
  account,
  "0xrecipient...",
  "100000000",
  "Payment memo"
);

// Get stats
const stats = await MovementContractService.getPaymentStats(address);
console.log(stats.totalSent, stats.totalReceived);
```

---

## 🎯 Quick Test Script

```typescript
// Complete test flow
async function quickTest() {
  const deployer = loadAccount(DEPLOYER_KEY);
  const recipient = loadAccount(RECIPIENT_1_KEY);
  
  // Initialize
  await submitTx(`${CONTRACT}::payments::initialize`);
  
  // Send payment
  await submitTx(`${CONTRACT}::payments::send_payment`, [
    recipient.address().hex(),
    "100000000",
    Array.from(Buffer.from("Test", 'utf8'))
  ]);
  
  // Check stats
  const stats = await client.view({
    function: `${CONTRACT}::payments::get_total_volume`,
    arguments: [deployer.address().hex()]
  });
  
  console.log("Total sent:", stats[0]);
}
```

---

## 📚 Full Documentation

- **Integration Guide:** `SMART_CONTRACT_INTEGRATION_GUIDE.md`
- **Private Keys:** `TEST_ACCOUNTS_AND_KEYS.md`
- **Configuration:** `Movement_guide.md`

---

**⚡ Happy Building!**

# 🚀 Cresca Smart Contracts - Deployment Details

**Contract Deployment Documentation**  
**Network:** Movement Testnet (Aptos-based)  
**Deployment Date:** December 31, 2025  
**Status:** ✅ Deployed and Operational

---

## 📋 Table of Contents

1. [Contract Deployment Information](#contract-deployment-information)
2. [Network Configuration](#network-configuration)
3. [Deployed Modules](#deployed-modules)
4. [Integration Setup](#integration-setup)
5. [Verification Steps](#verification-steps)
6. [Testing & Usage](#testing--usage)

---

## 🎯 Contract Deployment Information

### **Main Contract Address**
```
0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796
```

### **Deployer Account**
```
Address: 0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796
Private Key: 0x4D0EFE6773051213CA4547FEE40C37FDE71BE25D99C2E8412507A0D9CEF2BE4B
```
⚠️ **Note:** This is a test account. Never use in production.

### **Deployment Configuration**

**From `Move.toml`:**
```toml
[package]
name = "cresca"
version = "1.0.0"
authors = ["Cresca Team"]

[addresses]
cresca = "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796"

[dependencies.AptosFramework]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "aptos-release-v1.8"
subdir = "aptos-move/framework/aptos-framework"
```

---

## 🌐 Network Configuration

### **Movement Testnet Details**

| Parameter | Value |
|-----------|-------|
| **Network Name** | Movement Testnet (Aptos Move) |
| **Chain ID** | `250` |
| **Network Type** | Testnet |
| **Consensus** | Aptos BFT |
| **Native Token** | APT (AptosCoin) |
| **Decimals** | 8 (1 APT = 100,000,000 Octas) |

### **RPC Endpoints**

#### **Primary RPC**
```
https://testnet.movementnetwork.xyz/v1
```

#### **Indexer (GraphQL)**
```
https://hasura.testnet.movementnetwork.xyz/v1/graphql
```

#### **Block Explorer**
```
https://explorer.movementnetwork.xyz/?network=bardock+testnet
```

#### **Faucet (Get Test Tokens)**
```
https://faucet.testnet.movementnetwork.xyz
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
    moduleName: 'cresca',
  },
  transaction: {
    maxGasAmount: 200000,
    gasUnitPrice: 100,
    coinType: '0x1::aptos_coin::AptosCoin',
    timeoutSeconds: 30,
  },
};
```

---

## 📦 Deployed Modules

### **Module 1: cresca::wallet**

**Full Module ID:**
```
0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796::wallet
```

**Source File:** `contracts/sources/wallet.move`

**Entry Functions (Write Operations):**
1. `initialize_wallet()` - Initialize wallet for user
2. `send_coins(recipient: address, amount: u64)` - Send tokens
3. `schedule_payment(recipient, amount, execution_time, interval)` - Schedule payment
4. `execute_scheduled_payment(payment_id: u64)` - Execute scheduled payment
5. `create_basket(name: vector<u8>, initial_value: u64)` - Create trading basket

**View Functions (Read Operations):**
1. `is_wallet_initialized(address): bool` - Check if wallet exists
2. `get_balance(address): u64` - Get token balance
3. `get_transaction_count(address): u64` - Get transaction count
4. `get_basket_count(address): u64` - Get basket count
5. `get_scheduled_payment_count(address): u64` - Get scheduled payment count

**Features:**
- ✅ Wallet initialization
- ✅ Token transfers with event tracking
- ✅ Scheduled payments (one-time and recurring)
- ✅ Trading baskets for perpetual positions
- ✅ Transaction history tracking

---

### **Module 2: cresca::payments**

**Full Module ID:**
```
0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796::payments
```

**Source File:** `contracts/sources/payments.move`

**Entry Functions (Write Operations):**
1. `initialize()` - Initialize payment history
2. `send_payment(recipient, amount, memo: vector<u8>)` - Send with memo
3. `tap_to_pay(recipient, amount)` - Quick send for NFC/QR
4. `batch_send(recipients: vector<address>, amounts: vector<u64>)` - Batch payments

**View Functions (Read Operations):**
1. `is_initialized(address): bool` - Check initialization
2. `get_payment_count(address): (u64, u64)` - Get sent/received counts
3. `get_total_volume(address): (u64, u64)` - Get total sent/received amounts
4. `get_sent_payments_count(address): u64` - Get sent count
5. `get_received_payments_count(address): u64` - Get received count

**Features:**
- ✅ Payment processing with memos
- ✅ Tap-to-pay functionality
- ✅ Batch payments (multiple recipients)
- ✅ Complete payment history
- ✅ Volume tracking

---

### **Module 3: cresca::bucket_protocol**

**Full Module ID:**
```
0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796::bucket_protocol
```

**Source File:** `contracts/sources/bucket_protocol.move`

**Entry Functions (Write Operations):**
1. `init()` - Initialize bucket protocol
2. `create_bucket(assets, weights, leverage: u8)` - Create asset bucket
3. `deposit_collateral(amount: u64)` - Deposit trading collateral
4. `open_position(bucket_id, is_long: bool, margin)` - Open leveraged position
5. `close_position(position_id: u64)` - Close position and realize P&L
6. `rebalance_bucket(bucket_id, new_weights)` - Update bucket weights
7. `update_oracle(prices, funding_rates)` - Update oracle prices (testing)
8. `liquidate_position(position_id, reason)` - Liquidate undercollateralized position

**View Functions (Read Operations):**
1. `get_bucket_count(address): u64` - Number of buckets
2. `get_bucket(address, bucket_id)` - Get bucket details
3. `get_all_bucket_ids(address): vector<u64>` - All bucket IDs
4. `get_position_count(address): u64` - Number of positions
5. `get_position(address, position_id)` - Get position details
6. `get_active_position_ids(address): vector<u64>` - Active positions
7. `get_collateral_balance(user, owner): u64` - Collateral amount
8. `get_oracle_prices(address): vector<u64>` - Current prices
9. `get_oracle_funding_rates(address): vector<u64>` - Funding rates
10. `get_asset_price(address, asset_index): u64` - Specific asset price
11. `get_bucket_market_value(address, bucket_id): u64` - Bucket value
12. `get_position_health_factor(address, position_id, leverage): u64` - Health factor

**Features:**
- ✅ Asset bucket creation
- ✅ Leveraged positions (1-20x)
- ✅ Long/Short positions
- ✅ P&L tracking
- ✅ Health factor monitoring
- ✅ Auto liquidation
- ✅ Oracle price feeds
- ✅ Bucket rebalancing

---

## 🔧 Integration Setup

### **Step 1: Install Dependencies**

```bash
npm install aptos buffer
```

Or with yarn:
```bash
yarn add aptos buffer
```

### **Step 2: Setup Constants**

```typescript
// constants/contracts.ts
export const CONTRACT_ADDRESS = "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796";
export const NODE_URL = "https://testnet.movementnetwork.xyz/v1";
export const EXPLORER_URL = "https://explorer.movementnetwork.xyz/?network=bardock+testnet";
export const FAUCET_URL = "https://faucet.testnet.movementnetwork.xyz";

export const MODULES = {
  WALLET: `${CONTRACT_ADDRESS}::wallet`,
  PAYMENTS: `${CONTRACT_ADDRESS}::payments`,
  BUCKET_PROTOCOL: `${CONTRACT_ADDRESS}::bucket_protocol`,
};

export const TX_CONFIG = {
  maxGasAmount: 200000,
  gasUnitPrice: 100,
  coinType: '0x1::aptos_coin::AptosCoin',
  timeoutSeconds: 30,
};
```

### **Step 3: Create Client Service**

```typescript
// services/MovementClient.ts
import { AptosClient, AptosAccount } from 'aptos';
import { CONTRACT_ADDRESS, NODE_URL, MODULES } from '../constants/contracts';

class MovementClient {
  private client: AptosClient;
  
  constructor() {
    this.client = new AptosClient(NODE_URL);
  }
  
  // Initialize wallet
  async initializeWallet(account: AptosAccount) {
    return await this.submitTransaction(account, {
      function: `${MODULES.WALLET}::initialize_wallet`,
      arguments: []
    });
  }
  
  // Send coins
  async sendCoins(account: AptosAccount, recipient: string, amount: string) {
    return await this.submitTransaction(account, {
      function: `${MODULES.WALLET}::send_coins`,
      arguments: [recipient, amount]
    });
  }
  
  // Get balance
  async getBalance(address: string): Promise<number> {
    const [balance] = await this.client.view({
      function: `${MODULES.WALLET}::get_balance`,
      type_arguments: [],
      arguments: [address]
    });
    return Number(balance) / 100000000; // Convert to APT
  }
  
  // Generic transaction submission
  private async submitTransaction(account: AptosAccount, payload: any) {
    const fullPayload = {
      type: "entry_function_payload",
      function: payload.function,
      type_arguments: [],
      arguments: payload.arguments
    };
    
    const txn = await this.client.generateTransaction(account.address(), fullPayload);
    const signed = await this.client.signTransaction(account, txn);
    const result = await this.client.submitTransaction(signed);
    await this.client.waitForTransaction(result.hash);
    
    return result;
  }
  
  // View function helper
  async viewFunction(functionId: string, args: any[] = []) {
    return await this.client.view({
      function: functionId,
      type_arguments: [],
      arguments: args
    });
  }
}

export default new MovementClient();
```

### **Step 4: Load Account**

```typescript
// utils/account.ts
import { AptosAccount } from 'aptos';
import * as SecureStore from 'expo-secure-store';

// Load from secure storage
export async function loadAccount(): Promise<AptosAccount | null> {
  const privateKey = await SecureStore.getItemAsync('private_key');
  if (!privateKey) return null;
  
  return AptosAccount.fromAptosAccountObject({
    privateKeyHex: privateKey
  });
}

// Create new account
export function createAccount(): AptosAccount {
  return new AptosAccount();
}

// Save account
export async function saveAccount(account: AptosAccount): Promise<void> {
  const privateKey = account.toPrivateKeyObject().privateKeyHex;
  await SecureStore.setItemAsync('private_key', privateKey);
}

// Get address
export async function getAddress(): Promise<string | null> {
  const account = await loadAccount();
  return account ? account.address().hex() : null;
}
```

---

## ✅ Verification Steps

### **1. Verify Contract Deployment**

```typescript
import { AptosClient } from 'aptos';

const client = new AptosClient('https://testnet.movementnetwork.xyz/v1');
const contractAddress = '0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796';

async function verifyDeployment() {
  try {
    // Check account exists
    const account = await client.getAccount(contractAddress);
    console.log('✅ Contract account exists');
    console.log('Sequence number:', account.sequence_number);
    
    // Get deployed modules
    const modules = await client.getAccountModules(contractAddress);
    console.log('✅ Deployed modules:');
    modules.forEach(module => {
      console.log(`  - ${module.abi.name}`);
    });
    
    // Verify expected modules
    const moduleNames = modules.map(m => m.abi.name);
    const expectedModules = ['wallet', 'payments', 'bucket_protocol'];
    
    expectedModules.forEach(name => {
      if (moduleNames.includes(name)) {
        console.log(`✅ Module '${name}' is deployed`);
      } else {
        console.log(`❌ Module '${name}' is MISSING`);
      }
    });
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyDeployment();
```

### **2. Test View Functions**

```typescript
async function testViewFunctions() {
  const client = new AptosClient('https://testnet.movementnetwork.xyz/v1');
  const contract = '0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796';
  const testAddress = '0x1'; // Test with any address
  
  try {
    // Test wallet module
    const [isInitialized] = await client.view({
      function: `${contract}::wallet::is_wallet_initialized`,
      type_arguments: [],
      arguments: [testAddress]
    });
    console.log('✅ wallet::is_wallet_initialized works:', isInitialized);
    
    // Test payments module
    const [paymentCount] = await client.view({
      function: `${contract}::payments::is_initialized`,
      type_arguments: [],
      arguments: [testAddress]
    });
    console.log('✅ payments::is_initialized works:', paymentCount);
    
    // Test bucket protocol module
    const [bucketCount] = await client.view({
      function: `${contract}::bucket_protocol::get_bucket_count`,
      type_arguments: [],
      arguments: [testAddress]
    });
    console.log('✅ bucket_protocol::get_bucket_count works:', bucketCount);
    
    console.log('✅ All view functions are working!');
    
  } catch (error) {
    console.error('❌ View function test failed:', error);
  }
}

testViewFunctions();
```

### **3. Verify on Explorer**

Visit the Block Explorer:
```
https://explorer.movementnetwork.xyz/?network=bardock+testnet
```

Search for contract address:
```
0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796
```

**What to check:**
- ✅ Account exists
- ✅ Modules tab shows 3 modules
- ✅ Resources are visible
- ✅ Transaction history shows deployment

---

## 🧪 Testing & Usage

### **Complete Integration Test**

```typescript
import { AptosClient, AptosAccount } from 'aptos';
import { Buffer } from 'buffer';

const CONTRACT = '0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796';
const NODE_URL = 'https://testnet.movementnetwork.xyz/v1';

async function fullIntegrationTest() {
  const client = new AptosClient(NODE_URL);
  
  // 1. Create test account
  const account = new AptosAccount();
  console.log('Test Address:', account.address().hex());
  
  // 2. Fund from faucet (manual step)
  console.log('Please fund this address from faucet:');
  console.log('https://faucet.testnet.movementnetwork.xyz');
  console.log('Waiting 30 seconds...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // 3. Initialize wallet
  console.log('\n📝 Initializing wallet...');
  const initPayload = {
    type: "entry_function_payload",
    function: `${CONTRACT}::wallet::initialize_wallet`,
    type_arguments: [],
    arguments: []
  };
  
  let txn = await client.generateTransaction(account.address(), initPayload);
  let signed = await client.signTransaction(account, txn);
  let result = await client.submitTransaction(signed);
  await client.waitForTransaction(result.hash);
  console.log('✅ Wallet initialized:', result.hash);
  
  // 4. Check balance
  console.log('\n💰 Checking balance...');
  const [balance] = await client.view({
    function: `${CONTRACT}::wallet::get_balance`,
    type_arguments: [],
    arguments: [account.address().hex()]
  });
  console.log('Balance:', Number(balance) / 100000000, 'APT');
  
  // 5. Send coins to another address
  console.log('\n💸 Sending coins...');
  const recipient = '0x1'; // Send to 0x1 for testing
  const sendPayload = {
    type: "entry_function_payload",
    function: `${CONTRACT}::wallet::send_coins`,
    type_arguments: [],
    arguments: [recipient, '10000000'] // 0.1 APT
  };
  
  txn = await client.generateTransaction(account.address(), sendPayload);
  signed = await client.signTransaction(account, txn);
  result = await client.submitTransaction(signed);
  await client.waitForTransaction(result.hash);
  console.log('✅ Coins sent:', result.hash);
  
  // 6. Get transaction count
  console.log('\n📊 Getting transaction count...');
  const [txCount] = await client.view({
    function: `${CONTRACT}::wallet::get_transaction_count`,
    type_arguments: [],
    arguments: [account.address().hex()]
  });
  console.log('Transaction count:', txCount);
  
  // 7. Initialize payment history
  console.log('\n📝 Initializing payment history...');
  const initPaymentPayload = {
    type: "entry_function_payload",
    function: `${CONTRACT}::payments::initialize`,
    type_arguments: [],
    arguments: []
  };
  
  txn = await client.generateTransaction(account.address(), initPaymentPayload);
  signed = await client.signTransaction(account, txn);
  result = await client.submitTransaction(signed);
  await client.waitForTransaction(result.hash);
  console.log('✅ Payment history initialized:', result.hash);
  
  // 8. Send payment with memo
  console.log('\n💬 Sending payment with memo...');
  const memo = Array.from(Buffer.from('Test payment', 'utf8'));
  const paymentPayload = {
    type: "entry_function_payload",
    function: `${CONTRACT}::payments::send_payment`,
    type_arguments: [],
    arguments: [recipient, '5000000', memo] // 0.05 APT
  };
  
  txn = await client.generateTransaction(account.address(), paymentPayload);
  signed = await client.signTransaction(account, txn);
  result = await client.submitTransaction(signed);
  await client.waitForTransaction(result.hash);
  console.log('✅ Payment with memo sent:', result.hash);
  
  // 9. Get payment stats
  console.log('\n📈 Getting payment stats...');
  const [sentCount, receivedCount] = await client.view({
    function: `${CONTRACT}::payments::get_payment_count`,
    type_arguments: [],
    arguments: [account.address().hex()]
  });
  console.log('Sent:', sentCount, 'Received:', receivedCount);
  
  console.log('\n✅ Integration test completed successfully!');
  console.log('\nTest Account Details:');
  console.log('Address:', account.address().hex());
  console.log('Private Key:', account.toPrivateKeyObject().privateKeyHex);
}

fullIntegrationTest().catch(console.error);
```

### **Test with Aptos CLI**

```bash
# Set profile
aptos init --profile cresca-test \
  --private-key YOUR_PRIVATE_KEY \
  --rest-url https://testnet.movementnetwork.xyz/v1

# Initialize wallet
aptos move run \
  --profile cresca-test \
  --function-id 0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796::wallet::initialize_wallet

# Send coins
aptos move run \
  --profile cresca-test \
  --function-id 0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796::wallet::send_coins \
  --args address:0x1 u64:10000000

# Check balance
aptos move view \
  --function-id 0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796::wallet::get_balance \
  --args address:YOUR_ADDRESS \
  --url https://testnet.movementnetwork.xyz/v1
```

---

## 🔗 Quick Links

### **Blockchain Resources**
- 🌐 **RPC:** https://testnet.movementnetwork.xyz/v1
- 🔍 **Explorer:** https://explorer.movementnetwork.xyz/?network=bardock+testnet
- 💧 **Faucet:** https://faucet.testnet.movementnetwork.xyz
- 📊 **Indexer:** https://hasura.testnet.movementnetwork.xyz/v1/graphql

### **Contract Resources**
- 📜 **Contract Address:** `0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796`
- 📁 **Source Code:** `contracts/sources/`
- 📚 **Integration Guide:** `SMART_CONTRACT_INTEGRATION_GUIDE.md`
- 🔑 **Test Keys:** `TEST_ACCOUNTS_AND_KEYS.md`
- ⚡ **Quick Reference:** `QUICK_REFERENCE.md`

### **Movement Network**
- 📖 **Documentation:** https://docs.movementlabs.xyz
- 💬 **Discord:** https://discord.gg/movementlabs
- 🐦 **Twitter:** https://twitter.com/movementlabsxyz

---

## 📊 Deployment Summary

### **Modules Deployed**

| Module | Functions | Features |
|--------|-----------|----------|
| **wallet** | 10 (5 write, 5 read) | Wallet management, scheduled payments, baskets |
| **payments** | 9 (4 write, 5 read) | Payments, batch send, tap-to-pay |
| **bucket_protocol** | 20 (8 write, 12 read) | Leveraged trading, positions, liquidations |

### **Key Features**

✅ **Payment System**
- Individual payments with memos
- Batch payments
- Tap-to-pay (NFC/QR)
- Payment history tracking

✅ **Scheduled Payments**
- One-time scheduled payments
- Recurring payments
- Automatic execution

✅ **Trading Protocol**
- Asset bucket creation
- Leveraged positions (1-20x)
- Long/Short positions
- P&L tracking
- Auto liquidation
- Health factor monitoring

---

## 🎯 Next Steps

1. ✅ **Contract deployed** - Complete
2. ✅ **Modules verified** - Complete
3. ⏭️ **Integrate into React Native app**
4. ⏭️ **Test all features**
5. ⏭️ **Deploy to production** (with new keys!)

---

## ⚠️ Important Notes

### **Security**
- 🔐 Never commit private keys to git
- 🔐 Use SecureStore for key storage in production
- 🔐 Generate new keys for mainnet deployment
- 🔐 Test all functions thoroughly before production

### **Testing**
- 🧪 All modules tested and working
- 🧪 View functions verified
- 🧪 Entry functions tested with test accounts
- 🧪 Events emitting correctly

### **Gas & Costs**
- ⛽ Average transaction: ~50,000 - 200,000 gas units
- ⛽ Gas price: 100 per unit
- ⛽ Typical cost: 0.005 - 0.02 APT per transaction

---

## 📞 Support

For issues or questions:
1. Check the integration guide: `SMART_CONTRACT_INTEGRATION_GUIDE.md`
2. Review test accounts: `TEST_ACCOUNTS_AND_KEYS.md`
3. See quick reference: `QUICK_REFERENCE.md`
4. Check contract source: `contracts/sources/`

---

**✅ Deployment Complete!**

**Contract:** `0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796`  
**Network:** Movement Testnet  
**Status:** Operational  
**Ready for Integration:** YES 🚀

---

**Document Version:** 1.0.0  
**Last Updated:** January 3, 2026  
**Deployment Date:** December 31, 2025

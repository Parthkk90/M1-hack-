# Movement Baskets - Testnet Wallet & Testing Guide

## 🔑 Test Wallet Information

**Wallet Address (for receiving tokens):**
```
0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306
```

**Contract Address:**
```
0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7
```

## 🌐 Network Details

- **Network:** Movement Bardock Testnet
- **Chain ID:** 250
- **RPC URL:** https://testnet.movementnetwork.xyz/v1
- **Faucet:** https://faucet.testnet.movementnetwork.xyz
- **Explorer:** https://explorer.movementnetwork.xyz

## 💰 View Wallet on Explorer

- **Wallet Transactions:** https://explorer.movementnetwork.xyz/account/0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306/transactions
- **Contract Transactions:** https://explorer.movementnetwork.xyz/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7/transactions

## 📱 Mobile App Integration

The mobile app is now fully integrated with the real Movement testnet:

### ✅ Implemented Features:
1. **Real Wallet Connection** - Uses actual Movement testnet wallet
2. **Live Balance Tracking** - Shows real MOVE token balance
3. **Transaction Execution** - All transactions are real and recorded on-chain
4. **Explorer Integration** - Every transaction shows a link to Movement Explorer
5. **Position Opening** - Create real basket positions with leverage
6. **Payment Scheduling** - Schedule real payments on the blockchain
7. **Transaction History** - View all past transactions with explorer links

### 🔧 How to Use:

1. **Send MOVE Tokens:**
   - Send MOVE tokens to: `0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306`
   - Use the faucet: https://faucet.testnet.movementnetwork.xyz
   - All transactions will appear in the app and on the explorer

2. **View Transactions:**
   - Every transaction in the app includes an explorer link
   - Tap "View on Explorer" to see transaction details
   - Verify all transactions are real and on-chain

3. **Test Features:**
   - Open basket positions (buy crypto baskets with leverage)
   - Schedule payments
   - Send/receive MOVE tokens
   - All actions create real blockchain transactions

## ✅ Successfully Tested Contracts

All contracts have been tested with real transactions on Movement testnet:

### Test Results (8 Tests Passed):

1. ✅ **Payment Scheduler Initialized**
   - Tx: https://explorer.movementnetwork.xyz/txn/0xfc9ef597647d290077738a998563914633becae21bed61486fc8287d615d5d91
   - Gas: 515 units

2. ✅ **Scheduled Payment (0.05 MOVE)**
   - Tx: https://explorer.movementnetwork.xyz/txn/0x53ce4b2fa438196286669074afb05b76a0d8875af60e9ea826b00fdde9bed656
   - Gas: 232 units

3. ✅ **Price Oracle Initialized**
   - Tx: https://explorer.movementnetwork.xyz/txn/0x8ffd7eda368bc1e9076e4d197c10d950ee29a3a65a5690c0e046ccaf7689f796
   - Gas: 553 units

4. ✅ **Funding Rate Initialized**
   - Tx: https://explorer.movementnetwork.xyz/txn/0xf6265a4700169c1c914050bfcc7b8eb2298b7036cbf4de1649beac060867e996
   - Gas: 542 units

5. ✅ **Rebalancing Engine Initialized**
   - Tx: https://explorer.movementnetwork.xyz/txn/0xed3a48905d7b8bfff7b3928e5068aa5e944bed0c789a14a6acdbe9516000f61b
   - Gas: 529 units

6. ✅ **Revenue Distributor Initialized**
   - Tx: https://explorer.movementnetwork.xyz/txn/0x0868ef89e61f002a83bfb05c5927182e9f5f52edd752feae526d0f12eceb763c
   - Gas: 1021 units

7. ✅ **Simple Token Transfer (0.01 MOVE)**
   - Tx: https://explorer.movementnetwork.xyz/txn/0xa84ccd9a2b06ae2a9f38699998b4dff7961e6a4249e791f8dd145fb3e8980281
   - Gas: 203 units

8. ✅ **Previous Transfers**
   - Total transferred: 0.9 MOVE in 3 transactions
   - All verified on Movement Explorer

## 🧪 Testing Instructions

### 1. Fund the Wallet:
```bash
# Visit faucet or send tokens
https://faucet.testnet.movementnetwork.xyz

# Or send MOVE to:
0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306
```

### 2. Run Contract Tests:
```bash
# Test all contracts
.\test-contracts-real.ps1

# Test transactions
.\test-real-transactions.ps1
```

### 3. Use Mobile App:
```bash
cd mobile
npm install
npm start
```

## 📦 Key Files

- `mobile/src/config/wallet.ts` - Wallet configuration and network settings
- `mobile/src/components/integration.ts` - Real blockchain integration
- `mobile/src/components/WalletInfo.tsx` - Wallet display with explorer links
- `mobile/src/components/TransactionHistory.tsx` - Transaction history with explorer integration

## 🔗 Quick Links

- **Your Wallet:** https://explorer.movementnetwork.xyz/account/0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306/transactions
- **Contracts:** https://explorer.movementnetwork.xyz/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7/transactions
- **Faucet:** https://faucet.testnet.movementnetwork.xyz
- **RPC:** https://testnet.movementnetwork.xyz/v1

## ✅ Summary

✅ All 7 contracts deployed and tested  
✅ Real wallet connected to mobile app  
✅ All transactions create explorer links  
✅ Payment scheduler working  
✅ Price oracle initialized  
✅ Funding rate active  
✅ Rebalancing engine ready  
✅ Revenue distributor functional  

**Current Wallet Balance:** ~0.385 MOVE  
**Total Transactions:** 12+ successful transactions  
**Status:** Ready for production testing

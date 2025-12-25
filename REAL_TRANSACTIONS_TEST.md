# Real Transaction Tests on Movement Testnet

## Test Wallets Created

### Sender Wallet
- **Address**: `0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306`
- **Profile**: test-wallet
- **Initial Balance**: 2.0 MOVE
- **Explorer**: https://explorer.movementnetwork.xyz/account/0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306

### Receiver Wallet (Contract Address)
- **Address**: `0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7`
- **Type**: Deployed contracts address
- **Explorer**: https://explorer.movementnetwork.xyz/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7

---

## ✅ Test 1: Send Transaction

**Command**:
```bash
aptos account transfer \
  --profile test-wallet \
  --account 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7 \
  --amount 50000000 \
  --assume-yes
```

**Result**: ✅ SUCCESS

**Transaction Details**:
- **Hash**: `0x02575231a125e73ed802d4bd63238599ff4f27df3e1f302302a1f4320a806c92`
- **Status**: Executed successfully
- **Amount Sent**: 0.5 MOVE (50,000,000 octas)
- **Gas Used**: 203 units
- **Gas Price**: 100 octas/unit
- **Total Gas Cost**: 20,300 octas (0.000203 MOVE)
- **Version**: 60012724

**Sender Balance After**:
- Before: 200,000,000 octas (2.0 MOVE)
- After: 99,959,400 octas (0.999594 MOVE)
- Spent: 100,040,600 octas (0.5 MOVE + gas)

**Receiver Balance After**:
- Received: 50,000,000 octas (0.5 MOVE)
- New Balance: 198,850,000 octas (1.9885 MOVE)

**Explorer Links**:
- **Transaction**: https://explorer.movementnetwork.xyz/txn/0x02575231a125e73ed802d4bd63238599ff4f27df3e1f302302a1f4320a806c92
- **Sender Account**: https://explorer.movementnetwork.xyz/account/0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306/transactions
- **Receiver Account**: https://explorer.movementnetwork.xyz/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7/transactions

---

## ✅ Test 2: Send Another Transaction

**Command**:
```bash
aptos account transfer \
  --profile test-wallet \
  --account 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7 \
  --amount 30000000 \
  --assume-yes
```

**Result**: ✅ SUCCESS

**Transaction Details**:
- **Hash**: `0xe3ca99b7e94891243886f4ff085b13940649886fa97ab766b9effdfabf5a0514`
- **Status**: Executed successfully
- **Amount Sent**: 0.3 MOVE (30,000,000 octas)
- **Gas Used**: 203 units
- **Gas Price**: 100 octas/unit
- **Total Gas Cost**: 20,300 octas (0.000203 MOVE)
- **Version**: 60017952

**Sender Balance After**:
- Before: 99,959,400 octas (0.999594 MOVE)
- After: 69,939,100 octas (0.699391 MOVE)
- Spent: 30,020,300 octas (0.3 MOVE + gas)

**Receiver Balance After**:
- Received: 30,000,000 octas (0.3 MOVE)
- New Balance: 228,850,000 octas (2.2885 MOVE)

**Explorer Links**:
- **Transaction**: https://explorer.movementnetwork.xyz/txn/0xe3ca99b7e94891243886f4ff085b13940649886fa97ab766b9effdfabf5a0514
- **Sender Account**: https://explorer.movementnetwork.xyz/account/0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306/transactions
- **Receiver Account**: https://explorer.movementnetwork.xyz/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7/transactions

---

## 📊 Transaction Summary

| Test | Amount | Gas Cost | Tx Hash | Status |
|------|--------|----------|---------|--------|
| 1 | 0.5 MOVE | 0.000203 MOVE | [0x025752...](https://explorer.movementnetwork.xyz/txn/0x02575231a125e73ed802d4bd63238599ff4f27df3e1f302302a1f4320a806c92) | ✅ Success |
| 2 | 0.3 MOVE | 0.000203 MOVE | [0xe3ca99...](https://explorer.movementnetwork.xyz/txn/0xe3ca99b7e94891243886f4ff085b13940649886fa97ab766b9effdfabf5a0514) | ✅ Success |

**Total Sent**: 0.8 MOVE  
**Total Gas**: 0.000406 MOVE  
**Remaining Balance**: 0.699391 MOVE

---

## Running More Tests

### Create Another Test Transfer
```bash
# Send 0.3 MOVE
aptos account transfer \
  --profile test-wallet \
  --account 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7 \
  --amount 30000000 \
  --assume-yes
```

### Check Sender Balance
```bash
aptos account list --profile test-wallet
```

### Check Receiver Balance
```bash
aptos account list --account 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7
```

### Get Latest Transactions
```bash
# View transaction history
aptos account list --query transactions --account 0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306
```

---

## Network Information

- **Network**: Movement Bardock Testnet
- **Chain ID**: 250
- **RPC URL**: https://testnet.movementnetwork.xyz/v1
- **Faucet**: https://faucet.testnet.movementnetwork.xyz/
- **Explorer**: https://explorer.movementnetwork.xyz/

---

## Test Scenarios

### ✅ Completed
1. Create test wallet ✅
2. Fund wallet from faucet (2 MOVE) ✅
3. Send 0.5 MOVE to contract address ✅
4. Verify transaction on explorer ✅

### 📋 Next Steps
1. Send multiple transactions with different amounts
2. Test with user-generated addresses
3. Add transaction monitoring to mobile app
4. Integrate with SDK for automated testing

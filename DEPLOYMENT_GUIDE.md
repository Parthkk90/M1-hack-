# ===============================================
# Cresca Payments - Deployment Summary
# Movement Testnet (Bardock) - Chain ID: 250
# ===============================================

## 📝 Contract Information

**Contract Name**: Cresca Payments
**Module Name**: `cresca::payments`
**Network**: Movement Testnet (Bardock)
**Chain ID**: 250

## 🔗 Movement Network Endpoints

```
RPC URL: https://testnet.movementnetwork.xyz/v1
Faucet: https://faucet.testnet.movementnetwork.xyz
Explorer: https://explorer.movementnetwork.xyz/?network=bardock+testnet
Indexer: https://hasura.testnet.movementnetwork.xyz/v1/graphql
```

## 📋 Deployment Steps

### Step 1: Install Aptos CLI
```bash
# Windows
# Download from: https://github.com/aptos-labs/aptos-core/releases
# Or use chocolatey: choco install aptos

# Linux/Mac
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

### Step 2: Initialize Account
```bash
aptos init --profile movement-testnet \
  --network custom \
  --rest-url https://testnet.movementnetwork.xyz/v1 \
  --skip-faucet
```

This will generate:
- Private key
- Public key
- Account address

**Save these securely!**

### Step 3: Fund Account
```bash
# Get your account address from step 2
aptos account fund-with-faucet \
  --profile movement-testnet \
  --faucet-url https://faucet.testnet.movementnetwork.xyz \
  --account <YOUR_ADDRESS> \
  --amount 100000000
```

Or use the web faucet: https://faucet.movementnetwork.xyz

### Step 4: Compile Contract
```bash
cd contracts
aptos move compile --named-addresses cresca=<YOUR_ADDRESS>
```

### Step 5: Deploy Contract
```bash
aptos move publish \
  --profile movement-testnet \
  --named-addresses cresca=<YOUR_ADDRESS> \
  --assume-yes
```

### Step 6: Update App Configuration

Edit `src/core/config/app.config.ts`:

```typescript
export const AppConfig = {
  appName: 'Cresca Wallet',
  appVersion: '1.0.0',
  
  movementNetwork: {
    url: 'https://testnet.movementnetwork.xyz/v1',
    faucetUrl: 'https://faucet.testnet.movementnetwork.xyz',
    explorerUrl: 'https://explorer.movementnetwork.xyz/?network=bardock+testnet',
    indexerUrl: 'https://hasura.testnet.movementnetwork.xyz/v1/graphql',
    chainId: '250',
  },
  
  contract: {
    address: '<YOUR_DEPLOYED_ADDRESS>',
    moduleName: 'cresca::payments',
  },
};
```

## 🎯 Contract Functions

### Entry Functions (Write Operations)

1. **initialize()**
   - Initialize payment history for an account
   - Call once per account

2. **send_payment(recipient: address, amount: u64, memo: vector<u8>)**
   - Send payment with memo
   - `amount` in Octas (1 MOVE = 100,000,000 Octas)

3. **tap_to_pay(recipient: address, amount: u64)**
   - Quick send without memo
   - For NFC/QR code payments

4. **batch_send(recipients: vector<address>, amounts: vector<u64>)**
   - Send to multiple recipients at once
   - Arrays must be same length

### View Functions (Read Operations)

1. **is_initialized(addr: address): bool**
   - Check if account has payment history

2. **get_payment_count(addr: address): (u64, u64)**
   - Returns (sent_count, received_count)

3. **get_total_volume(addr: address): (u64, u64)**
   - Returns (total_sent, total_received)

4. **get_sent_payments_count(addr: address): u64**
   - Get number of sent payments

5. **get_received_payments_count(addr: address): u64**
   - Get number of received payments

## 🧪 Testing the Contract

### Test Initialize
```bash
aptos move run \
  --profile movement-testnet \
  --function-id <YOUR_ADDRESS>::payments::initialize \
  --assume-yes
```

### Test Send Payment
```bash
aptos move run \
  --profile movement-testnet \
  --function-id <YOUR_ADDRESS>::payments::send_payment \
  --args address:<RECIPIENT_ADDRESS> u64:1000000 "string:Hello from Cresca!" \
  --assume-yes
```

### Test Tap to Pay
```bash
aptos move run \
  --profile movement-testnet \
  --function-id <YOUR_ADDRESS>::payments::tap_to_pay \
  --args address:<RECIPIENT_ADDRESS> u64:500000 \
  --assume-yes
```

### View Payment Count
```bash
aptos move view \
  --profile movement-testnet \
  --function-id <YOUR_ADDRESS>::payments::get_payment_count \
  --args address:<ACCOUNT_ADDRESS>
```

## 📱 Integration with React Native App

### 1. Install Dependencies
```bash
npm install
```

### 2. Update Contract Address
Update the address in `src/core/config/app.config.ts` with your deployed contract address.

### 3. Run the App
```bash
# Android
npm run android

# iOS
npm run ios
```

## 🔍 Verify Deployment

Visit Explorer: `https://explorer.movementnetwork.xyz/account/<YOUR_ADDRESS>?network=bardock+testnet`

You should see:
- Account balance
- Deployed modules (cresca::payments)
- Transaction history

## 💡 Tips

1. **Save Your Private Key**: Never share or commit it to Git
2. **Test on Testnet First**: Always test before mainnet deployment
3. **Check Balance**: Ensure you have enough MOVE for gas fees
4. **Monitor Transactions**: Use the explorer to track deployments
5. **Use Faucet Wisely**: Testnet faucets have rate limits

## 🆘 Troubleshooting

### "Compilation Failed: Unresolved addresses"
- Ensure you're using `--named-addresses cresca=<YOUR_ADDRESS>`

### "Account doesn't exist"
- Fund your account from the faucet first

### "Insufficient gas"
- Request more tokens from faucet

### "Module already exists"
- If redeploying, increment version or use a new account

## 📚 Resources

- Movement Network Docs: https://docs.movementnetwork.xyz
- Aptos Move Language: https://aptos.dev/move/move-on-aptos
- Movement Explorer: https://explorer.movementnetwork.xyz
- Movement Faucet: https://faucet.movementnetwork.xyz

## ✅ Deployment Checklist

- [ ] Aptos CLI installed
- [ ] Account created and funded
- [ ] Contract compiled successfully
- [ ] Contract deployed to testnet
- [ ] Contract address updated in app config
- [ ] Contract functions tested
- [ ] Deployment verified on explorer
- [ ] React Native app configured
- [ ] App tested with contract

---

**Contract Ready for Deployment!** 🚀

Follow the steps above to deploy your Cresca Payments contract to Movement Testnet.

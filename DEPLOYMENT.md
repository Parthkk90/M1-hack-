# cresca Wallet - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Aptos CLI installed**
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Node.js >= 18**
3. **Movement Network Testnet access**

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

Run the deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Compile the smart contract
2. Set up Movement Network configuration
3. Fund your account from the faucet
4. Deploy the contract to Movement testnet
5. Save deployment information

### Option 2: Manual Deployment

#### 1. Initialize Aptos Account

```bash
aptos init --network custom \
  --rest-url https://aptos.testnet.porto.movementlabs.xyz/v1 \
  --faucet-url https://faucet.testnet.porto.movementlabs.xyz
```

Follow the prompts to create a new account or import an existing one.

#### 2. Get Your Account Address

```bash
aptos account list
```

Note your account address (0x...).

#### 3. Fund Your Account

```bash
aptos account fund-with-faucet --account <YOUR_ADDRESS> \
  --faucet-url https://faucet.testnet.porto.movementlabs.xyz \
  --amount 100000000
```

#### 4. Compile the Contract

```bash
cd contracts
aptos move compile
```

Check for any compilation errors. If successful, you should see "Success" message.

#### 5. Deploy the Contract

```bash
aptos move publish --named-addresses cresca=<YOUR_ADDRESS>
```

Confirm the deployment when prompted.

#### 6. Verify Deployment

Visit the Movement Explorer:
```
https://explorer.movementlabs.xyz/account/<YOUR_ADDRESS>
```

You should see your deployed module: `cresca::wallet`

### Post-Deployment Configuration

After successful deployment:

1. **Update App Configuration**

   Edit `src/core/config/app.config.ts`:

   ```typescript
   contract: {
     address: '<YOUR_DEPLOYED_ADDRESS>',
     moduleName: 'cresca::wallet',
   }
   ```

2. **Test the Deployment**

   You can test the contract functions using Aptos CLI:

   ```bash
   # Initialize wallet
   aptos move run \
     --function-id <YOUR_ADDRESS>::wallet::initialize_wallet \
     --assume-yes

   # Check if wallet is initialized
   aptos move view \
     --function-id <YOUR_ADDRESS>::wallet::is_wallet_initialized \
     --args address:<YOUR_ADDRESS>
   ```

3. **Build and Test Mobile App**

   ```bash
   npm install
   npm run android  # or npm run ios
   ```

## Troubleshooting

### Issue: "Account not found"
**Solution**: Fund your account from the faucet first.

### Issue: "Compilation errors"
**Solution**: Check Move.toml dependencies and ensure code is valid.

### Issue: "Insufficient gas"
**Solution**: Fund your account with more tokens.

### Issue: "Module already exists"
**Solution**: Either use a new account or upgrade the existing module.

## Movement Network Testnet Details

- **RPC URL**: https://aptos.testnet.porto.movementlabs.xyz/v1
- **Faucet**: https://faucet.testnet.porto.movementlabs.xyz
- **Explorer**: https://explorer.movementlabs.xyz
- **Chain ID**: 177

## Contract Functions

After deployment, your contract will have these functions:

- `initialize_wallet()` - Initialize wallet on-chain
- `send_coins(recipient, amount)` - Send coins to recipient
- `schedule_payment(recipient, amount, time, interval)` - Schedule a payment
- `execute_scheduled_payment(payment_id)` - Execute scheduled payment
- `create_basket(name, initial_value)` - Create a basket
- `get_balance(address)` - View function to get balance
- `is_wallet_initialized(address)` - Check if wallet is initialized

## Security Notes

1. **Never share your private key or mnemonic**
2. **Store deployment info securely**
3. **Test thoroughly on testnet before mainnet**
4. **Keep your Aptos CLI configuration secure**

## Next Steps

After deployment:

1. Test all wallet functions
2. Test scheduled payments
3. Test basket creation
4. Integrate with mobile app
5. Perform security audit
6. Deploy to mainnet when ready

## Support

For issues:
- Check Movement Network documentation
- Review Aptos Move documentation
- Open GitHub issue
- Contact development team

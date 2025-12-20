// API Service for Cresca Basket DeFi
import express from 'express';
import cors from 'cors';
import * as sdk from './sdk';
import { Account } from "@aptos-labs/ts-sdk";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store admin account (in production, use secure key management)
let adminAccount: Account;
let userAccounts: Map<string, Account> = new Map();

// Initialize admin account on startup
async function initializeServer() {
  try {
    adminAccount = sdk.createAccount();
    await sdk.fundAccount(adminAccount);
    console.log(`Admin account created: ${adminAccount.accountAddress.toString()}`);
    
    // Initialize contracts
    await sdk.initializeVault(adminAccount);
    await sdk.initializeOracle(adminAccount);
    console.log('Contracts initialized successfully');
  } catch (error) {
    console.error('Server initialization error:', error);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cresca Basket API is running' });
});

// Get oracle prices
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await sdk.getOraclePrices(sdk.ORACLE_ADDRESS);
    res.json({
      success: true,
      data: {
        btc: (Number(prices.btcPrice) / 100000000).toFixed(2),
        eth: (Number(prices.ethPrice) / 100000000).toFixed(2),
        sol: (Number(prices.solPrice) / 100000000).toFixed(2),
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new user account
app.post('/api/account/create', async (req, res) => {
  try {
    const account = sdk.createAccount();
    await sdk.fundAccount(account);
    
    const accountId = account.accountAddress.toString();
    userAccounts.set(accountId, account);
    
    res.json({
      success: true,
      data: {
        accountAddress: accountId,
        message: 'Account created and funded'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Open basket position
app.post('/api/position/open', async (req, res) => {
  try {
    const { 
      accountAddress, 
      collateralAmount, 
      leverageMultiplier, 
      btcWeight, 
      ethWeight, 
      solWeight 
    } = req.body;

    // Validate input
    if (!accountAddress || !collateralAmount || !leverageMultiplier) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const account = userAccounts.get(accountAddress);
    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: 'Account not found. Create an account first.' 
      });
    }

    const result = await sdk.openPosition(
      account,
      Number(collateralAmount),
      Number(leverageMultiplier),
      Number(btcWeight),
      Number(ethWeight),
      Number(solWeight)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Close basket position
app.post('/api/position/close', async (req, res) => {
  try {
    const { accountAddress, positionId } = req.body;

    if (!accountAddress || positionId === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const account = userAccounts.get(accountAddress);
    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: 'Account not found' 
      });
    }

    const result = await sdk.closePosition(account, Number(positionId));

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get position details
app.get('/api/position/:positionId', async (req, res) => {
  try {
    const { positionId } = req.params;
    const position = await sdk.getPosition(sdk.CONTRACT_ADDRESS, Number(positionId));

    res.json({
      success: true,
      data: position
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get position metrics (P&L calculation)
app.post('/api/position/metrics', async (req, res) => {
  try {
    const {
      collateralAmount,
      leverageMultiplier,
      btcWeight,
      ethWeight,
      solWeight,
      entryValue
    } = req.body;

    const metrics = await sdk.getPositionMetrics(
      sdk.ORACLE_ADDRESS,
      Number(collateralAmount),
      Number(leverageMultiplier),
      Number(btcWeight),
      Number(ethWeight),
      Number(solWeight),
      Number(entryValue)
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update prices (demo only)
app.post('/api/oracle/update', async (req, res) => {
  try {
    const { btcPrice, ethPrice, solPrice } = req.body;

    const txHash = await sdk.updateOraclePrices(
      adminAccount,
      Number(btcPrice),
      Number(ethPrice),
      Number(solPrice)
    );

    res.json({
      success: true,
      data: { transactionHash: txHash }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simulate price movement (demo only)
app.post('/api/oracle/simulate', async (req, res) => {
  try {
    const { percentageChange } = req.body;

    const txHash = await sdk.simulatePriceMovement(
      adminAccount,
      Number(percentageChange)
    );

    res.json({
      success: true,
      data: { transactionHash: txHash }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Cresca Basket API server running on port ${PORT}`);
  await initializeServer();
});

export default app;

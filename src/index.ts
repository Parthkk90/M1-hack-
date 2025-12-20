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
    await sdk.initializeFunding(adminAccount);
    console.log('Contracts initialized successfully (vault, oracle, funding)');
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

// Open basket position (150x leverage, isolated margin)
app.post('/api/position/open', async (req, res) => {
  try {
    const { 
      accountAddress, 
      collateralAmount, 
      leverageMultiplier, 
      btcWeight, 
      ethWeight, 
      solWeight,
      isLong = true  // Default to long position
    } = req.body;

    // Validate input
    if (!accountAddress || !collateralAmount || !leverageMultiplier) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Validate leverage (1-150x)
    if (leverageMultiplier < 1 || leverageMultiplier > 150) {
      return res.status(400).json({
        success: false,
        error: 'Leverage must be between 1x and 150x'
      });
    }

    const account = userAccounts.get(accountAddress);
    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: 'Account not found. Create an account first.' 
      });
    }

    // Validate leverage with risk tolerance
    const validation = sdk.validateLeverage(Number(leverageMultiplier), 'extreme');
    
    const result = await sdk.openPosition(
      account,
      Number(collateralAmount),
      Number(leverageMultiplier),
      Number(btcWeight),
      Number(ethWeight),
      Number(solWeight),
      isLong
    );

    res.json({
      success: true,
      data: result,
      warning: validation.warning  // Include risk warning
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

// Get position details (with isolated margin info)
app.get('/api/position/:positionId', async (req, res) => {
  try {
    const { positionId } = req.params;
    const position = await sdk.getPosition(sdk.CONTRACT_ADDRESS, Number(positionId));

    // Calculate liquidation info
    const liquidationDistance = (1 / Number(position.leverageMultiplier)) * 100;

    res.json({
      success: true,
      data: {
        ...position,
        liquidationDistance: `${liquidationDistance.toFixed(2)}%`,
        riskLevel: Number(position.leverageMultiplier) > 100 ? 'EXTREME' :
                   Number(position.leverageMultiplier) > 50 ? 'HIGH' :
                   Number(position.leverageMultiplier) > 10 ? 'MEDIUM' : 'LOW'
      }
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

// Schedule one-time payment
app.post('/api/schedule/one-time', async (req, res) => {
  try {
    const { accountAddress, recipient, amount, executionTimestamp } = req.body;

    if (!accountAddress || !recipient || !amount || !executionTimestamp) {
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

    const result = await sdk.scheduleOneTimePayment(
      account,
      recipient,
      Number(amount),
      Number(executionTimestamp)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule recurring payment
app.post('/api/schedule/recurring', async (req, res) => {
  try {
    const { 
      accountAddress, 
      recipient, 
      amount, 
      firstExecutionTimestamp, 
      intervalType, 
      executionCount 
    } = req.body;

    if (!accountAddress || !recipient || !amount || !firstExecutionTimestamp || intervalType === undefined) {
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

    const result = await sdk.scheduleRecurringPayment(
      account,
      recipient,
      Number(amount),
      Number(firstExecutionTimestamp),
      Number(intervalType),
      Number(executionCount || 0)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's schedules
app.get('/api/schedule/list/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;

    const schedules = await sdk.getUserSchedules(accountAddress);
    const activeCount = await sdk.getActiveSchedulesCount(accountAddress);
    const totalLocked = await sdk.getTotalLockedFunds(accountAddress);

    res.json({
      success: true,
      data: {
        schedules,
        activeCount,
        totalLockedFunds: totalLocked,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel schedule
app.post('/api/schedule/cancel', async (req, res) => {
  try {
    const { accountAddress, scheduleId } = req.body;

    if (!accountAddress || scheduleId === undefined) {
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

    const result = await sdk.cancelSchedule(account, Number(scheduleId));

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute pending payments (keeper endpoint)
app.post('/api/schedule/execute', async (req, res) => {
  try {
    const { schedulerAddress } = req.body;

    if (!schedulerAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing schedulerAddress' 
      });
    }

    // Use admin account as executor
    const txHash = await sdk.executePendingPayments(adminAccount, schedulerAddress);

    res.json({
      success: true,
      data: { transactionHash: txHash }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current funding rate
app.get('/api/funding/rate', async (req, res) => {
  try {
    const fundingRate = await sdk.getCurrentFundingRate(sdk.CONTRACT_ADDRESS);
    
    res.json({
      success: true,
      data: {
        fundingRate: `${(Number(fundingRate.fundingRate) / 100).toFixed(2)}%`,
        longsPay: fundingRate.longsPay,
        direction: fundingRate.longsPay ? 'Longs pay Shorts' : 'Shorts pay Longs'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get funding state (open interest)
app.get('/api/funding/state', async (req, res) => {
  try {
    const state = await sdk.getFundingState(sdk.CONTRACT_ADDRESS);
    const total = Number(state.longOpenInterest) + Number(state.shortOpenInterest);
    
    res.json({
      success: true,
      data: {
        longOpenInterest: state.longOpenInterest,
        shortOpenInterest: state.shortOpenInterest,
        totalOpenInterest: total,
        longPercentage: total > 0 ? ((Number(state.longOpenInterest) / total) * 100).toFixed(2) + '%' : '0%',
        shortPercentage: total > 0 ? ((Number(state.shortOpenInterest) / total) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate liquidation price
app.post('/api/position/liquidation-price', async (req, res) => {
  try {
    const { entryPrice, leverage, isLong = true } = req.body;
    
    if (!entryPrice || !leverage) {
      return res.status(400).json({
        success: false,
        error: 'Entry price and leverage are required'
      });
    }
    
    const liquidationPrice = sdk.calculateLiquidationPrice(
      Number(entryPrice),
      Number(leverage),
      isLong
    );
    
    const distance = Math.abs((liquidationPrice - Number(entryPrice)) / Number(entryPrice)) * 100;
    
    res.json({
      success: true,
      data: {
        liquidationPrice: liquidationPrice.toFixed(2),
        entryPrice: Number(entryPrice).toFixed(2),
        distance: `${distance.toFixed(2)}%`,
        direction: isLong ? 'Below entry' : 'Above entry'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 Cresca Basket API Server`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Leverage: 1x - 150x (Merkle Trade standard)`);
  console.log(`⚡ Features: Isolated Margin + Funding Rates\n`);
  
  await initializeServer();
});

export default app;

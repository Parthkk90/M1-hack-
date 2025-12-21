"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// API Service for Movement Baskets - AI-Powered DeFi
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sdk = __importStar(require("./sdk"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Store admin account (in production, use secure key management)
let adminAccount;
let userAccounts = new Map();
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
    }
    catch (error) {
        console.error('Server initialization error:', error);
    }
}
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Movement Baskets API is running', version: '2.0' });
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Open basket position (up to 20x leverage, isolated margin)
app.post('/api/position/open', async (req, res) => {
    try {
        const { accountAddress, collateralAmount, leverageMultiplier, btcWeight, ethWeight, solWeight, isLong = true // Default to long position
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
        const result = await sdk.openPosition(account, Number(collateralAmount), Number(leverageMultiplier), Number(btcWeight), Number(ethWeight), Number(solWeight), isLong);
        res.json({
            success: true,
            data: result,
            warning: validation.warning // Include risk warning
        });
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Get position metrics (P&L calculation)
app.post('/api/position/metrics', async (req, res) => {
    try {
        const { collateralAmount, leverageMultiplier, btcWeight, ethWeight, solWeight, entryValue } = req.body;
        const metrics = await sdk.getPositionMetrics(sdk.ORACLE_ADDRESS, Number(collateralAmount), Number(leverageMultiplier), Number(btcWeight), Number(ethWeight), Number(solWeight), Number(entryValue));
        res.json({
            success: true,
            data: metrics
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Update prices (demo only)
app.post('/api/oracle/update', async (req, res) => {
    try {
        const { btcPrice, ethPrice, solPrice } = req.body;
        const txHash = await sdk.updateOraclePrices(adminAccount, Number(btcPrice), Number(ethPrice), Number(solPrice));
        res.json({
            success: true,
            data: { transactionHash: txHash }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Simulate price movement (demo only)
app.post('/api/oracle/simulate', async (req, res) => {
    try {
        const { percentageChange } = req.body;
        const txHash = await sdk.simulatePriceMovement(adminAccount, Number(percentageChange));
        res.json({
            success: true,
            data: { transactionHash: txHash }
        });
    }
    catch (error) {
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
        const result = await sdk.scheduleOneTimePayment(account, recipient, Number(amount), Number(executionTimestamp));
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Schedule recurring payment
app.post('/api/schedule/recurring', async (req, res) => {
    try {
        const { accountAddress, recipient, amount, firstExecutionTimestamp, intervalType, executionCount } = req.body;
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
        const result = await sdk.scheduleRecurringPayment(account, recipient, Number(amount), Number(firstExecutionTimestamp), Number(intervalType), Number(executionCount || 0));
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
        const liquidationPrice = sdk.calculateLiquidationPrice(Number(entryPrice), Number(leverage), isLong);
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Create AI rebalancing strategy
app.post('/api/ai/strategy/create', async (req, res) => {
    try {
        const { accountAddress, basketId, btcWeight, ethWeight, solWeight, volatilityTolerance, rebalanceThreshold } = req.body;
        const account = userAccounts.get(accountAddress);
        if (!account) {
            return res.status(404).json({ success: false, error: 'Account not found' });
        }
        const txHash = await sdk.createAIStrategy(account, Number(basketId), Number(btcWeight), Number(ethWeight), Number(solWeight), Number(volatilityTolerance), Number(rebalanceThreshold));
        res.json({
            success: true,
            data: { transactionHash: txHash, message: 'AI strategy created' }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Get risk score
app.get('/api/ai/risk-score/:basketId', async (req, res) => {
    try {
        const basketId = Number(req.params.basketId);
        const riskScore = await sdk.getRiskScore(basketId);
        res.json({
            success: true,
            data: riskScore
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Execute rebalance
app.post('/api/ai/rebalance', async (req, res) => {
    try {
        const { accountAddress, basketId } = req.body;
        const account = userAccounts.get(accountAddress);
        if (!account) {
            return res.status(404).json({ success: false, error: 'Account not found' });
        }
        const txHash = await sdk.executeRebalance(account, Number(basketId));
        res.json({
            success: true,
            data: { transactionHash: txHash, message: 'Rebalance executed' }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Subscribe to premium
app.post('/api/subscription/premium', async (req, res) => {
    try {
        const { accountAddress, durationMonths } = req.body;
        const account = userAccounts.get(accountAddress);
        if (!account) {
            return res.status(404).json({ success: false, error: 'Account not found' });
        }
        const txHash = await sdk.subscribePremium(account, Number(durationMonths));
        res.json({
            success: true,
            data: {
                transactionHash: txHash,
                message: `Subscribed for ${durationMonths} month(s)`,
                cost: `${durationMonths * 10} APT`
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Get revenue stats
app.get('/api/revenue/stats', async (req, res) => {
    try {
        const stats = await sdk.getRevenueStats();
        res.json({
            success: true,
            data: {
                tradingFees: stats[0],
                performanceFees: stats[1],
                liquidationFees: stats[2],
                subscriptionFees: stats[3],
                total: Number(stats[0]) + Number(stats[1]) + Number(stats[2]) + Number(stats[3])
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Start server
app.listen(PORT, async () => {
    console.log(`\n🚀 Movement Baskets API Server`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Health: http://localhost:${PORT}/health`);
    console.log(`📊 Leverage: 1x - 20x (Sustainable AI-powered)`);
    console.log(`🤖 Features: AI Rebalancing + Revenue Streams\n`);
    await initializeServer();
});
exports.default = app;
//# sourceMappingURL=index.js.map
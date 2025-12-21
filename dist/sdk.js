"use strict";
// Movement Baskets SDK - AI-Powered Basket Trading on Movement Network
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORACLE_ADDRESS = exports.CONTRACT_ADDRESS = exports.aptos = void 0;
exports.initializeVault = initializeVault;
exports.initializeOracle = initializeOracle;
exports.openPosition = openPosition;
exports.closePosition = closePosition;
exports.getPosition = getPosition;
exports.getOraclePrices = getOraclePrices;
exports.updateOraclePrices = updateOraclePrices;
exports.simulatePriceMovement = simulatePriceMovement;
exports.getPositionMetrics = getPositionMetrics;
exports.createAccount = createAccount;
exports.fundAccount = fundAccount;
exports.initializePaymentScheduler = initializePaymentScheduler;
exports.scheduleOneTimePayment = scheduleOneTimePayment;
exports.scheduleRecurringPayment = scheduleRecurringPayment;
exports.cancelSchedule = cancelSchedule;
exports.executePendingPayments = executePendingPayments;
exports.getUserSchedules = getUserSchedules;
exports.getActiveSchedulesCount = getActiveSchedulesCount;
exports.getTotalLockedFunds = getTotalLockedFunds;
exports.initializeFunding = initializeFunding;
exports.getCurrentFundingRate = getCurrentFundingRate;
exports.getFundingState = getFundingState;
exports.estimateFundingPayment = estimateFundingPayment;
exports.calculateLiquidationPrice = calculateLiquidationPrice;
exports.getLiquidationThreshold = getLiquidationThreshold;
exports.validateLeverage = validateLeverage;
exports.initializeRebalancing = initializeRebalancing;
exports.createAIStrategy = createAIStrategy;
exports.getRiskScore = getRiskScore;
exports.executeRebalance = executeRebalance;
exports.initializeRevenue = initializeRevenue;
exports.subscribePremium = subscribePremium;
exports.getRevenueStats = getRevenueStats;
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xcafe";
exports.CONTRACT_ADDRESS = CONTRACT_ADDRESS;
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || "0xcafe";
exports.ORACLE_ADDRESS = ORACLE_ADDRESS;
// Initialize Aptos client for Movement Network
const config = new ts_sdk_1.AptosConfig({
    fullnode: process.env.MOVEMENT_RPC || "https://testnet.movementnetwork.xyz/v1",
    faucet: process.env.MOVEMENT_FAUCET || "https://faucet.testnet.movementnetwork.xyz/"
});
const aptos = new ts_sdk_1.Aptos(config);
exports.aptos = aptos;
/**
 * Initialize the basket vault
 */
async function initializeVault(adminAccount) {
    const transaction = await aptos.transaction.build.simple({
        sender: adminAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::basket_vault::initialize`,
            functionArguments: [],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: adminAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Initialize the price oracle with default prices
 */
async function initializeOracle(adminAccount) {
    const transaction = await aptos.transaction.build.simple({
        sender: adminAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::price_oracle::initialize`,
            functionArguments: [],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: adminAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Open a new basket position (up to 20x leverage, isolated margin)
 */
async function openPosition(userAccount, collateralAmount, leverageMultiplier, btcWeight, ethWeight, solWeight, isLong = true // Long (true) or Short (false)
) {
    // Validate weights sum to 100
    if (btcWeight + ethWeight + solWeight !== 100) {
        throw new Error("Basket weights must sum to 100");
    }
    // Validate leverage (1x to 20x - Movement Baskets sustainable leverage)
    if (leverageMultiplier < 1 || leverageMultiplier > 20) {
        throw new Error("Leverage must be between 1x and 20x");
    }
    // Warn for high leverage
    if (leverageMultiplier > 10) {
        console.warn(`⚠️  WARNING: ${leverageMultiplier}x leverage - ${(100 / leverageMultiplier).toFixed(2)}% adverse move = liquidation`);
    }
    const transaction = await aptos.transaction.build.simple({
        sender: userAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::basket_vault::open_position`,
            functionArguments: [
                CONTRACT_ADDRESS, // vault_addr
                collateralAmount,
                leverageMultiplier,
                btcWeight,
                ethWeight,
                solWeight,
                isLong, // Long or short position
            ],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: userAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return {
        transactionHash: committedTxn.hash,
        success: true,
    };
}
/**
 * Close a basket position
 */
async function closePosition(userAccount, positionId) {
    const transaction = await aptos.transaction.build.simple({
        sender: userAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::basket_vault::close_position`,
            functionArguments: [
                CONTRACT_ADDRESS, // vault_addr
                positionId,
            ],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: userAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return {
        transactionHash: committedTxn.hash,
        success: true,
    };
}
/**
 * Get position details (with isolated margin info)
 */
async function getPosition(vaultAddress, positionId) {
    const result = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::basket_vault::get_position`,
            functionArguments: [vaultAddress, positionId],
        },
    });
    return {
        owner: result[0],
        collateralAmount: result[1],
        leverageMultiplier: result[2],
        btcWeight: result[3],
        ethWeight: result[4],
        solWeight: result[5],
        isActive: result[6],
        isLong: result[7],
        maintenanceMargin: result[8],
        liquidationPrice: result[9],
    };
}
/**
 * Get current oracle prices
 */
async function getOraclePrices(oracleAddress) {
    const result = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::price_oracle::get_all_prices`,
            functionArguments: [oracleAddress],
        },
    });
    return {
        btcPrice: result[0],
        ethPrice: result[1],
        solPrice: result[2],
    };
}
/**
 * Update oracle prices (admin only, for demo)
 */
async function updateOraclePrices(adminAccount, btcPrice, ethPrice, solPrice) {
    const transaction = await aptos.transaction.build.simple({
        sender: adminAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::price_oracle::update_prices`,
            functionArguments: [
                ORACLE_ADDRESS,
                btcPrice,
                ethPrice,
                solPrice,
            ],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: adminAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Simulate price movement (for demo)
 */
async function simulatePriceMovement(adminAccount, percentageChange // e.g., 500 = 5%
) {
    const transaction = await aptos.transaction.build.simple({
        sender: adminAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::price_oracle::simulate_price_movement`,
            functionArguments: [
                ORACLE_ADDRESS,
                percentageChange,
            ],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: adminAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Calculate position metrics
 */
async function getPositionMetrics(oracleAddress, collateralAmount, leverageMultiplier, btcWeight, ethWeight, solWeight, entryValue) {
    const result = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::leverage_engine::get_position_metrics`,
            functionArguments: [
                oracleAddress,
                collateralAmount,
                leverageMultiplier,
                btcWeight,
                ethWeight,
                solWeight,
                entryValue,
            ],
        },
    });
    return {
        currentValue: result[0],
        profitLoss: result[1],
        isProfit: result[2],
        healthFactor: result[3],
        shouldLiquidate: result[4],
    };
}
/**
 * Create a new account for testing
 */
function createAccount(privateKeyHex) {
    if (privateKeyHex) {
        const privateKey = new ts_sdk_1.Ed25519PrivateKey(privateKeyHex);
        return ts_sdk_1.Account.fromPrivateKey({ privateKey });
    }
    return ts_sdk_1.Account.generate();
}
/**
 * Fund an account (testnet only)
 */
async function fundAccount(account, amount = 100000000) {
    await aptos.fundAccount({
        accountAddress: account.accountAddress,
        amount,
    });
}
/**
 * Initialize payment scheduler
 */
async function initializePaymentScheduler(account) {
    const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::payment_scheduler::initialize`,
            functionArguments: [],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Schedule one-time payment
 */
async function scheduleOneTimePayment(account, recipient, amount, executionTimestamp) {
    const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::payment_scheduler::schedule_one_time_payment`,
            functionArguments: [
                recipient,
                amount,
                executionTimestamp,
            ],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return {
        transactionHash: committedTxn.hash,
        success: true,
    };
}
/**
 * Schedule recurring payment
 */
async function scheduleRecurringPayment(account, recipient, amount, firstExecutionTimestamp, intervalType, // 0=daily, 1=weekly, 2=monthly, 3=yearly
executionCount // 0=unlimited
) {
    const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::payment_scheduler::schedule_recurring_payment`,
            functionArguments: [
                recipient,
                amount,
                firstExecutionTimestamp,
                intervalType,
                executionCount,
            ],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return {
        transactionHash: committedTxn.hash,
        success: true,
    };
}
/**
 * Cancel scheduled payment
 */
async function cancelSchedule(account, scheduleId) {
    const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::payment_scheduler::cancel_schedule`,
            functionArguments: [scheduleId],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return {
        transactionHash: committedTxn.hash,
        success: true,
    };
}
/**
 * Execute pending payments (keeper function)
 */
async function executePendingPayments(executorAccount, schedulerAddress) {
    const transaction = await aptos.transaction.build.simple({
        sender: executorAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::payment_scheduler::execute_pending_payments`,
            functionArguments: [schedulerAddress],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: executorAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Get user's scheduled payments
 */
async function getUserSchedules(userAddress) {
    const result = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::payment_scheduler::get_user_schedules`,
            functionArguments: [userAddress],
        },
    });
    return result[0];
}
/**
 * Get active schedules count
 */
async function getActiveSchedulesCount(userAddress) {
    const result = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::payment_scheduler::get_active_schedules_count`,
            functionArguments: [userAddress],
        },
    });
    return Number(result[0]);
}
/**
 * Get total locked funds
 */
async function getTotalLockedFunds(userAddress) {
    const result = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::payment_scheduler::get_total_locked_funds`,
            functionArguments: [userAddress],
        },
    });
    return Number(result[0]);
}
/**
 * Initialize funding rate state
 */
async function initializeFunding(adminAccount) {
    const transaction = await aptos.transaction.build.simple({
        sender: adminAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::funding_rate::initialize`,
            functionArguments: [],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: adminAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Get current funding rate
 */
async function getCurrentFundingRate(stateAddress) {
    const result = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::funding_rate::get_current_funding_rate`,
            functionArguments: [stateAddress],
        },
    });
    return {
        fundingRate: result[0], // In basis points (100 = 1%)
        longsPay: result[1], // True if longs pay shorts
    };
}
/**
 * Get funding state (open interest)
 */
async function getFundingState(stateAddress) {
    const result = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::funding_rate::get_funding_state`,
            functionArguments: [stateAddress],
        },
    });
    return {
        longOpenInterest: result[0],
        shortOpenInterest: result[1],
        cumulativeFundingLong: result[2],
        cumulativeFundingShort: result[3],
    };
}
/**
 * Estimate funding payment for a position
 */
async function estimateFundingPayment(stateAddress, positionSize, isLong) {
    const result = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::funding_rate::estimate_funding_payment`,
            functionArguments: [stateAddress, positionSize, isLong],
        },
    });
    return {
        paymentAmount: result[0],
        shouldReceive: result[1], // True if receiving, false if paying
    };
}
/**
 * Calculate liquidation price for isolated position
 */
function calculateLiquidationPrice(entryPrice, leverage, isLong) {
    const liquidationDistance = 1 / leverage;
    if (isLong) {
        return entryPrice * (1 - liquidationDistance);
    }
    else {
        return entryPrice * (1 + liquidationDistance);
    }
}
/**
 * Calculate dynamic liquidation threshold based on leverage
 */
function getLiquidationThreshold(leverage) {
    if (leverage <= 10)
        return 0.80; // 80% for low leverage
    if (leverage <= 50)
        return 0.95; // 95% for medium leverage
    if (leverage <= 100)
        return 0.98; // 98% for high leverage
    return 0.993; // 99.3% for extreme leverage (150x)
}
/**
 * Validate if leverage is safe for user's risk tolerance (Movement Baskets 20x max)
 */
function validateLeverage(leverage, riskTolerance) {
    const liquidationDistance = (1 / leverage) * 100;
    const thresholds = {
        low: 5, // Max 5x (20% move)
        medium: 10, // Max 10x (10% move)
        high: 20, // Max 20x (5% move)
    };
    if (leverage > thresholds[riskTolerance]) {
        return {
            isValid: false,
            warning: `${leverage}x exceeds ${riskTolerance} risk tolerance (max ${thresholds[riskTolerance]}x)`
        };
    }
    if (leverage > 15) {
        return {
            isValid: true,
            warning: `⚠️ HIGH RISK: ${leverage}x leverage - ${liquidationDistance.toFixed(2)}% adverse move = liquidation`
        };
    }
    return { isValid: true };
}
/**
 * Initialize AI rebalancing engine
 */
async function initializeRebalancing(adminAccount) {
    const transaction = await aptos.transaction.build.simple({
        sender: adminAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::rebalancing_engine::initialize`,
            functionArguments: [],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: adminAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Create AI-managed rebalancing strategy
 */
async function createAIStrategy(userAccount, basketId, btcWeight, ethWeight, solWeight, volatilityTolerance, rebalanceThreshold) {
    const transaction = await aptos.transaction.build.simple({
        sender: userAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::rebalancing_engine::create_strategy`,
            functionArguments: [
                basketId,
                [btcWeight, ethWeight, solWeight],
                ["BTC", "ETH", "SOL"],
                volatilityTolerance,
                rebalanceThreshold,
                true // is_ai_managed
            ],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: userAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Get risk score for a basket
 */
async function getRiskScore(basketId) {
    const payload = {
        function: `${CONTRACT_ADDRESS}::rebalancing_engine::calculate_risk_score`,
        functionArguments: [basketId],
    };
    return await aptos.view({ payload });
}
/**
 * Execute rebalance for AI-managed basket
 */
async function executeRebalance(userAccount, basketId) {
    const transaction = await aptos.transaction.build.simple({
        sender: userAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::rebalancing_engine::execute_rebalance`,
            functionArguments: [basketId],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: userAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Initialize revenue distributor
 */
async function initializeRevenue(adminAccount) {
    const transaction = await aptos.transaction.build.simple({
        sender: adminAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::revenue_distributor::initialize`,
            functionArguments: [],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: adminAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Subscribe to premium tier
 */
async function subscribePremium(userAccount, durationMonths) {
    const transaction = await aptos.transaction.build.simple({
        sender: userAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::revenue_distributor::subscribe_premium`,
            functionArguments: [CONTRACT_ADDRESS, durationMonths],
        },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
        signer: userAccount,
        transaction,
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    return committedTxn.hash;
}
/**
 * Get total revenue stats
 */
async function getRevenueStats() {
    const payload = {
        function: `${CONTRACT_ADDRESS}::revenue_distributor::get_total_revenue`,
        functionArguments: [CONTRACT_ADDRESS],
    };
    return await aptos.view({ payload });
}
//# sourceMappingURL=sdk.js.map
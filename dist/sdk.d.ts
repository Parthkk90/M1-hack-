import { Aptos, Account } from "@aptos-labs/ts-sdk";
declare const CONTRACT_ADDRESS: string;
declare const ORACLE_ADDRESS: string;
declare const aptos: Aptos;
/**
 * Initialize the basket vault
 */
export declare function initializeVault(adminAccount: Account): Promise<string>;
/**
 * Initialize the price oracle with default prices
 */
export declare function initializeOracle(adminAccount: Account): Promise<string>;
/**
 * Open a new basket position (up to 20x leverage, isolated margin)
 */
export declare function openPosition(userAccount: Account, collateralAmount: number, leverageMultiplier: number, btcWeight: number, ethWeight: number, solWeight: number, isLong?: boolean): Promise<{
    transactionHash: string;
    success: boolean;
}>;
/**
 * Close a basket position
 */
export declare function closePosition(userAccount: Account, positionId: number): Promise<{
    transactionHash: string;
    success: boolean;
}>;
/**
 * Get position details (with isolated margin info)
 */
export declare function getPosition(vaultAddress: string, positionId: number): Promise<{
    owner: import("@aptos-labs/ts-sdk").MoveValue;
    collateralAmount: import("@aptos-labs/ts-sdk").MoveValue;
    leverageMultiplier: import("@aptos-labs/ts-sdk").MoveValue;
    btcWeight: import("@aptos-labs/ts-sdk").MoveValue;
    ethWeight: import("@aptos-labs/ts-sdk").MoveValue;
    solWeight: import("@aptos-labs/ts-sdk").MoveValue;
    isActive: import("@aptos-labs/ts-sdk").MoveValue;
    isLong: import("@aptos-labs/ts-sdk").MoveValue;
    maintenanceMargin: import("@aptos-labs/ts-sdk").MoveValue;
    liquidationPrice: import("@aptos-labs/ts-sdk").MoveValue;
}>;
/**
 * Get current oracle prices
 */
export declare function getOraclePrices(oracleAddress: string): Promise<{
    btcPrice: import("@aptos-labs/ts-sdk").MoveValue;
    ethPrice: import("@aptos-labs/ts-sdk").MoveValue;
    solPrice: import("@aptos-labs/ts-sdk").MoveValue;
}>;
/**
 * Update oracle prices (admin only, for demo)
 */
export declare function updateOraclePrices(adminAccount: Account, btcPrice: number, ethPrice: number, solPrice: number): Promise<string>;
/**
 * Simulate price movement (for demo)
 */
export declare function simulatePriceMovement(adminAccount: Account, percentageChange: number): Promise<string>;
/**
 * Calculate position metrics
 */
export declare function getPositionMetrics(oracleAddress: string, collateralAmount: number, leverageMultiplier: number, btcWeight: number, ethWeight: number, solWeight: number, entryValue: number): Promise<{
    currentValue: import("@aptos-labs/ts-sdk").MoveValue;
    profitLoss: import("@aptos-labs/ts-sdk").MoveValue;
    isProfit: import("@aptos-labs/ts-sdk").MoveValue;
    healthFactor: import("@aptos-labs/ts-sdk").MoveValue;
    shouldLiquidate: import("@aptos-labs/ts-sdk").MoveValue;
}>;
/**
 * Create a new account for testing
 */
export declare function createAccount(privateKeyHex?: string): Account;
/**
 * Fund an account (testnet only)
 */
export declare function fundAccount(account: Account, amount?: number): Promise<void>;
/**
 * Initialize payment scheduler
 */
export declare function initializePaymentScheduler(account: Account): Promise<string>;
/**
 * Schedule one-time payment
 */
export declare function scheduleOneTimePayment(account: Account, recipient: string, amount: number, executionTimestamp: number): Promise<{
    transactionHash: string;
    success: boolean;
}>;
/**
 * Schedule recurring payment
 */
export declare function scheduleRecurringPayment(account: Account, recipient: string, amount: number, firstExecutionTimestamp: number, intervalType: number, // 0=daily, 1=weekly, 2=monthly, 3=yearly
executionCount: number): Promise<{
    transactionHash: string;
    success: boolean;
}>;
/**
 * Cancel scheduled payment
 */
export declare function cancelSchedule(account: Account, scheduleId: number): Promise<{
    transactionHash: string;
    success: boolean;
}>;
/**
 * Execute pending payments (keeper function)
 */
export declare function executePendingPayments(executorAccount: Account, schedulerAddress: string): Promise<string>;
/**
 * Get user's scheduled payments
 */
export declare function getUserSchedules(userAddress: string): Promise<import("@aptos-labs/ts-sdk").MoveValue>;
/**
 * Get active schedules count
 */
export declare function getActiveSchedulesCount(userAddress: string): Promise<number>;
/**
 * Get total locked funds
 */
export declare function getTotalLockedFunds(userAddress: string): Promise<number>;
/**
 * Initialize funding rate state
 */
export declare function initializeFunding(adminAccount: Account): Promise<string>;
/**
 * Get current funding rate
 */
export declare function getCurrentFundingRate(stateAddress: string): Promise<{
    fundingRate: import("@aptos-labs/ts-sdk").MoveValue;
    longsPay: import("@aptos-labs/ts-sdk").MoveValue;
}>;
/**
 * Get funding state (open interest)
 */
export declare function getFundingState(stateAddress: string): Promise<{
    longOpenInterest: import("@aptos-labs/ts-sdk").MoveValue;
    shortOpenInterest: import("@aptos-labs/ts-sdk").MoveValue;
    cumulativeFundingLong: import("@aptos-labs/ts-sdk").MoveValue;
    cumulativeFundingShort: import("@aptos-labs/ts-sdk").MoveValue;
}>;
/**
 * Estimate funding payment for a position
 */
export declare function estimateFundingPayment(stateAddress: string, positionSize: number, isLong: boolean): Promise<{
    paymentAmount: import("@aptos-labs/ts-sdk").MoveValue;
    shouldReceive: import("@aptos-labs/ts-sdk").MoveValue;
}>;
/**
 * Calculate liquidation price for isolated position
 */
export declare function calculateLiquidationPrice(entryPrice: number, leverage: number, isLong: boolean): number;
/**
 * Calculate dynamic liquidation threshold based on leverage
 */
export declare function getLiquidationThreshold(leverage: number): number;
/**
 * Validate if leverage is safe for user's risk tolerance (Movement Baskets 20x max)
 */
export declare function validateLeverage(leverage: number, riskTolerance: 'low' | 'medium' | 'high'): {
    isValid: boolean;
    warning?: string;
};
/**
 * Initialize AI rebalancing engine
 */
export declare function initializeRebalancing(adminAccount: Account): Promise<string>;
/**
 * Create AI-managed rebalancing strategy
 */
export declare function createAIStrategy(userAccount: Account, basketId: number, btcWeight: number, ethWeight: number, solWeight: number, volatilityTolerance: number, rebalanceThreshold: number): Promise<string>;
/**
 * Get risk score for a basket
 */
export declare function getRiskScore(basketId: number): Promise<any>;
/**
 * Execute rebalance for AI-managed basket
 */
export declare function executeRebalance(userAccount: Account, basketId: number): Promise<string>;
/**
 * Initialize revenue distributor
 */
export declare function initializeRevenue(adminAccount: Account): Promise<string>;
/**
 * Subscribe to premium tier
 */
export declare function subscribePremium(userAccount: Account, durationMonths: number): Promise<string>;
/**
 * Get total revenue stats
 */
export declare function getRevenueStats(): Promise<any>;
export { aptos, CONTRACT_ADDRESS, ORACLE_ADDRESS };
//# sourceMappingURL=sdk.d.ts.map
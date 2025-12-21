"use strict";
// Demo Script - Automated Basket Trading Flow
// Run this to demonstrate the full Cresca Basket functionality
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBasketDemo = runBasketDemo;
const sdk = __importStar(require("./sdk"));
const DEMO_COLLATERAL = 10000000; // 0.1 APT in octas
const DEMO_LEVERAGE = 10;
// Demo prices (with 8 decimals precision)
const INITIAL_BTC = 9500000000000; // $95,000
const INITIAL_ETH = 350000000000; // $3,500
const INITIAL_SOL = 19000000000; // $190
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function runBasketDemo() {
    console.log('\n🚀 Starting Cresca Basket Demo...\n');
    try {
        // Step 1: Create and fund admin account
        console.log('📝 Step 1: Creating admin account...');
        const adminAccount = sdk.createAccount();
        await sdk.fundAccount(adminAccount);
        console.log(`✅ Admin account: ${adminAccount.accountAddress.toString()}`);
        // Step 2: Initialize contracts
        console.log('\n📝 Step 2: Initializing contracts...');
        await sdk.initializeVault(adminAccount);
        await sdk.initializeOracle(adminAccount);
        console.log('✅ Vault and Oracle initialized');
        // Step 3: Create user account
        console.log('\n📝 Step 3: Creating user account...');
        const userAccount = sdk.createAccount();
        await sdk.fundAccount(userAccount);
        console.log(`✅ User account: ${userAccount.accountAddress.toString()}`);
        // Step 4: Check initial prices
        console.log('\n📝 Step 4: Checking oracle prices...');
        const initialPrices = await sdk.getOraclePrices(sdk.ORACLE_ADDRESS);
        console.log('✅ Initial Prices:');
        console.log(`   BTC: $${(Number(initialPrices.btcPrice) / 100000000).toFixed(2)}`);
        console.log(`   ETH: $${(Number(initialPrices.ethPrice) / 100000000).toFixed(2)}`);
        console.log(`   SOL: $${(Number(initialPrices.solPrice) / 100000000).toFixed(2)}`);
        // Step 5: Open basket position
        console.log('\n📝 Step 5: Opening basket position...');
        console.log('   Basket: 50% BTC, 30% ETH, 20% SOL');
        console.log(`   Leverage: ${DEMO_LEVERAGE}x`);
        console.log(`   Collateral: ${DEMO_COLLATERAL / 100000000} APT`);
        const openResult = await sdk.openPosition(userAccount, DEMO_COLLATERAL, DEMO_LEVERAGE, 50, // BTC weight
        30, // ETH weight
        20 // SOL weight
        );
        console.log(`✅ Position opened! TX: ${openResult.transactionHash}`);
        // Step 6: Get position details
        console.log('\n📝 Step 6: Fetching position details...');
        const positionId = 0; // First position
        const position = await sdk.getPosition(sdk.CONTRACT_ADDRESS, positionId);
        console.log('✅ Position Details:');
        console.log(`   Owner: ${position.owner}`);
        console.log(`   Collateral: ${Number(position.collateralAmount) / 100000000} APT`);
        console.log(`   Leverage: ${position.leverageMultiplier}x`);
        console.log(`   Weights: ${position.btcWeight}% BTC, ${position.ethWeight}% ETH, ${position.solWeight}% SOL`);
        // Step 7: Calculate initial metrics
        console.log('\n📝 Step 7: Calculating position metrics...');
        const entryValue = DEMO_COLLATERAL * DEMO_LEVERAGE;
        const initialMetrics = await sdk.getPositionMetrics(sdk.ORACLE_ADDRESS, DEMO_COLLATERAL, DEMO_LEVERAGE, 50, 30, 20, entryValue);
        console.log('✅ Initial Metrics:');
        console.log(`   Current Value: ${Number(initialMetrics.currentValue) / 100000000} APT`);
        console.log(`   P&L: ${initialMetrics.isProfit ? '+' : '-'}${Number(initialMetrics.profitLoss) / 100000000} APT`);
        console.log(`   Health Factor: ${initialMetrics.healthFactor}%`);
        // Step 8: Wait and simulate price movement
        console.log('\n📝 Step 8: Simulating market movement (+5%)...');
        console.log('   Waiting 30 seconds...');
        await sleep(30000);
        await sdk.simulatePriceMovement(adminAccount, 500); // 500 = 5%
        console.log('✅ Prices updated!');
        // Step 9: Check new prices
        console.log('\n📝 Step 9: Checking new prices...');
        const newPrices = await sdk.getOraclePrices(sdk.ORACLE_ADDRESS);
        console.log('✅ Updated Prices:');
        console.log(`   BTC: $${(Number(newPrices.btcPrice) / 100000000).toFixed(2)} (+${((Number(newPrices.btcPrice) / Number(initialPrices.btcPrice) - 1) * 100).toFixed(2)}%)`);
        console.log(`   ETH: $${(Number(newPrices.ethPrice) / 100000000).toFixed(2)} (+${((Number(newPrices.ethPrice) / Number(initialPrices.ethPrice) - 1) * 100).toFixed(2)}%)`);
        console.log(`   SOL: $${(Number(newPrices.solPrice) / 100000000).toFixed(2)} (+${((Number(newPrices.solPrice) / Number(initialPrices.solPrice) - 1) * 100).toFixed(2)}%)`);
        // Step 10: Calculate new metrics
        console.log('\n📝 Step 10: Recalculating position metrics...');
        const newMetrics = await sdk.getPositionMetrics(sdk.ORACLE_ADDRESS, DEMO_COLLATERAL, DEMO_LEVERAGE, 50, 30, 20, entryValue);
        console.log('✅ Updated Metrics:');
        console.log(`   Current Value: ${Number(newMetrics.currentValue) / 100000000} APT`);
        console.log(`   P&L: ${newMetrics.isProfit ? '+' : '-'}${Number(newMetrics.profitLoss) / 100000000} APT (${newMetrics.isProfit ? 'PROFIT' : 'LOSS'})`);
        console.log(`   Health Factor: ${newMetrics.healthFactor}%`);
        console.log(`   Liquidation Risk: ${newMetrics.shouldLiquidate ? '⚠️ HIGH' : '✅ LOW'}`);
        // Step 11: Close position
        console.log('\n📝 Step 11: Closing position...');
        const closeResult = await sdk.closePosition(userAccount, positionId);
        console.log(`✅ Position closed! TX: ${closeResult.transactionHash}`);
        // Step 12: Verify position is closed
        console.log('\n📝 Step 12: Verifying position status...');
        const closedPosition = await sdk.getPosition(sdk.CONTRACT_ADDRESS, positionId);
        console.log(`✅ Position Active: ${closedPosition.isActive ? 'Yes' : 'No (Closed)'}`);
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DEMO COMPLETE!');
        console.log('='.repeat(60));
        console.log('\n📊 Summary:');
        console.log(`   Entry Value: ${entryValue / 100000000} APT`);
        console.log(`   Exit Value: ${Number(newMetrics.currentValue) / 100000000} APT`);
        console.log(`   Total P&L: ${newMetrics.isProfit ? '+' : '-'}${Number(newMetrics.profitLoss) / 100000000} APT`);
        console.log(`   ROI: ${((Number(newMetrics.currentValue) / entryValue - 1) * 100).toFixed(2)}%`);
        console.log('\n✨ Basket perpetuals demonstrated successfully!');
        console.log('   - Customizable asset weights');
        console.log('   - Leverage up to 10x');
        console.log('   - Real-time P&L tracking');
        console.log('   - Mobile-first interface ready\n');
    }
    catch (error) {
        console.error('\n❌ Demo failed:', error);
        throw error;
    }
}
// Run demo if called directly
if (require.main === module) {
    runBasketDemo()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
exports.default = runBasketDemo;
//# sourceMappingURL=demo.js.map
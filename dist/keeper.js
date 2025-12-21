"use strict";
// Keeper Bot - Automated Payment Executor
// Runs continuously to execute pending scheduled payments
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
exports.trackScheduler = trackScheduler;
exports.startKeeper = startKeeper;
exports.stopKeeper = stopKeeper;
exports.getKeeperStatus = getKeeperStatus;
exports.runKeeperDemo = runKeeperDemo;
const sdk = __importStar(require("./sdk"));
const CHECK_INTERVAL = 60000; // Check every 60 seconds
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;
let isRunning = false;
let keeperAccount;
let trackedSchedulers = new Map();
/**
 * Initialize keeper bot
 */
async function initializeKeeper() {
    console.log('🤖 Initializing Keeper Bot...');
    if (KEEPER_PRIVATE_KEY) {
        keeperAccount = sdk.createAccount(KEEPER_PRIVATE_KEY);
    }
    else {
        keeperAccount = sdk.createAccount();
        console.log('⚠️ No KEEPER_PRIVATE_KEY found, using generated account');
    }
    await sdk.fundAccount(keeperAccount);
    console.log(`✅ Keeper account: ${keeperAccount.accountAddress.toString()}`);
}
/**
 * Add scheduler address to tracking list
 */
function trackScheduler(schedulerAddress) {
    if (!trackedSchedulers.has(schedulerAddress)) {
        trackedSchedulers.set(schedulerAddress, {
            schedulerAddress,
            lastChecked: 0,
        });
        console.log(`📝 Now tracking scheduler: ${schedulerAddress}`);
    }
}
/**
 * Check and execute pending payments for a single scheduler
 */
async function processScheduler(schedulerAddress) {
    try {
        const schedules = await sdk.getUserSchedules(schedulerAddress);
        if (!schedules || schedules.length === 0) {
            return 0;
        }
        const currentTime = Math.floor(Date.now() / 1000);
        let pendingCount = 0;
        // Count pending payments
        for (const schedule of schedules) {
            if (schedule.is_active && schedule.execution_time <= currentTime) {
                pendingCount++;
            }
        }
        if (pendingCount > 0) {
            console.log(`⏰ Found ${pendingCount} pending payment(s) for ${schedulerAddress}`);
            // Execute all pending payments
            const txHash = await sdk.executePendingPayments(keeperAccount, schedulerAddress);
            console.log(`✅ Executed payments. TX: ${txHash}`);
            return pendingCount;
        }
        return 0;
    }
    catch (error) {
        console.error(`❌ Error processing scheduler ${schedulerAddress}:`, error.message);
        return 0;
    }
}
/**
 * Main keeper loop
 */
async function keeperLoop() {
    while (isRunning) {
        try {
            console.log('\n🔍 Checking for pending payments...');
            let totalExecuted = 0;
            for (const [address, info] of trackedSchedulers.entries()) {
                const executed = await processScheduler(address);
                totalExecuted += executed;
                trackedSchedulers.set(address, {
                    ...info,
                    lastChecked: Date.now(),
                });
            }
            if (totalExecuted > 0) {
                console.log(`🎉 Successfully executed ${totalExecuted} payment(s)`);
            }
            else {
                console.log('✨ No pending payments at this time');
            }
            console.log(`💤 Sleeping for ${CHECK_INTERVAL / 1000} seconds...`);
            await sleep(CHECK_INTERVAL);
        }
        catch (error) {
            console.error('❌ Keeper loop error:', error.message);
            await sleep(CHECK_INTERVAL);
        }
    }
}
/**
 * Start keeper bot
 */
async function startKeeper() {
    if (isRunning) {
        console.log('⚠️ Keeper bot is already running');
        return;
    }
    await initializeKeeper();
    isRunning = true;
    console.log('\n' + '='.repeat(60));
    console.log('🤖 KEEPER BOT STARTED');
    console.log('='.repeat(60));
    console.log(`📊 Tracking ${trackedSchedulers.size} scheduler(s)`);
    console.log(`⏱️  Check interval: ${CHECK_INTERVAL / 1000} seconds`);
    console.log('='.repeat(60) + '\n');
    keeperLoop();
}
/**
 * Stop keeper bot
 */
function stopKeeper() {
    if (!isRunning) {
        console.log('⚠️ Keeper bot is not running');
        return;
    }
    isRunning = false;
    console.log('\n🛑 Keeper bot stopped\n');
}
/**
 * Get keeper status
 */
function getKeeperStatus() {
    return {
        isRunning,
        keeperAddress: keeperAccount?.accountAddress.toString(),
        trackedSchedulers: Array.from(trackedSchedulers.values()),
        checkInterval: CHECK_INTERVAL,
    };
}
/**
 * Sleep helper
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Demo: Add some test schedulers and run keeper
 */
async function runKeeperDemo() {
    console.log('🚀 Starting Keeper Bot Demo...\n');
    // Create test accounts
    const user1 = sdk.createAccount();
    await sdk.fundAccount(user1);
    console.log(`👤 Test user 1: ${user1.accountAddress.toString()}`);
    const user2 = sdk.createAccount();
    await sdk.fundAccount(user2);
    console.log(`👤 Test user 2: ${user2.accountAddress.toString()}\n`);
    // Initialize payment schedulers
    await sdk.initializePaymentScheduler(user1);
    await sdk.initializePaymentScheduler(user2);
    // Schedule test payment (executes in 10 seconds)
    const futureTime = Math.floor(Date.now() / 1000) + 10;
    await sdk.scheduleOneTimePayment(user1, user2.accountAddress.toString(), 1000000, // 0.01 APT
    futureTime);
    console.log(`📅 Scheduled test payment from user1 to user2 (executes in 10s)\n`);
    // Track schedulers
    trackScheduler(user1.accountAddress.toString());
    trackScheduler(user2.accountAddress.toString());
    // Start keeper
    await startKeeper();
}
// Run demo if called directly
if (require.main === module) {
    runKeeperDemo()
        .catch((error) => {
        console.error('❌ Keeper demo failed:', error);
        process.exit(1);
    });
}
exports.default = { startKeeper, stopKeeper, getKeeperStatus, trackScheduler };
//# sourceMappingURL=keeper.js.map
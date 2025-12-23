// Keeper Bot - Automated Payment Executor & Liquidation Monitor
// Runs continuously to execute pending scheduled payments and monitor positions

import * as sdk from './sdk';
import { Account } from "@aptos-labs/ts-sdk";

const CHECK_INTERVAL = 60000; // Check every 60 seconds
const LIQUIDATION_CHECK_INTERVAL = 30000; // Check liquidations every 30 seconds
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;

interface ScheduleInfo {
  schedulerAddress: string;
  lastChecked: number;
}

interface PositionToMonitor {
  vaultAddress: string;
  positionId: number;
  owner: string;
}

let isRunning = false;
let keeperAccount: Account;
let trackedSchedulers: Map<string, ScheduleInfo> = new Map();
let monitoredPositions: PositionToMonitor[] = [];
let lastLiquidationCheck = 0;

/**
 * Initialize keeper bot
 */
async function initializeKeeper() {
  console.log('🤖 Initializing Keeper Bot...');
  
  if (KEEPER_PRIVATE_KEY) {
    keeperAccount = sdk.createAccount(KEEPER_PRIVATE_KEY);
  } else {
    keeperAccount = sdk.createAccount();
    console.log('⚠️ No KEEPER_PRIVATE_KEY found, using generated account');
  }

  await sdk.fundAccount(keeperAccount);
  console.log(`✅ Keeper account: ${keeperAccount.accountAddress.toString()}`);
  console.log('📊 Monitoring: Payments + Liquidations');
}

/**
 * Track a payment scheduler
 */
export function trackScheduler(schedulerAddress: string) {
  if (!trackedSchedulers.has(schedulerAddress)) {
    trackedSchedulers.set(schedulerAddress, {
      schedulerAddress,
      lastChecked: 0,
    });
    console.log(`📌 Now tracking scheduler: ${schedulerAddress}`);
  }
}

/**
 * Add position to liquidation monitoring
 */
export function monitorPosition(vaultAddress: string, positionId: number, owner: string) {
  const existing = monitoredPositions.find(
    p => p.vaultAddress === vaultAddress && p.positionId === positionId
  );
  
  if (!existing) {
    monitoredPositions.push({ vaultAddress, positionId, owner });
    console.log(`👀 Monitoring position ${positionId} for liquidation`);
  }
}

/**
 * Check positions for liquidation opportunities
 */
async function checkLiquidations(): Promise<number> {
  let liquidationCount = 0;
  
  try {
    for (const position of monitoredPositions) {
      try {
        const health = await sdk.getPositionHealth(position.vaultAddress, position.positionId);
        
        // Liquidate if health factor < 1.0
        if (health < 1.0) {
          console.log(`⚠️ Position ${position.positionId} can be liquidated (health: ${health.toFixed(4)})`);
          
          const result = await sdk.liquidatePosition(
            keeperAccount,
            position.owner,
            position.positionId
          );
          
          console.log(`✅ Liquidated position ${position.positionId}. TX: ${result.transactionHash}`);
          liquidationCount++;
          
          // Remove from monitoring after liquidation
          monitoredPositions = monitoredPositions.filter(
            p => !(p.vaultAddress === position.vaultAddress && p.positionId === position.positionId)
          );
        } else if (health < 1.2) {
          console.log(`⚡ Position ${position.positionId} at risk (health: ${health.toFixed(4)})`);
        }
      } catch (error: any) {
        // Position might be closed or already liquidated
        if (error.message.includes('not found') || error.message.includes('not active')) {
          monitoredPositions = monitoredPositions.filter(
            p => !(p.vaultAddress === position.vaultAddress && p.positionId === position.positionId)
          );
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Error checking liquidations:', error.message);
  }
  
  return liquidationCount;
}

/**
 * Check and execute pending payments for a single scheduler
 */
async function processScheduler(schedulerAddress: string): Promise<number> {
  try {
    const schedules = await sdk.getUserSchedules(schedulerAddress);
    
    // Type guard to ensure schedules is an array
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
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
  } catch (error: any) {
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
      
      // Check all tracked schedulers
      for (const [address, info] of trackedSchedulers.entries()) {
        const executed = await processScheduler(address);
        totalExecuted += executed;
        
        // Update last checked time
        info.lastChecked = Date.now();
      }
      
      if (totalExecuted > 0) {
        console.log(`✅ Total payments executed: ${totalExecuted}`);
      } else {
        console.log('💤 No pending payments');
      }
      
      // Check liquidations every 30 seconds
      const now = Date.now();
      if (now - lastLiquidationCheck >= LIQUIDATION_CHECK_INTERVAL) {
        console.log('\n⚡ Checking for liquidation opportunities...');
        
        const liquidations = await checkLiquidations();
        
        if (liquidations > 0) {
          console.log(`⚡ Total liquidations executed: ${liquidations}`);
        } else {
          console.log('✅ All positions healthy');
        }
        
        lastLiquidationCheck = now;
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
      
    } catch (error: any) {
      console.error('❌ Keeper loop error:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s on error
    }
  }
}

/**
 * Start the keeper bot
 */
export async function startKeeper() {
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
  console.log(`👀 Monitoring ${monitoredPositions.length} position(s)`);
  console.log(`⏱️  Payment check: ${CHECK_INTERVAL / 1000}s | Liquidation check: ${LIQUIDATION_CHECK_INTERVAL / 1000}s`);
  console.log('='.repeat(60) + '\n');

  keeperLoop();
}

/**
 * Stop the keeper bot
 */
export function stopKeeper() {
  if (!isRunning) {
    console.log('⚠️ Keeper bot is not running');
    return;
  }

  isRunning = false;
  console.log('\n🛑 Keeper bot stopped\n');
}

/**
 * Get current keeper status
 */
export function getKeeperStatus() {
  return {
    isRunning,
    keeperAddress: keeperAccount?.accountAddress.toString(),
    trackedSchedulers: Array.from(trackedSchedulers.entries()).map(([address, info]) => ({
      address,
      lastChecked: info.lastChecked,
    })),
    monitoredPositions: monitoredPositions.length,
    checkInterval: CHECK_INTERVAL,
    liquidationCheckInterval: LIQUIDATION_CHECK_INTERVAL,
  };
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Demo: Add some test schedulers and run keeper
 */
export async function runKeeperDemo() {
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
  await sdk.scheduleOneTimePayment(
    user1,
    user2.accountAddress.toString(),
    1000000, // 0.01 APT
    futureTime
  );
  console.log(`📅 Scheduled test payment from user1 to user2 (executes in 10s)\n`);

  // Track schedulers
  trackScheduler(user1.accountAddress.toString());
  trackScheduler(user2.accountAddress.toString());

  // Start keeper
  await startKeeper();
}

// Export for external use
export { initializeKeeper };

// Run demo if called directly
if (require.main === module) {
  runKeeperDemo()
    .catch((error) => {
      console.error('❌ Keeper demo failed:', error);
      process.exit(1);
    });
}

export default { startKeeper, stopKeeper, getKeeperStatus, trackScheduler, monitorPosition };

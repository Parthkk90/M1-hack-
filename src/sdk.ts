// Cresca Basket SDK - Movement Network Integration

import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xcafe";
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || "0xcafe";

// Initialize Aptos client (Movement uses same SDK)
const config = new AptosConfig({ 
  network: Network.TESTNET  // Change to Movement testnet RPC when available
});
const aptos = new Aptos(config);

/**
 * Initialize the basket vault
 */
export async function initializeVault(adminAccount: Account) {
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
export async function initializeOracle(adminAccount: Account) {
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
 * Open a new basket position
 */
export async function openPosition(
  userAccount: Account,
  collateralAmount: number,
  leverageMultiplier: number,
  btcWeight: number,
  ethWeight: number,
  solWeight: number
) {
  // Validate weights sum to 100
  if (btcWeight + ethWeight + solWeight !== 100) {
    throw new Error("Basket weights must sum to 100");
  }

  // Validate leverage
  if (leverageMultiplier < 1 || leverageMultiplier > 10) {
    throw new Error("Leverage must be between 1x and 10x");
  }

  const transaction = await aptos.transaction.build.simple({
    sender: userAccount.accountAddress,
    data: {
      function: `${CONTRACT_ADDRESS}::basket_vault::open_position`,
      functionArguments: [
        CONTRACT_ADDRESS,  // vault_addr
        collateralAmount,
        leverageMultiplier,
        btcWeight,
        ethWeight,
        solWeight,
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
export async function closePosition(
  userAccount: Account,
  positionId: number
) {
  const transaction = await aptos.transaction.build.simple({
    sender: userAccount.accountAddress,
    data: {
      function: `${CONTRACT_ADDRESS}::basket_vault::close_position`,
      functionArguments: [
        CONTRACT_ADDRESS,  // vault_addr
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
 * Get position details
 */
export async function getPosition(vaultAddress: string, positionId: number) {
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
  };
}

/**
 * Get current oracle prices
 */
export async function getOraclePrices(oracleAddress: string) {
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
export async function updateOraclePrices(
  adminAccount: Account,
  btcPrice: number,
  ethPrice: number,
  solPrice: number
) {
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
export async function simulatePriceMovement(
  adminAccount: Account,
  percentageChange: number  // e.g., 500 = 5%
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
export async function getPositionMetrics(
  oracleAddress: string,
  collateralAmount: number,
  leverageMultiplier: number,
  btcWeight: number,
  ethWeight: number,
  solWeight: number,
  entryValue: number
) {
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
export function createAccount(privateKeyHex?: string): Account {
  if (privateKeyHex) {
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    return Account.fromPrivateKey({ privateKey });
  }
  return Account.generate();
}

/**
 * Fund an account (testnet only)
 */
export async function fundAccount(account: Account, amount: number = 100000000) {
  await aptos.fundAccount({
    accountAddress: account.accountAddress,
    amount,
  });
}

export { aptos, CONTRACT_ADDRESS, ORACLE_ADDRESS };

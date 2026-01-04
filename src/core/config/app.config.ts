export const AppConfig = {
  appName: 'Cresca Wallet',
  appVersion: '1.0.0',
  
  // Movement Network Configuration
  movementNetwork: {
    url: 'https://testnet.movementnetwork.xyz/v1',
    faucetUrl: 'https://faucet.testnet.movementnetwork.xyz',
    explorerUrl: 'https://explorer.movementnetwork.xyz/?network=bardock+testnet',
    indexerUrl: 'https://hasura.testnet.movementnetwork.xyz/v1/graphql',
    chainId: '250',
  },
  
  // Contract Configuration (to be updated after deployment)
  contract: {
    address: '0xf5fe51c654d6475b8bf41bd0697a81fec15dbfb5488e83970d98badcaaec97a1', // Will be updated after deployment
    moduleName: 'cresca::payments',
  },
  
  // Transaction Configuration
  transaction: {
    maxGasAmount: 200000,
    gasUnitPrice: 100,
    coinType: '0x1::aptos_coin::AptosCoin',
    timeoutSeconds: 30,
  },
  
  // Security
  security: {
    pinLength: 6,
    biometricEnabled: true,
    autoLockTimeout: 300000, // 5 minutes in ms
  },
  
  // Cache
  cache: {
    transactionLimit: 100,
    cacheDurationMs: 3600000, // 1 hour
  },
  
  // API
  api: {
    requestTimeout: 30000,
    retryAttempts: 3,
  },
} as const;

export type AppConfigType = typeof AppConfig;

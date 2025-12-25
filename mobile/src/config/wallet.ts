// Wallet Configuration for Movement Testnet
// Real wallet address connected to contracts

export const WALLET_CONFIG = {
  // Main test wallet address (has real MOVE tokens)
  TEST_WALLET_ADDRESS: '0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306',
  
  // Contract address on Movement testnet
  CONTRACT_ADDRESS: '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7',
  
  // Network configuration
  NETWORK: {
    name: 'Movement Bardock Testnet',
    chainId: 250,
    rpcUrl: 'https://testnet.movementnetwork.xyz/v1',
    faucetUrl: 'https://faucet.testnet.movementnetwork.xyz',
    explorerUrl: 'https://explorer.movementnetwork.xyz',
  },
  
  // Transaction settings
  TRANSACTION: {
    gasUnitPrice: 100,
    maxGasAmount: 10000,
  },
};

export const getExplorerTxUrl = (txHash: string): string => {
  return `${WALLET_CONFIG.NETWORK.explorerUrl}/txn/${txHash}`;
};

export const getExplorerAccountUrl = (address: string): string => {
  return `${WALLET_CONFIG.NETWORK.explorerUrl}/account/${address}/transactions`;
};

export const formatMOVE = (octas: number): string => {
  return (octas / 100000000).toFixed(8) + ' MOVE';
};

export const toOctas = (move: number): number => {
  return Math.floor(move * 100000000);
};

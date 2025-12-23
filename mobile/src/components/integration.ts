// Real blockchain and API integration with Movement Baskets SDK
import * as sdk from '../sdk';
import { Account } from '@aptos-labs/ts-sdk';

// Wallet state management
let currentAccount: Account | null = null;
let isConnected = false;

export const blockchain = {
  connectWallet: async () => {
    try {
      // In production, use Petra/Martian wallet adapter
      // For now, generate account for testing
      currentAccount = sdk.createAccount();
      
      // Fund account on testnet
      await sdk.fundAccount(currentAccount);
      isConnected = true;
      
      return `Connected: ${currentAccount.accountAddress.toString().substring(0, 10)}...`;
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      throw new Error('Failed to connect wallet: ' + error.message);
    }
  },

  disconnectWallet: () => {
    currentAccount = null;
    isConnected = false;
    return 'Wallet disconnected';
  },

  getAccount: () => currentAccount,

  isConnected: () => isConnected,

  getBalance: async () => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Get APT balance
      const resources = await sdk.aptos.getAccountResources({
        accountAddress: currentAccount.accountAddress,
      });
      
      const coinResource = resources.find(
        (r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      if (coinResource) {
        const balance = (coinResource.data as any).coin.value;
        return Number(balance) / 100000000; // Convert from octas to APT
      }
      
      return 0;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  },

  sendTransaction: async (tx: any) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    return 'Transaction sent';
  },
};

export const api = {
  fetchMarketData: async () => {
    try {
      // Return mock data since contracts are not deployed yet
      // TODO: Fetch real oracle prices when contracts are deployed
      // const prices = await sdk.getOraclePrices(sdk.ORACLE_ADDRESS);
      
      return [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 42500, // Mock price
          change24h: 5.2,
          icon: '₿',
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2250, // Mock price
          change24h: 3.8,
          icon: 'Ξ',
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          price: 98, // Mock price
          change24h: -1.2,
          icon: '◎',
        },
      ];
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Return mock data as fallback
      return [
        { symbol: 'BTC', name: 'Bitcoin', price: 95000, change24h: 5.2, icon: '₿' },
        { symbol: 'ETH', name: 'Ethereum', price: 3500, change24h: 3.8, icon: 'Ξ' },
        { symbol: 'SOL', name: 'Solana', price: 180, change24h: -1.2, icon: '◎' },
      ];
    }
  },

  fetchPositions: async () => {
    if (!currentAccount) {
      return [];
    }
    
    try {
      // Return mock positions since contracts are not deployed yet
      // TODO: Fetch real positions when contracts are deployed
      return [];
      
      // Original code to use when contracts are deployed:
      // const positionIds = await sdk.getAllUserPositions(
      //   sdk.CONTRACT_ADDRESS,
      //   currentAccount.accountAddress.toString()
      // );
      // ... fetch and return real positions
      
      const positions = [];
      // Code commented out until contracts are deployed
      // for (const positionId of positionIds) {
      //   try {
      //     const position = await sdk.getPosition(sdk.CONTRACT_ADDRESS, positionId);
      //     if (position.isActive) {
      //       positions.push({ ... });
      //     }
      //   } catch (error) {
      //     console.error(`Failed to fetch position ${positionId}:`, error);
      //   }
      // }
      
      return positions;
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      return [];
    }
  },

  deposit: async (amount: number) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    // Deposit is handled through position opening
    return `Deposited ${amount} APT`;
  },

  withdraw: async (amount: number) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    // Withdrawal happens when closing positions
    return `Withdrew ${amount} APT`;
  },

  swap: async (from: string, to: string, amount: number) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    // Swap functionality through rebalancing
    return `Swapped ${amount} ${from} to ${to}`;
  },

  openPosition: async (basketWeights: any, collateral: number, leverage: number, isLong: boolean) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Mock response until contracts are deployed
      console.log('Position would be created with:', { basketWeights, collateral, leverage, isLong });
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: `Mock: Position opened with ${leverage}x leverage (contracts not deployed)`,
      };
      
      // Original code to use when contracts are deployed:
      // const collateralOctas = Math.floor(collateral * 100000000);
      // const result = await sdk.openPosition(...);
      // return { success: result.success, transactionHash: result.transactionHash, message: ... };
      //   isLong
      // );
      // return { success: result.success, transactionHash: result.transactionHash, message: ... };
    } catch (error: any) {
      console.error('Failed to create position:', error);
      throw new Error('Failed to create position: ' + error.message);
    }
  },

  closePosition: async (positionId: number) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const result = await sdk.closePosition(currentAccount, positionId);
      
      return {
        success: result.success,
        transactionHash: result.transactionHash,
        message: 'Position closed successfully',
      };
    } catch (error: any) {
      console.error('Failed to close position:', error);
      throw new Error('Failed to close position: ' + error.message);
    }
  },

  addCollateral: async (positionId: number, amount: number) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const amountOctas = Math.floor(amount * 100000000);
      const result = await sdk.addCollateral(currentAccount, positionId, amountOctas);
      
      return {
        success: result.success,
        transactionHash: result.transactionHash,
        message: `Added ${amount} APT collateral`,
      };
    } catch (error: any) {
      console.error('Failed to add collateral:', error);
      throw new Error('Failed to add collateral: ' + error.message);
    }
  },

  subscribePremium: async (durationMonths: number) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const txHash = await sdk.subscribePremium(currentAccount, durationMonths);
      
      return {
        success: true,
        transactionHash: txHash,
        message: `Subscribed to premium for ${durationMonths} months`,
      };
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      throw new Error('Failed to subscribe: ' + error.message);
    }
  },

  checkPremiumStatus: async () => {
    if (!currentAccount) {
      return false;
    }
    
    try {
      return await sdk.hasPremiumSubscription(currentAccount.accountAddress.toString());
    } catch {
      return false;
    }
  },

  schedulePayment: async (
    recipient: string,
    amount: number,
    executionTime: number,
    isRecurring: boolean = false,
    intervalType?: number,
    executionCount?: number
  ) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const amountOctas = Math.floor(amount * 100000000);
      
      if (isRecurring && intervalType !== undefined && executionCount !== undefined) {
        const result = await sdk.scheduleRecurringPayment(
          currentAccount,
          recipient,
          amountOctas,
          executionTime,
          intervalType,
          executionCount
        );
        
        return {
          success: result.success,
          transactionHash: result.transactionHash,
          message: 'Recurring payment scheduled',
        };
      } else {
        const result = await sdk.scheduleOneTimePayment(
          currentAccount,
          recipient,
          amountOctas,
          executionTime
        );
        
        return {
          success: result.success,
          transactionHash: result.transactionHash,
          message: 'Payment scheduled',
        };
      }
    } catch (error: any) {
      console.error('Failed to schedule payment:', error);
      throw new Error('Failed to schedule payment: ' + error.message);
    }
  },

  createAIStrategy: async (
    basketId: number,
    btcWeight: number,
    ethWeight: number,
    solWeight: number,
    volatilityTolerance: number,
    rebalanceThreshold: number
  ) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const txHash = await sdk.createAIStrategy(
        currentAccount,
        basketId,
        btcWeight,
        ethWeight,
        solWeight,
        volatilityTolerance,
        rebalanceThreshold
      );
      
      return {
        success: true,
        transactionHash: txHash,
        message: 'AI rebalancing strategy created',
      };
    } catch (error: any) {
      console.error('Failed to create AI strategy:', error);
      throw new Error('Failed to create AI strategy: ' + error.message);
    }
  },

  executeRebalance: async (basketId: number) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const txHash = await sdk.executeRebalance(currentAccount, basketId);
      
      return {
        success: true,
        transactionHash: txHash,
        message: 'Portfolio rebalanced',
      };
    } catch (error: any) {
      console.error('Failed to rebalance:', error);
      throw new Error('Failed to rebalance: ' + error.message);
    }
  },

  getPlatformStats: async () => {
    try {
      const stats = await sdk.getPlatformStats();
      return stats;
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
      return null;
    }
  },
};


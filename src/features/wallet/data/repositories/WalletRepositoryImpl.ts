import {WalletRepository} from '../../domain/repositories/WalletRepository';
import {
  WalletAccount,
  CreateWalletParams,
  ImportWalletParams,
  SendCoinsParams,
} from '../../domain/entities/WalletAccount';
import {cryptoService} from '@core/services/CryptoService';
import {secureStorageService} from '@core/services/SecureStorageService';
import {movementNetworkClient} from '@core/services/MovementNetworkClient';
import {transactionBuilder} from '@core/services/TransactionBuilder';
import {AppConfig} from '@core/config/app.config';

export class WalletRepositoryImpl implements WalletRepository {
  /**
   * Create a new wallet with mnemonic
   */
  async createWallet(params: CreateWalletParams): Promise<WalletAccount> {
    try {
      // Generate mnemonic
      const mnemonic = cryptoService.generateMnemonic();

      // Derive key pair from mnemonic
      const {privateKey, publicKey} = await cryptoService.deriveKeyPairFromMnemonic(mnemonic);

      // Derive address from public key
      const address = cryptoService.deriveAddress(publicKey);

      // Store wallet data securely
      await secureStorageService.storeMnemonic(mnemonic, params.password);
      await secureStorageService.storePrivateKey(privateKey, params.password);
      await secureStorageService.storePublicKey(publicKey);
      await secureStorageService.storeAddress(address);

      // Create wallet account
      const walletAccount: WalletAccount = {
        address,
        publicKey,
        balance: '0',
        transactionCount: 0,
        createdAt: new Date(),
        isInitialized: false,
      };

      return walletAccount;
    } catch (error: any) {
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  /**
   * Import wallet from mnemonic
   */
  async importWallet(params: ImportWalletParams): Promise<WalletAccount> {
    try {
      // Validate mnemonic
      if (!cryptoService.validateMnemonic(params.mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }

      // Derive key pair from mnemonic
      const {privateKey, publicKey} = await cryptoService.deriveKeyPairFromMnemonic(params.mnemonic);

      // Derive address from public key
      const address = cryptoService.deriveAddress(publicKey);

      // Store wallet data securely
      await secureStorageService.storeMnemonic(params.mnemonic, params.password);
      await secureStorageService.storePrivateKey(privateKey, params.password);
      await secureStorageService.storePublicKey(publicKey);
      await secureStorageService.storeAddress(address);

      // Get balance and check if initialized
      const balance = await this.getBalance(address);
      const isInitialized = await this.isWalletInitialized(address);
      const transactionCount = isInitialized
        ? await this.getTransactionCount(address)
        : 0;

      const walletAccount: WalletAccount = {
        address,
        publicKey,
        balance,
        transactionCount,
        createdAt: new Date(),
        isInitialized,
      };

      return walletAccount;
    } catch (error: any) {
      throw new Error(`Failed to import wallet: ${error.message}`);
    }
  }

  /**
   * Get current wallet
   */
  async getCurrentWallet(): Promise<WalletAccount | null> {
    try {
      const address = await secureStorageService.getAddress();
      if (!address) {
        return null;
      }

      const publicKey = await secureStorageService.getPublicKey();
      if (!publicKey) {
        return null;
      }

      const balance = await this.getBalance(address);
      const isInitialized = await this.isWalletInitialized(address);
      const transactionCount = isInitialized
        ? await this.getTransactionCount(address)
        : 0;

      return {
        address,
        publicKey,
        balance,
        transactionCount,
        createdAt: new Date(),
        isInitialized,
      };
    } catch (error: any) {
      console.error('Error getting current wallet:', error);
      return null;
    }
  }

  /**
   * Initialize wallet on-chain
   */
  async initializeWalletOnChain(privateKey: string): Promise<string> {
    try {
      const publicKey = await this.getPublicKeyFromPrivateKey(privateKey);
      const address = cryptoService.deriveAddress(publicKey);

      // Build initialize wallet transaction
      const rawTransaction = await transactionBuilder.buildInitializeWalletTransaction(address);

      // Sign transaction
      const signedTransaction = await transactionBuilder.signTransaction(
        rawTransaction,
        privateKey,
      );

      // Submit transaction
      const pendingTx = await transactionBuilder.submitTransaction(signedTransaction);

      // Wait for confirmation
      await transactionBuilder.waitForTransactionConfirmation(pendingTx.hash);

      return pendingTx.hash;
    } catch (error: any) {
      throw new Error(`Failed to initialize wallet on-chain: ${error.message}`);
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(address: string): Promise<string> {
    try {
      const account = await movementNetworkClient.getAccount(address);
      
      // Get AptosCoin balance from account resources
      const resources = await movementNetworkClient.getAccountResources(address);
      const coinResource = resources.find(
        (r: any) => r.type === AppConfig.transaction.coinType,
      );

      if (coinResource) {
        return coinResource.data.coin.value;
      }

      return '0';
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return '0';
      }
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Check if wallet is initialized on-chain
   */
  async isWalletInitialized(address: string): Promise<boolean> {
    try {
      const result = await movementNetworkClient.viewFunction(
        AppConfig.contract.address,
        'wallet',
        'is_wallet_initialized',
        [],
        [address],
      );

      return result[0] as boolean;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send coins
   */
  async sendCoins(params: SendCoinsParams): Promise<string> {
    try {
      const publicKey = await this.getPublicKeyFromPrivateKey(params.privateKey);
      const senderAddress = cryptoService.deriveAddress(publicKey);

      // Build send coins transaction
      const rawTransaction = await transactionBuilder.buildSendCoinsTransaction(
        senderAddress,
        params.recipientAddress,
        params.amount,
      );

      // Sign transaction
      const signedTransaction = await transactionBuilder.signTransaction(
        rawTransaction,
        params.privateKey,
      );

      // Simulate transaction first
      const simulation = await transactionBuilder.simulateTransaction(signedTransaction);
      if (!simulation.success) {
        throw new Error(`Transaction simulation failed: ${simulation.error}`);
      }

      // Submit transaction
      const pendingTx = await transactionBuilder.submitTransaction(signedTransaction);

      // Wait for confirmation
      await transactionBuilder.waitForTransactionConfirmation(pendingTx.hash);

      return pendingTx.hash;
    } catch (error: any) {
      throw new Error(`Failed to send coins: ${error.message}`);
    }
  }

  /**
   * Get transaction count
   */
  async getTransactionCount(address: string): Promise<number> {
    try {
      const result = await movementNetworkClient.viewFunction(
        AppConfig.contract.address,
        'wallet',
        'get_transaction_count',
        [],
        [address],
      );

      return parseInt(result[0] as string, 10);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Export private key
   */
  async exportPrivateKey(password: string): Promise<string> {
    try {
      const privateKey = await secureStorageService.getPrivateKey(password);
      if (!privateKey) {
        throw new Error('Private key not found');
      }
      return privateKey;
    } catch (error: any) {
      throw new Error(`Failed to export private key: ${error.message}`);
    }
  }

  /**
   * Delete wallet
   */
  async deleteWallet(): Promise<boolean> {
    try {
      await secureStorageService.deleteWallet();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete wallet: ${error.message}`);
    }
  }

  /**
   * Get mnemonic
   */
  async getMnemonic(password: string): Promise<string> {
    try {
      const mnemonic = await secureStorageService.getMnemonic(password);
      if (!mnemonic) {
        throw new Error('Mnemonic not found');
      }
      return mnemonic;
    } catch (error: any) {
      throw new Error(`Failed to get mnemonic: ${error.message}`);
    }
  }

  /**
   * Get public key from private key
   */
  private async getPublicKeyFromPrivateKey(privateKeyHex: string): Promise<string> {
    const nacl = require('tweetnacl');
    const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');
    const keyPair = nacl.sign.keyPair.fromSeed(privateKeyBytes.slice(0, 32));
    return Buffer.from(keyPair.publicKey).toString('hex');
  }
}

export const walletRepository = new WalletRepositoryImpl();

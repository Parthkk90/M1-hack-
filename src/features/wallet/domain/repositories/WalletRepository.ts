import {
  WalletAccount,
  CreateWalletParams,
  ImportWalletParams,
  SendCoinsParams,
} from '../entities/WalletAccount';

export interface WalletRepository {
  /**
   * Create a new wallet with mnemonic
   */
  createWallet(params: CreateWalletParams): Promise<WalletAccount>;

  /**
   * Import wallet from mnemonic
   */
  importWallet(params: ImportWalletParams): Promise<WalletAccount>;

  /**
   * Get current wallet
   */
  getCurrentWallet(): Promise<WalletAccount | null>;

  /**
   * Initialize wallet on-chain
   */
  initializeWalletOnChain(privateKey: string): Promise<string>;

  /**
   * Get wallet balance
   */
  getBalance(address: string): Promise<string>;

  /**
   * Check if wallet is initialized on-chain
   */
  isWalletInitialized(address: string): Promise<boolean>;

  /**
   * Send coins
   */
  sendCoins(params: SendCoinsParams): Promise<string>;

  /**
   * Get transaction count
   */
  getTransactionCount(address: string): Promise<number>;

  /**
   * Export private key
   */
  exportPrivateKey(password: string): Promise<string>;

  /**
   * Delete wallet
   */
  deleteWallet(): Promise<boolean>;

  /**
   * Get mnemonic
   */
  getMnemonic(password: string): Promise<string>;
}

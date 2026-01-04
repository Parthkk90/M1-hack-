import {Transaction, TransactionHistoryParams} from '../entities/Transaction';

export interface TransactionRepository {
  /**
   * Get transaction history for an address
   */
  getTransactionHistory(params: TransactionHistoryParams): Promise<Transaction[]>;

  /**
   * Get transaction by hash
   */
  getTransactionByHash(hash: string): Promise<Transaction>;

  /**
   * Get pending transactions
   */
  getPendingTransactions(address: string): Promise<Transaction[]>;

  /**
   * Wait for transaction confirmation
   */
  waitForTransaction(hash: string, timeoutMs?: number): Promise<Transaction>;
}

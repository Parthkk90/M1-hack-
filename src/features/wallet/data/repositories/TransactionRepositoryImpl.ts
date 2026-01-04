import {TransactionRepository} from '../../domain/repositories/TransactionRepository';
import {
  Transaction,
  TransactionHistoryParams,
  TransactionType,
  TransactionStatus,
} from '../../domain/entities/Transaction';
import {movementNetworkClient} from '@core/services/MovementNetworkClient';
import {transactionBuilder} from '@core/services/TransactionBuilder';

export class TransactionRepositoryImpl implements TransactionRepository {
  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(
    params: TransactionHistoryParams,
  ): Promise<Transaction[]> {
    try {
      const transactions = await movementNetworkClient.getAccountTransactions(
        params.address,
        params.limit || 50,
        params.offset,
      );

      return transactions.map((tx: any) => this.mapToTransaction(tx));
    } catch (error: any) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(hash: string): Promise<Transaction> {
    try {
      const tx = await movementNetworkClient.getTransaction(hash);
      return this.mapToTransaction(tx);
    } catch (error: any) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Get pending transactions
   */
  async getPendingTransactions(address: string): Promise<Transaction[]> {
    try {
      // Get recent transactions
      const transactions = await movementNetworkClient.getAccountTransactions(
        address,
        10,
      );

      // Filter pending transactions
      return transactions
        .filter((tx: any) => tx.success === undefined)
        .map((tx: any) => this.mapToTransaction(tx));
    } catch (error: any) {
      throw new Error(`Failed to get pending transactions: ${error.message}`);
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    hash: string,
    timeoutMs: number = 60000,
  ): Promise<Transaction> {
    try {
      const result = await transactionBuilder.waitForTransactionConfirmation(
        hash,
        timeoutMs,
      );

      const tx = await movementNetworkClient.getTransaction(hash);
      return this.mapToTransaction(tx);
    } catch (error: any) {
      throw new Error(`Failed to wait for transaction: ${error.message}`);
    }
  }

  /**
   * Map API transaction to domain transaction
   */
  private mapToTransaction(tx: any): Transaction {
    const type = this.getTransactionType(tx);
    const status = this.getTransactionStatus(tx);

    return {
      hash: tx.hash,
      from: tx.sender,
      to: this.extractRecipient(tx),
      amount: this.extractAmount(tx),
      timestamp: new Date(parseInt(tx.timestamp, 10) / 1000), // Convert microseconds to ms
      type,
      status,
      gasFee: tx.gas_used,
      errorMessage: tx.success === false ? tx.vm_status : undefined,
    };
  }

  /**
   * Get transaction type from payload
   */
  private getTransactionType(tx: any): TransactionType {
    if (!tx.payload || !tx.payload.function) {
      return TransactionType.SEND;
    }

    const functionName = tx.payload.function;

    if (functionName.includes('send_coins')) {
      return TransactionType.SEND;
    } else if (functionName.includes('basket')) {
      return TransactionType.BASKET;
    } else if (functionName.includes('schedule') || functionName.includes('execute_scheduled')) {
      return TransactionType.SCHEDULED;
    }

    return TransactionType.SEND;
  }

  /**
   * Get transaction status
   */
  private getTransactionStatus(tx: any): TransactionStatus {
    if (tx.success === undefined) {
      return TransactionStatus.PENDING;
    }

    return tx.success
      ? TransactionStatus.COMPLETED
      : TransactionStatus.FAILED;
  }

  /**
   * Extract recipient address from transaction
   */
  private extractRecipient(tx: any): string {
    if (tx.payload && tx.payload.arguments && tx.payload.arguments.length > 0) {
      return tx.payload.arguments[0];
    }
    return tx.sender;
  }

  /**
   * Extract amount from transaction
   */
  private extractAmount(tx: any): string {
    if (tx.payload && tx.payload.arguments && tx.payload.arguments.length > 1) {
      return tx.payload.arguments[1];
    }
    return '0';
  }
}

export const transactionRepository = new TransactionRepositoryImpl();

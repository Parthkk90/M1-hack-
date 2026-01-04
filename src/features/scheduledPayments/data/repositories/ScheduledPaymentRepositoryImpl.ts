import {ScheduledPaymentRepository} from '../../domain/repositories/ScheduledPaymentRepository';
import {
  ScheduledPayment,
  CreateScheduledPaymentParams,
  ExecuteScheduledPaymentParams,
} from '../../domain/entities/ScheduledPayment';
import {movementNetworkClient} from '@core/services/MovementNetworkClient';
import {transactionBuilder} from '@core/services/TransactionBuilder';
import {cryptoService} from '@core/services/CryptoService';
import {AppConfig} from '@core/config/app.config';

export class ScheduledPaymentRepositoryImpl implements ScheduledPaymentRepository {
  /**
   * Create a scheduled payment
   */
  async schedulePayment(params: CreateScheduledPaymentParams): Promise<string> {
    try {
      const publicKey = await this.getPublicKeyFromPrivateKey(params.privateKey);
      const senderAddress = cryptoService.deriveAddress(publicKey);

      const intervalSeconds = params.interval || 0;

      // Build schedule payment transaction
      const rawTransaction = await transactionBuilder.buildSchedulePaymentTransaction(
        senderAddress,
        params.recipientAddress,
        params.amount,
        params.executionTime,
        intervalSeconds,
      );

      // Sign transaction
      const signedTransaction = await transactionBuilder.signTransaction(
        rawTransaction,
        params.privateKey,
      );

      // Submit transaction
      const pendingTx = await transactionBuilder.submitTransaction(signedTransaction);

      // Wait for confirmation
      await transactionBuilder.waitForTransactionConfirmation(pendingTx.hash);

      return pendingTx.hash;
    } catch (error: any) {
      throw new Error(`Failed to schedule payment: ${error.message}`);
    }
  }

  /**
   * Execute a scheduled payment
   */
  async executeScheduledPayment(
    params: ExecuteScheduledPaymentParams,
  ): Promise<string> {
    try {
      const publicKey = await this.getPublicKeyFromPrivateKey(params.privateKey);
      const senderAddress = cryptoService.deriveAddress(publicKey);

      // Build execute scheduled payment transaction
      const rawTransaction = await transactionBuilder.buildExecuteScheduledPaymentTransaction(
        senderAddress,
        params.paymentId,
      );

      // Sign transaction
      const signedTransaction = await transactionBuilder.signTransaction(
        rawTransaction,
        params.privateKey,
      );

      // Submit transaction
      const pendingTx = await transactionBuilder.submitTransaction(signedTransaction);

      // Wait for confirmation
      await transactionBuilder.waitForTransactionConfirmation(pendingTx.hash);

      return pendingTx.hash;
    } catch (error: any) {
      throw new Error(`Failed to execute scheduled payment: ${error.message}`);
    }
  }

  /**
   * Get all scheduled payments for an address
   */
  async getScheduledPayments(address: string): Promise<ScheduledPayment[]> {
    try {
      // Get the ScheduledPayments resource
      const resource = await movementNetworkClient.getAccountResource(
        address,
        `${AppConfig.contract.address}::wallet::ScheduledPayments`,
      );

      if (!resource || !resource.data || !resource.data.payments) {
        return [];
      }

      const payments = resource.data.payments as any[];
      return payments.map(p => this.mapToScheduledPayment(p));
    } catch (error: any) {
      throw new Error(`Failed to get scheduled payments: ${error.message}`);
    }
  }

  /**
   * Get due payments
   */
  async getDuePayments(address: string): Promise<ScheduledPayment[]> {
    try {
      const allPayments = await this.getScheduledPayments(address);
      const now = new Date();

      return allPayments.filter(
        p => !p.isExecuted && p.executionTime <= now,
      );
    } catch (error: any) {
      throw new Error(`Failed to get due payments: ${error.message}`);
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(
    address: string,
    paymentId: string,
  ): Promise<ScheduledPayment> {
    try {
      const allPayments = await this.getScheduledPayments(address);
      const payment = allPayments.find(p => p.id === paymentId);

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error: any) {
      throw new Error(`Failed to get payment by ID: ${error.message}`);
    }
  }

  /**
   * Map contract payment to domain scheduled payment
   */
  private mapToScheduledPayment(p: any): ScheduledPayment {
    return {
      id: p.id.toString(),
      recipientAddress: p.recipient,
      amount: p.amount.toString(),
      executionTime: new Date(parseInt(p.execution_time, 10) * 1000),
      interval: p.interval > 0 ? parseInt(p.interval, 10) : undefined,
      isExecuted: p.executed,
      createdAt: new Date(parseInt(p.created_at, 10) * 1000),
    };
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

export const scheduledPaymentRepository = new ScheduledPaymentRepositoryImpl();

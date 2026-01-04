import {
  ScheduledPayment,
  CreateScheduledPaymentParams,
  ExecuteScheduledPaymentParams,
} from '../entities/ScheduledPayment';

export interface ScheduledPaymentRepository {
  /**
   * Create a scheduled payment
   */
  schedulePayment(params: CreateScheduledPaymentParams): Promise<string>;

  /**
   * Execute a scheduled payment
   */
  executeScheduledPayment(params: ExecuteScheduledPaymentParams): Promise<string>;

  /**
   * Get all scheduled payments for an address
   */
  getScheduledPayments(address: string): Promise<ScheduledPayment[]>;

  /**
   * Get due payments
   */
  getDuePayments(address: string): Promise<ScheduledPayment[]>;

  /**
   * Get payment by ID
   */
  getPaymentById(address: string, paymentId: string): Promise<ScheduledPayment>;
}

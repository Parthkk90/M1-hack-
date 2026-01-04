export interface ScheduledPayment {
  id: string;
  recipientAddress: string;
  amount: string;
  executionTime: Date;
  interval?: number; // in seconds, null for one-time
  isExecuted: boolean;
  createdAt: Date;
  description?: string;
}

export interface CreateScheduledPaymentParams {
  privateKey: string;
  recipientAddress: string;
  amount: string;
  executionTime: Date;
  interval?: number;
  description?: string;
}

export interface ExecuteScheduledPaymentParams {
  privateKey: string;
  paymentId: string;
}

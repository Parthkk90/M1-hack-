export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  BASKET = 'basket',
  SCHEDULED = 'scheduled',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: Date;
  type: TransactionType;
  status: TransactionStatus;
  gasFee?: string;
  errorMessage?: string;
}

export interface TransactionHistoryParams {
  address: string;
  limit?: number;
  offset?: number;
}

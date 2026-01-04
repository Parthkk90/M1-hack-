export interface WalletAccount {
  address: string;
  publicKey: string;
  privateKey?: string; // Encrypted
  balance: string;
  transactionCount: number;
  createdAt: Date;
  isInitialized: boolean;
}

export interface CreateWalletParams {
  password: string;
}

export interface ImportWalletParams {
  mnemonic: string;
  password: string;
}

export interface SendCoinsParams {
  privateKey: string;
  recipientAddress: string;
  amount: string;
}

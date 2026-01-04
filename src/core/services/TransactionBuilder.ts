import {BCS} from 'aptos';
import {AppConfig} from '../config/app.config';
import {cryptoService} from './CryptoService';
import {movementNetworkClient} from './MovementNetworkClient';

export class TransactionBuilder {
  /**
   * Build raw transaction for sending coins
   */
  async buildSendCoinsTransaction(
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    memo: string = 'Payment from Cresca Wallet',
  ): Promise<RawTransaction> {
    const account = await movementNetworkClient.getAccount(senderAddress);
    
    const payload = {
      type: 'entry_function_payload',
      function: `${AppConfig.contract.address}::payments::send_payment`,
      type_arguments: [],
      arguments: [recipientAddress, amount, memo],
    };

    return {
      sender: senderAddress,
      sequence_number: account.sequence_number,
      max_gas_amount: AppConfig.transaction.maxGasAmount.toString(),
      gas_unit_price: AppConfig.transaction.gasUnitPrice.toString(),
      expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + AppConfig.transaction.timeoutSeconds).toString(),
      payload,
      chain_id: parseInt(AppConfig.movementNetwork.chainId),
    };
  }

  /**
   * Build transaction for initializing wallet
   */
  async buildInitializeWalletTransaction(
    senderAddress: string,
  ): Promise<RawTransaction> {
    const account = await movementNetworkClient.getAccount(senderAddress);
    
    const payload = {
      type: 'entry_function_payload',
      function: `${AppConfig.contract.address}::payments::initialize`,
      type_arguments: [],
      arguments: [],
    };

    return {
      sender: senderAddress,
      sequence_number: account.sequence_number,
      max_gas_amount: AppConfig.transaction.maxGasAmount.toString(),
      gas_unit_price: AppConfig.transaction.gasUnitPrice.toString(),
      expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + AppConfig.transaction.timeoutSeconds).toString(),
      payload,
      chain_id: parseInt(AppConfig.movementNetwork.chainId),
    };
  }

  /**
   * Build transaction for scheduling payment
   */
  async buildSchedulePaymentTransaction(
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    executionTime: Date,
    interval: number = 0,
  ): Promise<RawTransaction> {
    const account = await movementNetworkClient.getAccount(senderAddress);
    const executionTimestamp = Math.floor(executionTime.getTime() / 1000);
    
    const payload = {
      type: 'entry_function_payload',
      function: `${AppConfig.contract.address}::wallet::schedule_payment`,
      type_arguments: [],
      arguments: [recipientAddress, amount, executionTimestamp.toString(), interval.toString()],
    };

    return {
      sender: senderAddress,
      sequence_number: account.sequence_number,
      max_gas_amount: AppConfig.transaction.maxGasAmount.toString(),
      gas_unit_price: AppConfig.transaction.gasUnitPrice.toString(),
      expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + AppConfig.transaction.timeoutSeconds).toString(),
      payload,
      chain_id: parseInt(AppConfig.movementNetwork.chainId),
    };
  }

  /**
   * Build transaction for executing scheduled payment
   */
  async buildExecuteScheduledPaymentTransaction(
    senderAddress: string,
    paymentId: string,
  ): Promise<RawTransaction> {
    const account = await movementNetworkClient.getAccount(senderAddress);
    
    const payload = {
      type: 'entry_function_payload',
      function: `${AppConfig.contract.address}::wallet::execute_scheduled_payment`,
      type_arguments: [],
      arguments: [paymentId],
    };

    return {
      sender: senderAddress,
      sequence_number: account.sequence_number,
      max_gas_amount: AppConfig.transaction.maxGasAmount.toString(),
      gas_unit_price: AppConfig.transaction.gasUnitPrice.toString(),
      expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + AppConfig.transaction.timeoutSeconds).toString(),
      payload,
      chain_id: parseInt(AppConfig.movementNetwork.chainId),
    };
  }

  /**
   * Build transaction for creating basket
   */
  async buildCreateBasketTransaction(
    senderAddress: string,
    name: string,
    initialValue: string,
  ): Promise<RawTransaction> {
    const account = await movementNetworkClient.getAccount(senderAddress);
    
    // Convert name to hex bytes
    const nameBytes = Buffer.from(name).toString('hex');
    
    const payload = {
      type: 'entry_function_payload',
      function: `${AppConfig.contract.address}::wallet::create_basket`,
      type_arguments: [],
      arguments: [`0x${nameBytes}`, initialValue],
    };

    return {
      sender: senderAddress,
      sequence_number: account.sequence_number,
      max_gas_amount: AppConfig.transaction.maxGasAmount.toString(),
      gas_unit_price: AppConfig.transaction.gasUnitPrice.toString(),
      expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + AppConfig.transaction.timeoutSeconds).toString(),
      payload,
      chain_id: parseInt(AppConfig.movementNetwork.chainId),
    };
  }

  /**
   * Build transaction for tap-to-pay (quick payment without memo)
   */
  async buildTapToPayTransaction(
    senderAddress: string,
    recipientAddress: string,
    amount: string,
  ): Promise<RawTransaction> {
    const account = await movementNetworkClient.getAccount(senderAddress);
    
    const payload = {
      type: 'entry_function_payload',
      function: `${AppConfig.contract.address}::payments::tap_to_pay`,
      type_arguments: [],
      arguments: [recipientAddress, amount],
    };

    return {
      sender: senderAddress,
      sequence_number: account.sequence_number,
      max_gas_amount: AppConfig.transaction.maxGasAmount.toString(),
      gas_unit_price: AppConfig.transaction.gasUnitPrice.toString(),
      expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + AppConfig.transaction.timeoutSeconds).toString(),
      payload,
      chain_id: parseInt(AppConfig.movementNetwork.chainId),
    };
  }

  /**
   * Build transaction for batch send (multiple recipients)
   */
  async buildBatchSendTransaction(
    senderAddress: string,
    recipients: string[],
    amounts: string[],
  ): Promise<RawTransaction> {
    const account = await movementNetworkClient.getAccount(senderAddress);
    
    if (recipients.length !== amounts.length) {
      throw new Error('Recipients and amounts arrays must have the same length');
    }
    
    const payload = {
      type: 'entry_function_payload',
      function: `${AppConfig.contract.address}::payments::batch_send`,
      type_arguments: [],
      arguments: [recipients, amounts],
    };

    return {
      sender: senderAddress,
      sequence_number: account.sequence_number,
      max_gas_amount: AppConfig.transaction.maxGasAmount.toString(),
      gas_unit_price: AppConfig.transaction.gasUnitPrice.toString(),
      expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + AppConfig.transaction.timeoutSeconds).toString(),
      payload,
      chain_id: parseInt(AppConfig.movementNetwork.chainId),
    };
  }

  /**
   * Sign transaction with private key
   */
  async signTransaction(
    rawTransaction: RawTransaction,
    privateKeyHex: string,
  ): Promise<SignedTransaction> {
    // Serialize the transaction
    const serialized = this.serializeTransaction(rawTransaction);
    
    // Create signing message: SHA3-256("APTOS::RawTransaction" + serialized_transaction)
    const {sha3_256} = require('js-sha3');
    const prefix = Buffer.from('APTOS::RawTransaction');
    const message = Buffer.concat([prefix, Buffer.from(serialized)]);
    const messageHash = Buffer.from(sha3_256(message), 'hex');

    // Sign the message
    const signature = await cryptoService.signMessage(privateKeyHex, messageHash);
    const publicKey = await this.getPublicKeyFromPrivateKey(privateKeyHex);

    return {
      ...rawTransaction,
      signature: {
        type: 'ed25519_signature',
        public_key: `0x${publicKey}`,
        signature: `0x${Buffer.from(signature).toString('hex')}`,
      },
    };
  }

  /**
   * Serialize transaction for signing
   */
  private serializeTransaction(transaction: RawTransaction): Uint8Array {
    // This is a simplified serialization. In production, use proper BCS serialization
    // from the Aptos SDK
    const data = JSON.stringify(transaction);
    return Buffer.from(data);
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

  /**
   * Simulate transaction before submission
   */
  async simulateTransaction(
    signedTransaction: SignedTransaction,
  ): Promise<SimulationResult> {
    const result = await movementNetworkClient.simulateTransaction(
      signedTransaction,
    );
    
    if (result.length > 0) {
      const simulation = result[0];
      return {
        success: simulation.success,
        gasUsed: simulation.gas_used,
        vmStatus: simulation.vm_status,
        error: simulation.success ? undefined : simulation.vm_status,
      };
    }

    throw new Error('Transaction simulation failed');
  }

  /**
   * Submit signed transaction
   */
  async submitTransaction(
    signedTransaction: SignedTransaction,
  ): Promise<PendingTransaction> {
    const result = await movementNetworkClient.submitTransaction(
      signedTransaction,
    );
    
    return {
      hash: result.hash,
      sender: result.sender,
      sequenceNumber: result.sequence_number,
      payload: result.payload,
    };
  }

  /**
   * Wait for transaction to be confirmed
   */
  async waitForTransactionConfirmation(
    transactionHash: string,
    timeoutMs: number = 60000,
  ): Promise<TransactionResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const transaction = await movementNetworkClient.getTransaction(
          transactionHash,
        );

        if (transaction.success !== undefined) {
          return {
            success: transaction.success,
            hash: transaction.hash,
            gasUsed: transaction.gas_used,
            vmStatus: transaction.vm_status,
            timestamp: transaction.timestamp,
          };
        }
      } catch (error) {
        // Transaction not yet available, wait and retry
      }

      await this.sleep(1000); // Wait 1 second before retry
    }

    throw new Error('Transaction confirmation timeout');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface RawTransaction {
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  payload: any;
  chain_id: number;
}

export interface SignedTransaction extends RawTransaction {
  signature: {
    type: string;
    public_key: string;
    signature: string;
  };
}

export interface PendingTransaction {
  hash: string;
  sender: string;
  sequenceNumber: string;
  payload: any;
}

export interface TransactionResult {
  success: boolean;
  hash: string;
  gasUsed: string;
  vmStatus: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  gasUsed: string;
  vmStatus: string;
  error?: string;
}

export const transactionBuilder = new TransactionBuilder();

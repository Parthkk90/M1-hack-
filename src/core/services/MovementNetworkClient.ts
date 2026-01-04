import axios, {AxiosInstance, AxiosError} from 'axios';
import {AppConfig} from '../config/app.config';

export class MovementNetworkClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: AppConfig.movementNetwork.url,
      timeout: AppConfig.api.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        console.error('Network Error:', error.message);
        throw this.handleError(error);
      },
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please try again.');
    }

    if (!error.response) {
      return new Error('Network error. Please check your connection.');
    }

    const {status, data} = error.response;

    if (status === 404) {
      return new Error('Resource not found');
    }

    if (data && typeof data === 'object' && 'message' in data) {
      return new Error(data.message as string);
    }

    return new Error(`Server error: ${status}`);
  }

  /**
   * Get account information
   */
  async getAccount(address: string): Promise<any> {
    const response = await this.client.get(`/accounts/${address}`);
    return response.data;
  }

  /**
   * Get account resources
   */
  async getAccountResources(address: string): Promise<any[]> {
    const response = await this.client.get(`/accounts/${address}/resources`);
    return response.data;
  }

  /**
   * Get specific account resource
   */
  async getAccountResource(
    address: string,
    resourceType: string,
  ): Promise<any | null> {
    try {
      const response = await this.client.get(
        `/accounts/${address}/resource/${resourceType}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Submit transaction
   */
  async submitTransaction(signedTransaction: any): Promise<any> {
    const response = await this.client.post('/transactions', signedTransaction);
    return response.data;
  }

  /**
   * Simulate transaction
   */
  async simulateTransaction(transaction: any): Promise<any[]> {
    const response = await this.client.post(
      '/transactions/simulate',
      transaction,
    );
    return response.data;
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: string): Promise<any> {
    const response = await this.client.get(`/transactions/by_hash/${hash}`);
    return response.data;
  }

  /**
   * Wait for transaction
   */
  async waitForTransaction(hash: string): Promise<any> {
    const response = await this.client.get(`/transactions/by_hash/${hash}`);
    return response.data;
  }

  /**
   * Get account transactions
   */
  async getAccountTransactions(
    address: string,
    limit?: number,
    start?: number,
  ): Promise<any[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (start) params.start = start;

    const response = await this.client.get(
      `/accounts/${address}/transactions`,
      {params},
    );
    return response.data;
  }

  /**
   * Estimate gas
   */
  async estimateGas(transaction: any): Promise<any> {
    const simulations = await this.simulateTransaction(transaction);
    if (simulations.length > 0) {
      return simulations[0];
    }
    throw new Error('Gas estimation failed');
  }

  /**
   * View function (read-only contract call)
   */
  async viewFunction(
    moduleAddress: string,
    moduleName: string,
    functionName: string,
    typeArguments: string[],
    args: any[],
  ): Promise<any[]> {
    const payload = {
      function: `${moduleAddress}::${moduleName}::${functionName}`,
      type_arguments: typeArguments,
      arguments: args,
    };

    const response = await this.client.post('/view', payload);
    return response.data;
  }

  /**
   * Check if payment history is initialized for address
   */
  async isPaymentInitialized(address: string): Promise<boolean> {
    try {
      const result = await this.viewFunction(
        AppConfig.contract.address,
        'payments',
        'is_initialized',
        [],
        [address],
      );
      return result[0] as boolean;
    } catch {
      return false;
    }
  }

  /**
   * Get payment count for address (sent, received)
   */
  async getPaymentCount(address: string): Promise<{sent: number; received: number}> {
    try {
      const result = await this.viewFunction(
        AppConfig.contract.address,
        'payments',
        'get_payment_count',
        [],
        [address],
      );
      return {
        sent: parseInt(result[0]),
        received: parseInt(result[1]),
      };
    } catch {
      return {sent: 0, received: 0};
    }
  }

  /**
   * Get total payment volume for address (sent, received)
   */
  async getTotalVolume(address: string): Promise<{sent: string; received: string}> {
    try {
      const result = await this.viewFunction(
        AppConfig.contract.address,
        'payments',
        'get_total_volume',
        [],
        [address],
      );
      return {
        sent: result[0],
        received: result[1],
      };
    } catch {
      return {sent: '0', received: '0'};
    }
  }

  /**
   * Get payment history resource for address
   */
  async getPaymentHistory(address: string): Promise<any | null> {
    try {
      return await this.getAccountResource(
        address,
        `${AppConfig.contract.address}::payments::PaymentHistory`,
      );
    } catch {
      return null;
    }
  }
}

export const movementNetworkClient = new MovementNetworkClient();

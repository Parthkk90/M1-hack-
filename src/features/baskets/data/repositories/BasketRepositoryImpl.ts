import {BasketRepository} from '../../domain/repositories/BasketRepository';
import {Basket, CreateBasketParams} from '../../domain/entities/Basket';
import {movementNetworkClient} from '@core/services/MovementNetworkClient';
import {transactionBuilder} from '@core/services/TransactionBuilder';
import {cryptoService} from '@core/services/CryptoService';
import {AppConfig} from '@core/config/app.config';

export class BasketRepositoryImpl implements BasketRepository {
  /**
   * Create a new basket
   */
  async createBasket(params: CreateBasketParams): Promise<string> {
    try {
      const publicKey = await this.getPublicKeyFromPrivateKey(params.privateKey);
      const senderAddress = cryptoService.deriveAddress(publicKey);

      // Build create basket transaction
      const rawTransaction = await transactionBuilder.buildCreateBasketTransaction(
        senderAddress,
        params.name,
        params.initialValue,
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
      throw new Error(`Failed to create basket: ${error.message}`);
    }
  }

  /**
   * Get all baskets for an address
   */
  async getBaskets(address: string): Promise<Basket[]> {
    try {
      // Get the Baskets resource
      const resource = await movementNetworkClient.getAccountResource(
        address,
        `${AppConfig.contract.address}::wallet::Baskets`,
      );

      if (!resource || !resource.data || !resource.data.owned_baskets) {
        return [];
      }

      const baskets = resource.data.owned_baskets as any[];
      return baskets.map(b => this.mapToBasket(b));
    } catch (error: any) {
      throw new Error(`Failed to get baskets: ${error.message}`);
    }
  }

  /**
   * Get basket by ID
   */
  async getBasketById(address: string, basketId: string): Promise<Basket> {
    try {
      const allBaskets = await this.getBaskets(address);
      const basket = allBaskets.find(b => b.id === basketId);

      if (!basket) {
        throw new Error('Basket not found');
      }

      return basket;
    } catch (error: any) {
      throw new Error(`Failed to get basket by ID: ${error.message}`);
    }
  }

  /**
   * Get basket count
   */
  async getBasketCount(address: string): Promise<number> {
    try {
      const result = await movementNetworkClient.viewFunction(
        AppConfig.contract.address,
        'wallet',
        'get_basket_count',
        [],
        [address],
      );

      return parseInt(result[0] as string, 10);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Map contract basket to domain basket
   */
  private mapToBasket(b: any): Basket {
    // Convert name from hex bytes to string
    const nameHex = b.name.replace('0x', '');
    const name = Buffer.from(nameHex, 'hex').toString('utf8');

    return {
      id: b.id.toString(),
      name,
      totalValue: b.total_value.toString(),
      createdAt: new Date(parseInt(b.created_at, 10) * 1000),
      ownerAddress: b.owner,
      assets: [], // Will be populated when we add basket asset management
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

export const basketRepository = new BasketRepositoryImpl();

import {Basket, CreateBasketParams} from '../entities/Basket';

export interface BasketRepository {
  /**
   * Create a new basket
   */
  createBasket(params: CreateBasketParams): Promise<string>;

  /**
   * Get all baskets for an address
   */
  getBaskets(address: string): Promise<Basket[]>;

  /**
   * Get basket by ID
   */
  getBasketById(address: string, basketId: string): Promise<Basket>;

  /**
   * Get basket count
   */
  getBasketCount(address: string): Promise<number>;
}

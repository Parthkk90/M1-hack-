export interface Basket {
  id: string;
  name: string;
  totalValue: string;
  createdAt: Date;
  ownerAddress: string;
  assets: BasketAsset[];
}

export interface BasketAsset {
  symbol: string;
  amount: string;
  percentage: number;
}

export interface CreateBasketParams {
  privateKey: string;
  name: string;
  initialValue: string;
}

export type AssetType = {
  name: string;
  assetSymbol: string;
  exchange: string;
  type: string;
  price: number;
};

export type PortfolioType = {
  id: string;
  name: string;
  userId: string;
  assets: Array<{
    portfolioId: string;
    assetId: string;
    quantity: number;
    price: number;
    avgBuyPrice: number;
    assets: {
      id: string;
      name: string;
      asset: string;
      exchange: string;
      type: string;
      dataSource: string;
      updatedAt: string;
    };
  }>;
};

export type TransactionType = {
  BUY
  SELL
}

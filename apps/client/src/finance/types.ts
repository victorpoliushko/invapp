export type ToUsd = (amount: number, currency: string) => number;

export type TradeType = "BUY" | "SELL";

export type Trade = { type: TradeType; quantityChange: number; pricePerUnit: number; date: string };

export type HoldingPosition = {
  quantity: number;
  price?: number | null;
  asset: { ticker: string; type?: string | null; exchange?: string | null; currentPrice?: number | null };
  transactions?: Trade[];
};

export type HoldingBond = {
  isin: string;
  faceValue: number;
  couponRate: number;
  quantity: number;
  purchasePrice: number;
  currentValue: number | null;
  currency?: string;
  purchaseDate: string;
  maturityDate: string | null;
};

export type HoldingProperty = {
  name?: string | null;
  code?: string | null;
  type: string;
  purchaseDate?: string;
  purchasePrice: number;
  currentValue: number | null;
  transactions?: { startDate: string; endDate: string; monthlyRent: number }[];
};

export type HoldingMixedAsset = {
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number | null;
};

export type HoldingCash = { amount: number; currency: string; category?: string | null };

export type Holdings = {
  stockPositions?: HoldingPosition[];
  cryptoPositions?: HoldingPosition[];
  bonds?: HoldingBond[];
  realEstateAssets?: HoldingProperty[];
  mixedAssets?: HoldingMixedAsset[];
  cash?: HoldingCash[];
};

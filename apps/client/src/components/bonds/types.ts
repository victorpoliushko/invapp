export type CouponFrequency = 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY';

export type BondTransaction = {
  id: string;
  bondId: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  pricePerUnit: number;
  date: string;
};

export type Bond = {
  id: string;
  isin: string;
  name: string;
  faceValue: number;
  couponRate: number;
  couponFrequency: CouponFrequency;
  quantity: number;
  purchasePrice: number;
  currentValue: number | null;
  purchaseDate: string;
  maturityDate: string | null;
};

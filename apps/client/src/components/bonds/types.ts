export type CouponFrequency = 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY';

export type BondTransaction = {
  id: string;
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
  maturityDate: string;
  transactions: BondTransaction[];
};

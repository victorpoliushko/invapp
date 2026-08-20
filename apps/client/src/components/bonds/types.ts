export type CouponFrequency = 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY';

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

export type Role = "ADMIN" | "EDITOR" | "USER";

export type AssetType =
  | "BOND"
  | "CASH"
  | "COMMODITY"
  | "CRYPTOCURRENCY"
  | "ETF"
  | "MUTUALFUND"
  | "PRECIOUS_METAL"
  | "PRIVATE_EQUITY"
  | "Stock";

export type DataSource = "ALPHA_VANTAGE" | "COINGECKO";

export type TransactionType = "BUY" | "SELL";

export type RealEstateType = "APARTMENT" | "HOUSE" | "COMMERCIAL";

export type CouponFrequency = "ANNUAL" | "SEMI_ANNUAL" | "QUARTERLY" | "MONTHLY";

export type UserDto = {
  id: string;
  username: string;
  phoneNumber?: string;
  email: string;
  hashedRefreshToken?: string;
  role: Role;
};

export type AssetDto = {
  id: string;
  name: string;
  ticker: string;
  exchange: string;
  type: string;
  dataSource: DataSource;
  updatedAt?: string;
  transactions?: TransactionsDto[];
};

export type TransactionsDto = {
  id: string;
  portfolioId: string;
  assetId: string;
  type: TransactionType;
  quantityChange: number;
  pricePerUnit: number;
  date: string;
  asset: AssetDto;
};

export type PositionDto = {
  portfolioId: string;
  assetId: string;
  quantity: number;
  price?: number;
  avgBuyPrice?: number;
  asset: AssetDto;
  transactions: TransactionsDto[];
};

export type RealEstate = {
  id: string;
  code: string;
  name: string;
  type: RealEstateType;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number | null;
  rooms: number | null;
  totalArea: number | null;
  portfolioId: string;
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
  portfolioId: string;
};

export type MixedAsset = {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number | null;
  portfolioId: string;
};

export type PortfolioDto = {
  id: string;
  name: string;
  user: UserDto;
  stockPositions: PositionDto[];
  cryptoPositions: PositionDto[];
  realEstateAssets: RealEstate[];
  bonds: Bond[];
  mixedAssets: MixedAsset[];
};

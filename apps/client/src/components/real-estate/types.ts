export type RealEstateTransaction = {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
};

export type RealEstate = {
  id: string;
  code: string;
  name: string;
  type: string;
  purchaseDate: string;
  purchasePrice: number;
  transactions: RealEstateTransaction[];
};

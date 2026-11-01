export type RealEstateTransaction = {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
};

export const REAL_ESTATE_TYPES = ["APARTMENT", "HOUSE", "COMMERCIAL", "PARKING_LOT", "OTHER"] as const;

export const TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  COMMERCIAL: "Commercial",
  PARKING_LOT: "Parking lot",
  OTHER: "Other",
};

export type RealEstate = {
  id: string;
  code: string | null;
  name: string;
  type: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number | null;
  rooms: number | null;
  totalArea: number | null;
  transactions: RealEstateTransaction[];
};

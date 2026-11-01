import { RealEstate, RealEstateTransaction } from "./types";

const DAY_MS = 1000 * 60 * 60 * 24;

export function calcRealEstateStats(property: RealEstate) {
  const totalDays = (Date.now() - new Date(property.purchaseDate).getTime()) / DAY_MS;

  let occupiedDays = 0;
  let totalRentEarned = 0;
  for (const t of property.transactions) {
    const days = (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / DAY_MS;
    occupiedDays += days;
    totalRentEarned += (days / 30.4375) * t.monthlyRent;
  }

  const occupancyPct = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;
  const yearsSincePurchase = totalDays / 365.25;
  const annualNet = yearsSincePurchase > 0 ? totalRentEarned / yearsSincePurchase : 0;
  const annualNetPct = property.purchasePrice > 0 ? (annualNet / property.purchasePrice) * 100 : 0;
  const capitalGain = property.currentValue != null ? property.currentValue - property.purchasePrice : 0;

  return { occupancyPct, annualNet, annualNetPct, totalReturn: totalRentEarned + capitalGain };
}

export function activeLease(property: RealEstate): RealEstateTransaction | undefined {
  const now = Date.now();
  return property.transactions.find(
    (t) => new Date(t.startDate).getTime() <= now && now <= new Date(t.endDate).getTime(),
  );
}

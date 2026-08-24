// Static liquidation/settlement timeline reference data for the
// "time to cash" feature (GO_LIVE_STRATEGY.md Phase 2). Hand-researched,
// typical-case ranges — meant to be broadly realistic, not jurisdiction-
// exact, and read by the backend with zero live external calls. Update by
// hand as market norms shift (e.g. further settlement-cycle changes).
//
// Real estate is region-agnostic for v1: `RealEstate` has no
// region/country field, so tiers key off property type + a rough USD
// price band only (see GO_LIVE_STRATEGY.md §2 for the resolved decision).
// Mixed assets are intentionally excluded — liquidity there is too
// item-specific for a lookup table; that category needs a manual
// per-item estimate instead, which is out of scope for this reference
// file.

export type DayRange = {
  minDays: number;
  maxDays: number;
};

// Stocks & ETFs -------------------------------------------------------------
// Trade fills same day; settlement determines when cash clears to the
// brokerage's cash balance. Bank withdrawal (ACH/wire) typically adds up to
// another business day on top of settlement.
export type StockMarket = 'US' | 'EU';

export const STOCK_LIQUIDITY: Record<StockMarket, DayRange> = {
  US: { minDays: 1, maxDays: 2 }, // T+1 settlement (SEC rule, effective May 2024) + withdrawal
  EU: { minDays: 2, maxDays: 3 }, // T+2 settlement (most EU markets and the UK) + withdrawal
};

// Bonds -----------------------------------------------------------------
export type BondClass = 'GOVERNMENT' | 'CORPORATE_INVESTMENT_GRADE' | 'CORPORATE_HIGH_YIELD';

export const BOND_LIQUIDITY: Record<BondClass, DayRange> = {
  GOVERNMENT: { minDays: 1, maxDays: 2 }, // e.g. US Treasuries: T+1 settlement, deep secondary market
  CORPORATE_INVESTMENT_GRADE: { minDays: 2, maxDays: 4 }, // T+2 settlement, generally liquid secondary market
  CORPORATE_HIGH_YIELD: { minDays: 5, maxDays: 10 }, // thinner secondary market, can take longer to find a buyer at fair price
};

// Crypto ------------------------------------------------------------------
export type CryptoTier = 'MAJOR' | 'LONG_TAIL';

export const CRYPTO_LIQUIDITY: Record<CryptoTier, DayRange> = {
  MAJOR: { minDays: 0, maxDays: 1 }, // roughly top 20 by market cap: near-instant sell, same-to-next-day fiat withdrawal
  LONG_TAIL: { minDays: 1, maxDays: 3 }, // lower liquidity, may route through a major pair first; withdrawal support varies by exchange
};

// Real estate -------------------------------------------------------------
// Two numbers per type+tier: a "fast sale" (discounted, cash-buyer/auction
// route) and a "full value sale" (traditional listing at market price) —
// mirrors the product owner's own example ($150k/~2mo vs $170k/~5mo).
export type RealEstateCategory = 'APARTMENT' | 'HOUSE' | 'COMMERCIAL';
export type RealEstatePriceTier = 'LOW' | 'MID' | 'HIGH';

export type RealEstateLiquidity = {
  fast: DayRange;
  full: DayRange;
};

// Upper bound (USD) of each tier; HIGH has no upper bound.
export const REAL_ESTATE_PRICE_TIERS: Record<RealEstatePriceTier, number> = {
  LOW: 150_000,
  MID: 500_000,
  HIGH: Infinity,
};

export function realEstatePriceTier(price: number): RealEstatePriceTier {
  if (price <= REAL_ESTATE_PRICE_TIERS.LOW) return 'LOW';
  if (price <= REAL_ESTATE_PRICE_TIERS.MID) return 'MID';
  return 'HIGH';
}

// Days-on-market by property type/tier. Apartments move fastest (broadest
// buyer pool), houses next, commercial slowest (specialized buyers);
// higher price tiers take longer within each type.
export const REAL_ESTATE_LIQUIDITY: Record<RealEstateCategory, Record<RealEstatePriceTier, RealEstateLiquidity>> = {
  APARTMENT: {
    LOW: { fast: { minDays: 14, maxDays: 21 }, full: { minDays: 30, maxDays: 60 } },
    MID: { fast: { minDays: 21, maxDays: 30 }, full: { minDays: 45, maxDays: 90 } },
    HIGH: { fast: { minDays: 30, maxDays: 45 }, full: { minDays: 60, maxDays: 120 } },
  },
  HOUSE: {
    LOW: { fast: { minDays: 21, maxDays: 30 }, full: { minDays: 45, maxDays: 90 } },
    MID: { fast: { minDays: 30, maxDays: 45 }, full: { minDays: 60, maxDays: 120 } },
    HIGH: { fast: { minDays: 45, maxDays: 60 }, full: { minDays: 90, maxDays: 150 } },
  },
  COMMERCIAL: {
    LOW: { fast: { minDays: 30, maxDays: 45 }, full: { minDays: 90, maxDays: 150 } },
    MID: { fast: { minDays: 45, maxDays: 60 }, full: { minDays: 120, maxDays: 180 } },
    HIGH: { fast: { minDays: 60, maxDays: 90 }, full: { minDays: 150, maxDays: 270 } },
  },
};

export function realEstateLiquidity(type: RealEstateCategory, price: number): RealEstateLiquidity {
  return REAL_ESTATE_LIQUIDITY[type][realEstatePriceTier(price)];
}

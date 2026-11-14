import { unitPrice } from "./valuation";
import { Holdings, ToUsd } from "./types";

type DayRange = { minDays: number; maxDays: number };

export type LiquidityLine = { amount: number } & DayRange;
export type RealEstateLiquidityLine = LiquidityLine & { full: LiquidityLine };

export type LiquiditySummary = {
  byType: {
    cash: LiquidityLine;
    stocks: LiquidityLine;
    bonds: LiquidityLine;
    crypto: LiquidityLine;
    realEstate: RealEstateLiquidityLine;
  };
  liquid: LiquidityLine;
  illiquid: LiquidityLine;
};

const SAME_DAY: DayRange = { minDays: 0, maxDays: 0 };

const STOCK_LIQUIDITY: Record<"US" | "EU", DayRange> = {
  US: { minDays: 1, maxDays: 2 },
  EU: { minDays: 2, maxDays: 3 },
};

const BOND_LIQUIDITY: DayRange = { minDays: 2, maxDays: 4 };

const CRYPTO_LIQUIDITY: Record<"MAJOR" | "LONG_TAIL", DayRange> = {
  MAJOR: { minDays: 0, maxDays: 1 },
  LONG_TAIL: { minDays: 1, maxDays: 3 },
};

const EU_EXCHANGES = new Set(["LSE", "LON", "XETRA", "FRA", "EURONEXT", "AMS", "PAR", "MIL", "MCE", "SWX", "VIE"]);

const MAJOR_CRYPTO = new Set([
  "BTC", "ETH", "USDT", "BNB", "SOL", "XRP", "USDC", "ADA", "DOGE", "TRX", "AVAX",
  "DOT", "MATIC", "POL", "LINK", "TON", "SHIB", "LTC", "BCH", "UNI", "ATOM",
]);

type Tier = "LOW" | "MID" | "HIGH";
type PropertyCategory = "APARTMENT" | "HOUSE" | "COMMERCIAL";

const REAL_ESTATE_LIQUIDITY: Record<PropertyCategory, Record<Tier, { fast: DayRange; full: DayRange }>> = {
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

const PROPERTY_CATEGORY: Record<string, PropertyCategory> = {
  APARTMENT: "APARTMENT",
  HOUSE: "HOUSE",
  COMMERCIAL: "COMMERCIAL",
  PARKING_LOT: "COMMERCIAL",
  OTHER: "COMMERCIAL",
};

function priceTier(price: number): Tier {
  if (price <= 150_000) return "LOW";
  if (price <= 500_000) return "MID";
  return "HIGH";
}

function realEstateLiquidity(type: string, price: number) {
  return REAL_ESTATE_LIQUIDITY[PROPERTY_CATEGORY[type] ?? "COMMERCIAL"][priceTier(price)];
}

function emptyLine(): LiquidityLine {
  return { amount: 0, minDays: 0, maxDays: 0 };
}

function addToLine(line: LiquidityLine, amount: number, range: DayRange): void {
  if (amount <= 0) return;
  const hadAmount = line.amount > 0;
  line.amount += amount;
  line.minDays = hadAmount ? Math.min(line.minDays, range.minDays) : range.minDays;
  line.maxDays = hadAmount ? Math.max(line.maxDays, range.maxDays) : range.maxDays;
}

function mergeLines(a: LiquidityLine, b: LiquidityLine): LiquidityLine {
  const merged = { ...a };
  addToLine(merged, b.amount, b);
  return merged;
}

export function computeLiquidity(portfolios: Holdings[], toUsd: ToUsd): LiquiditySummary {
  const cash = emptyLine();
  const stocks = emptyLine();
  const bonds = emptyLine();
  const crypto = emptyLine();
  const realEstate: RealEstateLiquidityLine = { ...emptyLine(), full: emptyLine() };

  for (const portfolio of portfolios) {
    for (const p of portfolio.stockPositions ?? []) {
      const market = EU_EXCHANGES.has(p.asset.exchange?.trim().toUpperCase() ?? "") ? "EU" : "US";
      addToLine(stocks, unitPrice(p.asset.currentPrice, p.price) * p.quantity, STOCK_LIQUIDITY[market]);
    }
    for (const p of portfolio.cryptoPositions ?? []) {
      const tier = MAJOR_CRYPTO.has(p.asset.ticker.toUpperCase()) ? "MAJOR" : "LONG_TAIL";
      addToLine(crypto, unitPrice(p.asset.currentPrice, p.price) * p.quantity, CRYPTO_LIQUIDITY[tier]);
    }
    for (const b of portfolio.bonds ?? []) {
      addToLine(bonds, toUsd((b.currentValue ?? b.purchasePrice) * b.quantity, b.currency ?? "USD"), BOND_LIQUIDITY);
    }
    for (const r of portfolio.realEstateAssets ?? []) {
      const amount = r.currentValue ?? r.purchasePrice;
      const { fast, full } = realEstateLiquidity(r.type, amount);
      addToLine(realEstate, amount, fast);
      addToLine(realEstate.full, amount, full);
    }
    for (const c of portfolio.cash ?? []) {
      const line = c.category === "STOCK" ? stocks : c.category === "CRYPTO" ? crypto : cash;
      addToLine(line, toUsd(c.amount, c.currency), SAME_DAY);
    }
  }

  const liquid = [cash, stocks, bonds, crypto].reduce(mergeLines, emptyLine());
  const illiquid = mergeLines(emptyLine(), realEstate.full);
  return { byType: { cash, stocks, bonds, crypto, realEstate }, liquid, illiquid };
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import {
  BOND_LIQUIDITY,
  BondClass,
  CRYPTO_LIQUIDITY,
  CryptoTier,
  DayRange,
  STOCK_LIQUIDITY,
  StockMarket,
  realEstateLiquidity,
} from './liquidity-reference';

// Exchange codes seen in Asset.exchange (free-text, populated from CSV
// imports and manual entry — no enum). Anything not recognized as EU is
// assumed US, since that's the app's dominant market and T+1 (US) is the
// faster/more optimistic default of the two — see classifyStockMarket.
const EU_EXCHANGES = new Set([
  'LSE',
  'LON',
  'XETRA',
  'FRA',
  'EURONEXT',
  'AMS',
  'PAR',
  'MIL',
  'MCE',
  'SWX',
  'VIE',
]);

function classifyStockMarket(exchange: string | null | undefined): StockMarket {
  const key = exchange?.trim().toUpperCase();
  return key && EU_EXCHANGES.has(key) ? 'EU' : 'US';
}

// Static top-tier ticker list (roughly top 20 by market cap) rather than a
// live ranking call, per the liquidity feature's "zero live external calls"
// exit criteria (GO_LIVE_STRATEGY.md Phase 2). Anything not listed here is
// treated as LONG_TAIL. Update by hand if the market cap ranking shifts.
const MAJOR_CRYPTO_TICKERS = new Set([
  'BTC',
  'ETH',
  'USDT',
  'BNB',
  'SOL',
  'XRP',
  'USDC',
  'ADA',
  'DOGE',
  'TRX',
  'AVAX',
  'DOT',
  'MATIC',
  'POL',
  'LINK',
  'TON',
  'SHIB',
  'LTC',
  'BCH',
  'UNI',
  'ATOM',
]);

function classifyCryptoTier(ticker: string): CryptoTier {
  return MAJOR_CRYPTO_TICKERS.has(ticker.toUpperCase()) ? 'MAJOR' : 'LONG_TAIL';
}

// Bond has no stored credit-rating/class field, so v1 assumes every bond is
// investment-grade corporate debt — the middle tier of BOND_LIQUIDITY,
// rather than the fastest (government) or slowest (high-yield) case.
const DEFAULT_BOND_CLASS: BondClass = 'CORPORATE_INVESTMENT_GRADE';

export interface LiquidityLine {
  amount: number;
  minDays: number;
  maxDays: number;
}

// Real estate keeps its own fast-sale/full-value-sale distinction from the
// reference table: `minDays`/`maxDays` above are the fast-sale range (the
// headline figure, matching the product owner's example), `full` is the
// traditional-listing alternative at the same amount — the model has no
// separate discounted "fast sale proceeds" figure, only a timeline gets
// faster.
export interface RealEstateLiquidityLine extends LiquidityLine {
  full: LiquidityLine;
}

export interface LiquidityBreakdown {
  stocks: LiquidityLine;
  bonds: LiquidityLine;
  crypto: LiquidityLine;
  realEstate: RealEstateLiquidityLine;
}

export interface LiquiditySummary {
  byType: LiquidityBreakdown;
  // Liquid = stocks + bonds + crypto; illiquid = real estate (full-value
  // range, the realistic worst case). Mixed assets are excluded from both,
  // per the reference file's scope.
  liquid: LiquidityLine;
  illiquid: LiquidityLine;
}

function emptyLine(): LiquidityLine {
  return { amount: 0, minDays: 0, maxDays: 0 };
}

// Folds one holding's (amount, range) into a running bucket line: amounts
// sum, the range widens to cover every holding folded in so far (fastest
// min, slowest max across the bucket) rather than averaging — so the range
// always reflects the true best/worst case, not a distorted mean.
function addToLine(line: LiquidityLine, amount: number, range: DayRange): void {
  if (amount <= 0) return;
  const hadAmount = line.amount > 0;
  line.amount += amount;
  line.minDays = hadAmount
    ? Math.min(line.minDays, range.minDays)
    : range.minDays;
  line.maxDays = hadAmount
    ? Math.max(line.maxDays, range.maxDays)
    : range.maxDays;
}

function mergeLines(a: LiquidityLine, b: LiquidityLine): LiquidityLine {
  const merged = { ...a };
  addToLine(merged, b.amount, b);
  return merged;
}

export interface LiquidityPortfolioInput {
  stockPositions: {
    asset: { currentPrice: number | null; exchange: string | null };
    price: number | null;
    quantity: number;
  }[];
  cryptoPositions: {
    asset: { currentPrice: number | null; ticker: string };
    price: number | null;
    quantity: number;
  }[];
  bonds: {
    currentValue: number | null;
    purchasePrice: number;
    quantity: number;
  }[];
  realEstateAssets: {
    currentValue: number | null;
    purchasePrice: number;
    type: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL';
  }[];
}

// Pure aggregation: one portfolio's holdings -> a per-asset-class liquidity
// breakdown plus the liquid/illiquid split. Valuation mirrors
// computeNetWorthByType in portfolios.service.ts (live price falling back to
// cost basis for stocks/crypto, currentValue falling back to purchasePrice
// for bonds/real estate) so the dollar amounts here always match net worth.
export function computeLiquidity(
  portfolio: LiquidityPortfolioInput,
): LiquiditySummary {
  const stocks = emptyLine();
  const bonds = emptyLine();
  const crypto = emptyLine();
  const realEstate: RealEstateLiquidityLine = {
    ...emptyLine(),
    full: emptyLine(),
  };

  for (const pa of portfolio.stockPositions) {
    const amount = (pa.asset.currentPrice ?? pa.price ?? 0) * pa.quantity;
    addToLine(
      stocks,
      amount,
      STOCK_LIQUIDITY[classifyStockMarket(pa.asset.exchange)],
    );
  }

  for (const pa of portfolio.cryptoPositions) {
    const amount = (pa.asset.currentPrice ?? pa.price ?? 0) * pa.quantity;
    addToLine(
      crypto,
      amount,
      CRYPTO_LIQUIDITY[classifyCryptoTier(pa.asset.ticker)],
    );
  }

  for (const bond of portfolio.bonds) {
    const amount = (bond.currentValue ?? bond.purchasePrice) * bond.quantity;
    addToLine(bonds, amount, BOND_LIQUIDITY[DEFAULT_BOND_CLASS]);
  }

  for (const property of portfolio.realEstateAssets) {
    const amount = property.currentValue ?? property.purchasePrice;
    const { fast, full } = realEstateLiquidity(property.type, amount);
    addToLine(realEstate, amount, fast);
    addToLine(realEstate.full, amount, full);
  }

  const liquid = [stocks, bonds, crypto].reduce(mergeLines, emptyLine());
  const illiquid = mergeLines(emptyLine(), realEstate.full);

  return { byType: { stocks, bonds, crypto, realEstate }, liquid, illiquid };
}

export function mergeLiquiditySummaries(
  summaries: LiquiditySummary[],
): LiquiditySummary {
  const stocks = emptyLine();
  const bonds = emptyLine();
  const crypto = emptyLine();
  const realEstate: RealEstateLiquidityLine = {
    ...emptyLine(),
    full: emptyLine(),
  };

  for (const summary of summaries) {
    addToLine(stocks, summary.byType.stocks.amount, summary.byType.stocks);
    addToLine(bonds, summary.byType.bonds.amount, summary.byType.bonds);
    addToLine(crypto, summary.byType.crypto.amount, summary.byType.crypto);
    addToLine(
      realEstate,
      summary.byType.realEstate.amount,
      summary.byType.realEstate,
    );
    addToLine(
      realEstate.full,
      summary.byType.realEstate.full.amount,
      summary.byType.realEstate.full,
    );
  }

  const liquid = [stocks, bonds, crypto].reduce(mergeLines, emptyLine());
  const illiquid = mergeLines(emptyLine(), realEstate.full);

  return { byType: { stocks, bonds, crypto, realEstate }, liquid, illiquid };
}

const LIQUIDITY_INCLUDE = {
  stockPositions: { include: { asset: true } },
  cryptoPositions: { include: { asset: true } },
  bonds: true,
  realEstateAssets: true,
} as const;

@Injectable()
export class LiquidityService {
  constructor(
    private prismaService: PrismaService,
    private portfoliosService: PortfoliosService,
  ) {}

  // Liquidity for a single portfolio.
  async getPortfolioLiquidity(
    portfolioId: string,
    userId: string,
  ): Promise<LiquiditySummary> {
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id: portfolioId },
      include: LIQUIDITY_INCLUDE,
    });
    if (!portfolio) throw new NotFoundException('Portfolio not found');

    return computeLiquidity(portfolio);
  }

  // Liquidity across every portfolio a user owns.
  async getUserLiquidity(userId: string): Promise<LiquiditySummary> {
    const portfolios = await this.prismaService.portfolio.findMany({
      where: { userId },
      include: LIQUIDITY_INCLUDE,
    });

    return mergeLiquiditySummaries(portfolios.map(computeLiquidity));
  }
}

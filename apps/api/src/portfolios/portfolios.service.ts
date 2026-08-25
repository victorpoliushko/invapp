import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { PortfolioDto } from './dto/Portfolio.dto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AddAssetInputDto } from './dto/AssetToPortfolio.dto';
import { DeleteAssetsFromPortfolioDto } from './dto/DeleteAssetsFromPortfolio.dto';
import { Currency } from './dto/PortfolioBalance.dto';
import { AssetsService } from '../assets/assets.service';
import { UpdatePortfolioDto } from './dto/UpdatePortfolio.dto';
import { TransactionType } from '@prisma/client';

export type ReturnPeriod = 'all' | 'year' | 'month';

interface PeriodTransaction {
  type: TransactionType;
  quantityChange: number;
  pricePerUnit: number;
  date: Date;
}

function periodStartDate(period: ReturnPeriod): Date | null {
  const now = new Date();
  if (period === 'year') {
    return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return null;
}

// Position built from the asset's own BUY/SELL transactions dated within the
// period. There's no historical price snapshot to compare against, so the
// "return for the period" is the return on what was bought/sold during that
// period, not the return on pre-existing holdings.
function calcPeriodPosition(
  transactions: PeriodTransaction[],
  periodStart: Date | null,
): { quantity: number; avgPrice: number } | null {
  let quantity = 0;
  let cost = 0;

  for (const t of transactions) {
    if (periodStart && new Date(t.date) < periodStart) continue;
    if (t.type === TransactionType.BUY) {
      quantity += t.quantityChange;
      cost += t.quantityChange * t.pricePerUnit;
    } else {
      quantity -= t.quantityChange;
      cost -= t.quantityChange * t.pricePerUnit;
    }
  }

  if (quantity <= 0) return null;
  return { quantity, avgPrice: cost / quantity };
}

// Days of overlap between the requested period window ([periodStart, now], or
// (-infinity, now] when periodStart is null for "all time") and an arbitrary
// [rangeStart, rangeEnd] window (a bond's holding period, a rental period).
// Used to prorate income-generating assets (bonds, real estate) to the
// requested period the same way calcPeriodPosition does for stocks/crypto,
// except by continuous accrual/rental-day overlap rather than discrete
// BUY/SELL transactions, since neither bonds nor real estate have those.
function daysOverlap(periodStart: Date | null, now: Date, rangeStart: Date, rangeEnd: Date): number {
  const start = periodStart && periodStart > rangeStart ? periodStart : rangeStart;
  const end = now < rangeEnd ? now : rangeEnd;
  const ms = end.getTime() - start.getTime();
  return ms > 0 ? ms / (1000 * 60 * 60 * 24) : 0;
}

interface PeriodBond {
  faceValue: number;
  couponRate: number;
  quantity: number;
  purchasePrice: number;
  currentValue: number | null;
  purchaseDate: Date;
  maturityDate: Date | null;
}

// Coupon income only — capital gains (from the manual currentValue override)
// are computed separately by calcBondCapitalGain.
function calcBondIncome(bond: PeriodBond, periodStart: Date | null, now: Date): number {
  const holdingEnd = bond.maturityDate ?? now;
  const days = daysOverlap(periodStart, now, bond.purchaseDate, holdingEnd);
  if (days <= 0) return 0;
  const annualIncome = bond.faceValue * (bond.couponRate / 100) * bond.quantity;
  return annualIncome * (days / 365.25);
}

// Capital gain from the manually-entered currentValue override, a
// point-in-time figure like mixed assets — counted in full whenever the
// holding period overlaps the requested window, not prorated like income.
function calcBondCapitalGain(bond: PeriodBond, periodStart: Date | null, now: Date): number {
  if (bond.currentValue == null) return 0;
  const holdingEnd = bond.maturityDate ?? now;
  if (daysOverlap(periodStart, now, bond.purchaseDate, holdingEnd) <= 0) return 0;
  return (bond.currentValue - bond.purchasePrice) * bond.quantity;
}

interface PeriodRentalTransaction {
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
}

// Rental income only — same caveat as bonds, no tracked current market value.
function calcRealEstateIncome(
  transactions: PeriodRentalTransaction[],
  periodStart: Date | null,
  now: Date,
): number {
  let income = 0;
  for (const t of transactions) {
    const days = daysOverlap(periodStart, now, t.startDate, t.endDate);
    if (days <= 0) continue;
    income += (days / 30.4375) * t.monthlyRent;
  }
  return income;
}

export interface Mover {
  label: string;
  type: string;
  pct: number;
  dollarReturn: number;
}

// Stocks/crypto rank by live price-change %; bonds/real estate rank by
// income yield % plus any capital gain from a manual currentValue override
// (see calcBondIncome/calcBondCapitalGain/buildRealEstateMovers). Different
// mechanisms, same normalized unit (% return on cost basis), so they can
// share one ranking.
function buildPositionMovers(
  positions: { asset: { ticker: string; type: string | null; currentPrice: number | null }; transactions: PeriodTransaction[] }[],
  periodStart: Date | null,
): Mover[] {
  const movers: Mover[] = [];
  for (const pa of positions) {
    if (pa.asset.currentPrice == null) continue;
    const position = calcPeriodPosition(pa.transactions, periodStart);
    if (!position || position.avgPrice === 0) continue;

    const cost = position.avgPrice * position.quantity;
    const dollarReturn = pa.asset.currentPrice * position.quantity - cost;
    movers.push({ label: pa.asset.ticker, type: pa.asset.type ?? 'Stock', pct: (dollarReturn / cost) * 100, dollarReturn });
  }
  return movers;
}

function buildBondMovers(bonds: (PeriodBond & { isin: string })[], periodStart: Date | null, now: Date): Mover[] {
  const movers: Mover[] = [];
  for (const bond of bonds) {
    if (bond.quantity <= 0) continue;
    const cost = bond.purchasePrice * bond.quantity;
    if (cost <= 0) continue;
    const dollarReturn = calcBondIncome(bond, periodStart, now) + calcBondCapitalGain(bond, periodStart, now);
    if (dollarReturn === 0) continue;

    movers.push({ label: bond.isin, type: 'BOND', pct: (dollarReturn / cost) * 100, dollarReturn });
  }
  return movers;
}

function buildRealEstateMovers(
  properties: { code: string; purchasePrice: number; currentValue: number | null; transactions: PeriodRentalTransaction[] }[],
  periodStart: Date | null,
  now: Date,
): Mover[] {
  const movers: Mover[] = [];
  for (const property of properties) {
    if (property.purchasePrice <= 0) continue;
    const income = calcRealEstateIncome(property.transactions, periodStart, now);
    const capitalGain = property.currentValue != null ? property.currentValue - property.purchasePrice : 0;
    const dollarReturn = income + capitalGain;
    movers.push({ label: property.code, type: 'REAL_ESTATE', pct: (dollarReturn / property.purchasePrice) * 100, dollarReturn });
  }
  return movers;
}

// Mixed assets have a manually-entered currentValue instead of a live price
// feed, so returns are capital-gains only (no income component), same math
// shape as stocks but user-entered instead of fetched.
function buildMixedAssetMovers(
  mixedAssets: { name: string; quantity: number; purchasePrice: number; currentValue: number | null }[],
): Mover[] {
  const movers: Mover[] = [];
  for (const asset of mixedAssets) {
    if (asset.currentValue == null || asset.quantity <= 0) continue;
    const cost = asset.purchasePrice * asset.quantity;
    if (cost <= 0) continue;
    const dollarReturn = asset.currentValue * asset.quantity - cost;
    movers.push({ label: asset.name, type: 'MIXED_ASSET', pct: (dollarReturn / cost) * 100, dollarReturn });
  }
  return movers;
}

export interface NetWorthByType {
  stocks: number;
  crypto: number;
  bonds: number;
  realEstate: number;
  mixedAssets: number;
}

// Net worth for a single portfolio. Stocks/crypto use the live currentPrice
// (falling back to cost basis if a price hasn't been fetched yet); bonds,
// real estate, and mixed assets use the user-entered currentValue override,
// falling back to cost basis (purchasePrice) when it hasn't been set. Shared
// by PortfoliosService.getNetWorth (summed across every portfolio a user
// owns) and getPortfolioNetWorth (a single portfolio).
function computeNetWorthByType(portfolio: {
  stockPositions: { asset: { currentPrice: number | null }; price: number | null; quantity: number }[];
  cryptoPositions: { asset: { currentPrice: number | null }; price: number | null; quantity: number }[];
  bonds: { currentValue: number | null; purchasePrice: number; quantity: number }[];
  realEstateAssets: { currentValue: number | null; purchasePrice: number }[];
  mixedAssets?: { currentValue: number | null; purchasePrice: number; quantity: number }[];
}): NetWorthByType {
  let stocks = 0;
  let crypto = 0;
  let bonds = 0;
  let realEstate = 0;
  let mixedAssets = 0;

  for (const pa of portfolio.stockPositions) {
    stocks += (pa.asset.currentPrice ?? pa.price ?? 0) * pa.quantity;
  }
  for (const pa of portfolio.cryptoPositions) {
    crypto += (pa.asset.currentPrice ?? pa.price ?? 0) * pa.quantity;
  }
  for (const bond of portfolio.bonds) {
    bonds += (bond.currentValue ?? bond.purchasePrice) * bond.quantity;
  }
  for (const property of portfolio.realEstateAssets) {
    realEstate += property.currentValue ?? property.purchasePrice;
  }
  for (const asset of portfolio.mixedAssets ?? []) {
    mixedAssets += (asset.currentValue ?? asset.purchasePrice) * asset.quantity;
  }

  return { stocks, crypto, bonds, realEstate, mixedAssets };
}

const NET_WORTH_INCLUDE = {
  stockPositions: { include: { asset: true } },
  cryptoPositions: { include: { asset: true } },
  bonds: true,
  realEstateAssets: true,
  mixedAssets: true,
} as const;

@Injectable()
export class PortfoliosService {
  constructor(
    private prismaService: PrismaService,
    private assetsService: AssetsService,
  ) {}

  // Verifies that `userId` owns the portfolio identified by `portfolioId`,
  // throwing NotFound/Forbidden otherwise. Called first by every method that
  // acts on a specific portfolio, so a user can never read or mutate a
  // portfolio that isn't theirs just by knowing/guessing its id.
  async assertOwnership(portfolioId: string, userId: string): Promise<void> {
    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id: portfolioId },
      select: { userId: true },
    });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    if (portfolio.userId !== userId) {
      throw new ForbiddenException('You do not have access to this portfolio');
    }
  }

  async create(input: CreatePortfolioDto): Promise<PortfolioDto> {
    const createdPortfolio = await this.prismaService.portfolio.create({
      data: input,
      include: { user: true },
    });
    return plainToInstance(PortfolioDto, createdPortfolio);
  }

  async getById(id: string, userId: string): Promise<PortfolioDto> {
    await this.assertOwnership(id, userId);

    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: {
        stockPositions: {
          include: {
            asset: true,
            transactions: {
              where: { portfolioId: id },
              orderBy: { date: 'desc' },
            },
          },
        },
        cryptoPositions: {
          include: {
            asset: true,
            transactions: {
              where: { portfolioId: id },
              orderBy: { date: 'desc' },
            },
          },
        },
        realEstateAssets: true,
      },
    });
    return plainToInstance(PortfolioDto, portfolio);
  }

  async update(input: UpdatePortfolioDto, userId: string): Promise<PortfolioDto> {
    await this.assertOwnership(input.id, userId);

    const portfolio = await this.prismaService.portfolio.update({
      where: { id: input.id },
      data: {
        name: input.name,
      },
      include: {
        stockPositions: { include: { asset: true } },
        cryptoPositions: { include: { asset: true } },
      },
    });
    return plainToInstance(PortfolioDto, portfolio);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwnership(id, userId);

    await this.prismaService.$transaction([
      this.prismaService.stockTransaction.deleteMany({ where: { portfolioId: id } }),
      this.prismaService.cryptoTransaction.deleteMany({ where: { portfolioId: id } }),
      this.prismaService.stockPosition.deleteMany({ where: { portfolioId: id } }),
      this.prismaService.cryptoPosition.deleteMany({ where: { portfolioId: id } }),
      this.prismaService.portfolio.delete({ where: { id } }),
    ]);
  }

  async getByUserId(userId: string): Promise<PortfolioDto[]> {
    const portfolios = await this.prismaService.portfolio.findMany({
      where: { userId },
      include: {
        stockPositions: { include: { asset: true } },
        cryptoPositions: { include: { asset: true } },
        bonds: true,
        realEstateAssets: true,
        mixedAssets: true,
      },
    });
    return portfolios.map((p) => plainToInstance(PortfolioDto, p));
  }

  async addAssetToPortfolio(
    id: string,
    input: AddAssetInputDto,
    userId: string,
  ): Promise<PortfolioDto> {
    await this.assertOwnership(id, userId);

    let asset = await this.assetsService.findAssetByName(input.assetName);

    if (!asset) {
      asset = await this.assetsService.createAsset({
        ticker: input.assetName,
        ...(input.coingeckoId && {
          coingeckoId: input.coingeckoId,
          type: 'CRYPTOCURRENCY' as any,
          dataSource: 'COINGECKO' as any,
        }),
      });
    }

    const isCrypto = asset.type === 'CRYPTOCURRENCY';

    if (isCrypto) {
      await this.upsertPosition(this.prismaService.cryptoPosition, this.prismaService.cryptoTransaction, id, asset.id, input);
    } else {
      await this.upsertPosition(this.prismaService.stockPosition, this.prismaService.stockTransaction, id, asset.id, input);
    }

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: {
          stockPositions: { include: { asset: true } },
          cryptoPositions: { include: { asset: true } },
        },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  // Shared by the stock and crypto branches of addAssetToPortfolio: ensures a
  // position row exists, records the new transaction, then recomputes the
  // position's quantity/avg price from the full transaction history.
  private async upsertPosition(
    position: { findUnique: Function; create: Function; update: Function },
    transaction: { create: Function; findMany: Function },
    portfolioId: string,
    assetId: string,
    input: AddAssetInputDto,
  ) {
    const existing = await position.findUnique({
      where: { portfolioId_assetId: { portfolioId, assetId } },
    });

    if (!existing) {
      await position.create({
        data: { assetId, portfolioId, quantity: 0 },
      });
    }

    await transaction.create({
      data: {
        type: input.type,
        quantityChange: input.quantityChange,
        date: new Date(input.date),
        pricePerUnit: input.pricePerUnit,
        portfolioId,
        assetId,
      },
    });

    const allTransactions: PeriodTransaction[] = await transaction.findMany({
      where: { portfolioId, assetId },
    });

    let totalQuantity = 0;
    let totalCost = 0;

    allTransactions.forEach((t) => {
      if (t.type === TransactionType.BUY) {
        totalQuantity += t.quantityChange;
        totalCost += t.quantityChange * t.pricePerUnit;
      } else {
        totalQuantity -= t.quantityChange;
        totalCost -= t.quantityChange * t.pricePerUnit;
      }
    });

    const avgPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;

    await position.update({
      where: { portfolioId_assetId: { portfolioId, assetId } },
      data: {
        quantity: totalQuantity,
        price: Math.round(avgPrice),
      },
    });
  }

  async deleteAsset(
    id: string,
    input: DeleteAssetsFromPortfolioDto,
    userId: string,
  ): Promise<PortfolioDto> {
    await this.assertOwnership(id, userId);

    const asset = await this.prismaService.asset.findUnique({ where: { id: input.assetId } });
    const isCrypto = asset?.type === 'CRYPTOCURRENCY';

    if (isCrypto) {
      await this.prismaService.cryptoTransaction.deleteMany({ where: { portfolioId: id, assetId: input.assetId } });
      await this.prismaService.cryptoPosition.delete({
        where: { portfolioId_assetId: { portfolioId: id, assetId: input.assetId } },
      });
    } else {
      await this.prismaService.stockTransaction.deleteMany({ where: { portfolioId: id, assetId: input.assetId } });
      await this.prismaService.stockPosition.delete({
        where: { portfolioId_assetId: { portfolioId: id, assetId: input.assetId } },
      });
    }

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: {
          stockPositions: { include: { asset: true } },
          cryptoPositions: { include: { asset: true } },
        },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async getPortfolioBalance(id: string, currency: Currency, userId: string): Promise<any> {
    await this.assertOwnership(id, userId);

    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: {
        stockPositions: { include: { asset: true } },
        cryptoPositions: { include: { asset: true } },
      },
    });

    if (!portfolio) throw new NotFoundException('Portfolio not found');

    const positions = [...portfolio.stockPositions, ...portfolio.cryptoPositions];

    return Promise.all(
      positions.map(async (pa) => ({
        assetId: pa.assetId,
        symbol: pa.asset.ticker,
        actualPrice: await this.assetsService.getSharePrice(pa.asset.ticker),
      })),
    );
  }

  async getPortfolioReturns(
    id: string,
    period: ReturnPeriod,
    userId: string,
  ): Promise<{ pctReturn: number | null; dollarReturn: number | null }> {
    await this.assertOwnership(id, userId);

    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: {
        stockPositions: {
          include: {
            asset: true,
            transactions: { where: { portfolioId: id } },
          },
        },
        cryptoPositions: {
          include: {
            asset: true,
            transactions: { where: { portfolioId: id } },
          },
        },
        bonds: true,
        realEstateAssets: { include: { transactions: true } },
        mixedAssets: true,
      },
    });

    if (!portfolio) throw new NotFoundException('Portfolio not found');

    const periodStart = periodStartDate(period);
    const now = new Date();
    let totalCost = 0;
    let totalDollarReturn = 0;
    let hasPosition = false;

    for (const pa of [...portfolio.stockPositions, ...portfolio.cryptoPositions]) {
      if (pa.asset.currentPrice == null) continue;
      const position = calcPeriodPosition(pa.transactions, periodStart);
      if (!position || position.avgPrice === 0) continue;

      hasPosition = true;
      const cost = position.avgPrice * position.quantity;
      totalCost += cost;
      totalDollarReturn += pa.asset.currentPrice * position.quantity - cost;
    }

    for (const bond of portfolio.bonds) {
      if (bond.quantity <= 0) continue;
      const dollarReturn = calcBondIncome(bond, periodStart, now) + calcBondCapitalGain(bond, periodStart, now);
      if (dollarReturn === 0) continue;

      hasPosition = true;
      totalCost += bond.purchasePrice * bond.quantity;
      totalDollarReturn += dollarReturn;
    }

    // Real estate has no maturity/exit concept — a property is treated as
    // owned through to "now" for every period, so its cost basis (and any
    // capital gain from the currentValue override) always counts; only the
    // rental income is bounded to the period window.
    for (const property of portfolio.realEstateAssets) {
      hasPosition = true;
      totalCost += property.purchasePrice;
      const income = calcRealEstateIncome(property.transactions, periodStart, now);
      const capitalGain = property.currentValue != null ? property.currentValue - property.purchasePrice : 0;
      totalDollarReturn += income + capitalGain;
    }

    // Mixed assets have no income accrual — the capital gain is a single
    // point-in-time figure (currentValue vs purchasePrice), so it counts in
    // full whenever the holding period overlaps the requested window, same
    // overlap rule bonds/real estate use to decide if a position counts at all.
    for (const asset of portfolio.mixedAssets ?? []) {
      if (asset.currentValue == null || asset.quantity <= 0) continue;
      if (daysOverlap(periodStart, now, asset.purchaseDate, now) <= 0) continue;

      hasPosition = true;
      const cost = asset.purchasePrice * asset.quantity;
      totalCost += cost;
      totalDollarReturn += asset.currentValue * asset.quantity - cost;
    }

    if (!hasPosition || totalCost === 0) {
      return { pctReturn: null, dollarReturn: null };
    }

    return {
      pctReturn: (totalDollarReturn / totalCost) * 100,
      dollarReturn: totalDollarReturn,
    };
  }

  async getTopMovers(
    id: string,
    period: ReturnPeriod,
    userId: string,
  ): Promise<{ topPerformers: Mover[]; topLosers: Mover[] }> {
    await this.assertOwnership(id, userId);

    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: {
        stockPositions: {
          include: {
            asset: true,
            transactions: { where: { portfolioId: id } },
          },
        },
        cryptoPositions: {
          include: {
            asset: true,
            transactions: { where: { portfolioId: id } },
          },
        },
        bonds: true,
        realEstateAssets: { include: { transactions: true } },
        mixedAssets: true,
      },
    });

    if (!portfolio) throw new NotFoundException('Portfolio not found');

    const periodStart = periodStartDate(period);
    const now = new Date();

    const movers = [
      ...buildPositionMovers(portfolio.stockPositions, periodStart),
      ...buildPositionMovers(portfolio.cryptoPositions, periodStart),
      ...buildBondMovers(portfolio.bonds, periodStart, now),
      ...buildRealEstateMovers(portfolio.realEstateAssets, periodStart, now),
      ...buildMixedAssetMovers(portfolio.mixedAssets ?? []),
    ];

    const topPerformers = [...movers].sort((a, b) => b.pct - a.pct).slice(0, 3);
    const topLosers = movers.filter((m) => m.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 3);

    return { topPerformers, topLosers };
  }

  // Net worth across every portfolio a user owns, not just one — see
  // computeNetWorthByType for the per-portfolio valuation rules.
  async getNetWorth(userId: string): Promise<{ total: number; byType: NetWorthByType }> {
    const portfolios = await this.prismaService.portfolio.findMany({
      where: { userId },
      include: NET_WORTH_INCLUDE,
    });

    const byType: NetWorthByType = { stocks: 0, crypto: 0, bonds: 0, realEstate: 0, mixedAssets: 0 };

    for (const portfolio of portfolios) {
      const portfolioByType = computeNetWorthByType(portfolio);
      byType.stocks += portfolioByType.stocks;
      byType.crypto += portfolioByType.crypto;
      byType.bonds += portfolioByType.bonds;
      byType.realEstate += portfolioByType.realEstate;
      byType.mixedAssets += portfolioByType.mixedAssets;
    }

    const total = byType.stocks + byType.crypto + byType.bonds + byType.realEstate + byType.mixedAssets;
    return { total, byType };
  }

  // Net worth for a single portfolio — same valuation rules as getNetWorth,
  // scoped to one portfolio instead of summed across all of a user's.
  async getPortfolioNetWorth(id: string, userId: string): Promise<{ total: number; byType: NetWorthByType }> {
    await this.assertOwnership(id, userId);

    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: NET_WORTH_INCLUDE,
    });

    if (!portfolio) throw new NotFoundException('Portfolio not found');

    const byType = computeNetWorthByType(portfolio);
    const total = byType.stocks + byType.crypto + byType.bonds + byType.realEstate + byType.mixedAssets;
    return { total, byType };
  }
}

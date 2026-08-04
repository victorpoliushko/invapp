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

interface AssetsWithPrices {
  asset: string;
  price: number;
  currency: Currency;
  quantity: number;
}

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
        portfolioAssets: {
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
      include: { portfolioAssets: { include: { asset: true } } },
    });
    return plainToInstance(PortfolioDto, portfolio);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwnership(id, userId);

    await this.prismaService.$transaction([
      this.prismaService.transaction.deleteMany({ where: { portfolioId: id } }),
      this.prismaService.portfolioAsset.deleteMany({ where: { portfolioId: id } }),
      this.prismaService.portfolio.delete({ where: { id } }),
    ]);
  }

  async getByUserId(userId: string): Promise<PortfolioDto[]> {
    const portfolios = await this.prismaService.portfolio.findMany({
      where: { userId },
      include: {
        portfolioAssets: { include: { asset: true } },
        bonds: true,
        realEstateAssets: true,
      },
    });
    return portfolios.map((p) => plainToInstance(PortfolioDto, p));
  }

  async syncAssetPrice(asset: any) {
    const exsitingAsset = await this.prismaService.asset.findUnique({
      where: asset[0].id
        ? { id: asset[0].id }
        : { ticker: asset[0].assetSymbol },
    });

    return await this.assetsService.getSharePrice(exsitingAsset.ticker);
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

    let portfolioAsset = await this.prismaService.portfolioAsset.findUnique({
      where: { portfolioId_assetId: { portfolioId: id, assetId: asset.id } },
    });

    if (!portfolioAsset) {
      portfolioAsset = await this.prismaService.portfolioAsset.create({
        data: {
          assetId: asset.id,
          portfolioId: id,
          quantity: 0,
        },
      });
    }

    await this.prismaService.transaction.create({
      data: {
        type: input.type,
        quantityChange: input.quantityChange,
        date: new Date(input.date),
        pricePerUnit: input.pricePerUnit,
        portfolioId: id,
        assetId: asset.id,
      },
    });

    const allTransactions = await this.prismaService.transaction.findMany({
      where: { portfolioId: id, assetId: asset.id },
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

    await this.prismaService.portfolioAsset.update({
      where: { portfolioId_assetId: { portfolioId: id, assetId: asset.id } },
      data: {
        quantity: totalQuantity,
        price: Math.round(avgPrice),
      },
    });

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { portfolioAssets: { include: { asset: true } } },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async deleteAsset(
    id: string,
    input: DeleteAssetsFromPortfolioDto,
    userId: string,
  ): Promise<PortfolioDto> {
    await this.assertOwnership(id, userId);

    await this.prismaService.transaction.deleteMany({
      where: {
        portfolioId: id,
        assetId: input.assetId,
      },
    });

    await this.prismaService.portfolioAsset.delete({
      where: {
        portfolioId_assetId: {
          portfolioId: id,
          assetId: input.assetId,
        },
      },
    });

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { portfolioAssets: { include: { asset: true } } },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async getPortfolioBalance(id: string, currency: Currency, userId: string): Promise<any> {
    await this.assertOwnership(id, userId);

    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: {
        portfolioAssets: {
          include: {
            asset: true,
          },
        },
      },
    });

    if (!portfolio) throw new NotFoundException('Portfolio not found');

    return Promise.all(
      portfolio.portfolioAssets.map(async (pa) => ({
        assetId: pa.assetId,
        symbol: pa.asset.ticker,
        actualPrice: await this.assetsService.getSharePrice(pa.asset.ticker),
      })),
    );
  }

  calculateAssetsTotalPrice(assets: AssetsWithPrices[]) {
    return assets.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
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
        portfolioAssets: {
          include: {
            asset: true,
            transactions: { where: { portfolioId: id } },
          },
        },
      },
    });

    if (!portfolio) throw new NotFoundException('Portfolio not found');

    const periodStart = periodStartDate(period);
    let totalCost = 0;
    let totalCurrent = 0;
    let hasPosition = false;

    for (const pa of portfolio.portfolioAssets) {
      if (pa.asset.currentPrice == null) continue;
      const position = calcPeriodPosition(pa.transactions, periodStart);
      if (!position || position.avgPrice === 0) continue;

      hasPosition = true;
      totalCost += position.avgPrice * position.quantity;
      totalCurrent += pa.asset.currentPrice * position.quantity;
    }

    if (!hasPosition || totalCost === 0) {
      return { pctReturn: null, dollarReturn: null };
    }

    return {
      pctReturn: ((totalCurrent - totalCost) / totalCost) * 100,
      dollarReturn: totalCurrent - totalCost,
    };
  }
}

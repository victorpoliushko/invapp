import { plainToInstance } from 'class-transformer';
import { applyCashCredit, CashCredit } from '../cash/cash-ledger';
import { cipher, optionalCipher } from '../common/cipher';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { PortfolioDto } from './dto/Portfolio.dto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AddAssetInputDto } from './dto/AssetToPortfolio.dto';
import { DeleteAssetsFromPortfolioDto } from './dto/DeleteAssetsFromPortfolio.dto';
import { Currency } from './dto/PortfolioBalance.dto';
import { AssetsService } from '../assets/assets.service';
import { UpdatePortfolioDto } from './dto/UpdatePortfolio.dto';
import { Prisma } from '@prisma/client';

const POSITION_INCLUDE = {
  include: { asset: true, transactions: { orderBy: { date: 'desc' as const } } },
};

const FULL_PORTFOLIO_INCLUDE = {
  stockPositions: POSITION_INCLUDE,
  cryptoPositions: POSITION_INCLUDE,
  bonds: { include: { transactions: { orderBy: { date: 'desc' as const } } } },
  realEstateAssets: { include: { transactions: { orderBy: { startDate: 'desc' as const } } } },
  mixedAssets: true,
  cash: true,
} satisfies Prisma.PortfolioInclude;

@Injectable()
export class PortfoliosService {
  constructor(
    private prismaService: PrismaService,
    private assetsService: AssetsService,
  ) {}

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
      data: { name: input.name, userId: input.userId, goal: optionalCipher(input.goal, 'goal') },
      include: { user: true },
    });
    return plainToInstance(PortfolioDto, createdPortfolio);
  }

  async getById(id: string, userId: string): Promise<PortfolioDto> {
    await this.assertOwnership(id, userId);

    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: FULL_PORTFOLIO_INCLUDE,
    });
    return plainToInstance(PortfolioDto, portfolio);
  }

  async update(input: UpdatePortfolioDto, userId: string): Promise<PortfolioDto> {
    await this.assertOwnership(input.id, userId);

    const portfolio = await this.prismaService.portfolio.update({
      where: { id: input.id },
      data: {
        name: input.name,
        ...(input.displayCurrency !== undefined && { displayCurrency: input.displayCurrency }),
      },
      include: FULL_PORTFOLIO_INCLUDE,
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
      include: FULL_PORTFOLIO_INCLUDE,
    });
    return portfolios.map((p) => plainToInstance(PortfolioDto, p));
  }

  async addAssetToPortfolio(id: string, input: AddAssetInputDto, userId: string): Promise<PortfolioDto> {
    await this.assertOwnership(id, userId);

    const quantityChange = cipher(input.quantityChange, 'quantityChange');
    const pricePerUnit = cipher(input.pricePerUnit, 'pricePerUnit');
    const quantity = cipher(input.position?.quantity, 'position.quantity');
    const price = optionalCipher(input.position?.price, 'position.price') ?? null;

    let asset = input.assetId
      ? await this.prismaService.asset.findUnique({ where: { id: input.assetId } })
      : await this.assetsService.findAssetByName(input.assetName);

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
    const key = { portfolioId_assetId: { portfolioId: id, assetId: asset.id } };

    await this.prismaService.$transaction(async (tx) => {
      const position: any = isCrypto ? tx.cryptoPosition : tx.stockPosition;
      const transaction: any = isCrypto ? tx.cryptoTransaction : tx.stockTransaction;

      await position.upsert({
        where: key,
        create: { portfolioId: id, assetId: asset.id, quantity, price },
        update: { quantity, price },
      });
      await transaction.create({
        data: {
          type: input.type,
          quantityChange,
          pricePerUnit,
          date: new Date(input.date),
          portfolioId: id,
          assetId: asset.id,
        },
      });
      await applyCashCredit(tx, id, input.cash);
    });

    return this.getById(id, userId);
  }

  async sellAllAsset(id: string, assetId: string, cash: CashCredit | undefined, userId: string): Promise<PortfolioDto> {
    await this.assertOwnership(id, userId);

    const asset = await this.prismaService.asset.findUnique({ where: { id: assetId } });
    const isCrypto = asset?.type === 'CRYPTOCURRENCY';

    await this.prismaService.$transaction(async (tx) => {
      await this.removePosition(tx, id, assetId, isCrypto);
      await applyCashCredit(tx, id, cash);
    });

    return this.getById(id, userId);
  }

  async deleteAsset(id: string, input: DeleteAssetsFromPortfolioDto, userId: string): Promise<PortfolioDto> {
    await this.assertOwnership(id, userId);

    const asset = await this.prismaService.asset.findUnique({ where: { id: input.assetId } });
    await this.prismaService.$transaction((tx) =>
      this.removePosition(tx, id, input.assetId, asset?.type === 'CRYPTOCURRENCY'),
    );

    return this.getById(id, userId);
  }

  private async removePosition(tx: Prisma.TransactionClient, portfolioId: string, assetId: string, isCrypto: boolean) {
    const key = { portfolioId_assetId: { portfolioId, assetId } };
    if (isCrypto) {
      await tx.cryptoTransaction.deleteMany({ where: { portfolioId, assetId } });
      await tx.cryptoPosition.delete({ where: key });
    } else {
      await tx.stockTransaction.deleteMany({ where: { portfolioId, assetId } });
      await tx.stockPosition.delete({ where: key });
    }
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
}

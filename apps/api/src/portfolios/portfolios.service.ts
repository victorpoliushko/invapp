import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { PortfolioDto } from './dto/Portfolio.dto';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { AddAssetInputDto } from './dto/AssetToPortfolio.dto';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
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

interface AddAssetInput {
  assetName: string;
  dueDate: string;
  quantity: number;
  price: number;
}

@Injectable()
export class PortfoliosService {
  constructor(
    private prismaService: PrismaService,
    private assetsService: AssetsService,
  ) {}

  async create(input: CreatePortfolioDto): Promise<PortfolioDto> {
    const createdPortfolio = await this.prismaService.portfolio.create({
      data: input,
      include: { user: true },
    });
    return plainToInstance(PortfolioDto, createdPortfolio);
  }

  async getById(id: string): Promise<PortfolioDto> {
    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: {
        portfolioAssets: {
          include: {
            assets: {
              include: {
                transactions: {
                  where: { portfolioId: id },
                  orderBy: { date: 'desc' },
                },
              },
            },
          },
        },
        transactions: true,
      },
    });
    return plainToInstance(PortfolioDto, portfolio);
  }

  async update(input: UpdatePortfolioDto): Promise<PortfolioDto> {
    const portfolio = await this.prismaService.portfolio.update({
      where: { id: input.id },
      data: {
        name: input.name,
      },
      include: { portfolioAssets: { include: { assets: true } } },
    });
    return plainToInstance(PortfolioDto, portfolio);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.portfolio.delete({
      where: { id },
    });
  }

  async getByUserId(userId: string): Promise<PortfolioDto[]> {
    const portfolios = await this.prismaService.portfolio.findMany({
      where: { userId },
      include: { portfolioAssets: { include: { assets: true } } },
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
  ): Promise<PortfolioDto> {
    const exsitingPortfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
    });

    if (!exsitingPortfolio) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.NOT_FOUND),
        StatusCodes.NOT_FOUND,
      );
    }

    let asset = await this.assetsService.findAssetByName(input.assetName);

    if (!asset) {
      asset = await this.assetsService.createAsset({ ticker: input.assetName });
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
        include: { portfolioAssets: { include: { assets: true } } },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async deleteAsset(
    id: string,
    input: DeleteAssetsFromPortfolioDto,
  ): Promise<PortfolioDto> {
    await this.prismaService.portfolioAsset.delete({
      where: {
        portfolioId_assetId: {
          portfolioId: id,
          assetId: input.assetId,
        },
      },
    });

    await this.prismaService.transaction.deleteMany({
      where: {
        portfolioId: id,
        assetId: input.assetId,
      },
    });

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { portfolioAssets: { include: { assets: true } } },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async getPortfolioBalance(id: string, currency: Currency): Promise<any> {
    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: {
        portfolioAssets: {
          include: {
            assets: true,
          },
        },
      },
    });

    if (!portfolio) throw new NotFoundException('Portfolio not found');
    const prices = [];
    for (const pa of portfolio.portfolioAssets) {
      console.log(`Fetching price for ${pa.assets.ticker}...`);
      const price = await this.assetsService.getSharePrice(pa.assets.ticker);
      console.log(`
       price: ${JSON.stringify(price)} 
      `);

      prices.push({
        assetId: pa.assetId,
        symbol: pa.assets.ticker,
        actualPrice: price,
      });

      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    return prices;
  }

  calculateAssetsTotalPrice(assets: AssetsWithPrices[]) {
    return assets.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  }
}

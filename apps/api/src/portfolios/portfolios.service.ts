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

    console.log(`
     PS created asset: ${JSON.stringify(asset)} 
    `);

    const existingAsset = await this.prismaService.portfolioAsset.findUnique({
      where: {
        portfolioId_assetId: {
          portfolioId: id,
          assetId: asset.id,
        },
      },
      include: {
        assets: {
          include: {
            transactions: true,
          },
        },
      },
    });

    console.log(`
     PS existing portfolio-asset: ${JSON.stringify(existingAsset)} 
    `);

    [
      {
        portfolioId: '140f5933-6f4b-424f-86c3-3f350a2b1293',
        assetId: '9a4d67b9-1c7f-4379-8ee8-9d2f327d8418',
        quantity: 4,
        price: 100,
        assets: {
          id: '9a4d67b9-1c7f-4379-8ee8-9d2f327d8418',
          ticker: 'VOO',
          name: null,
          type: null,
          exchange: null,
          dataSource: null,
          updatedAt: '2025-11-24T14:18:21.556Z',
          transactions: [
            {
              id: '37c198e8-76d7-43a1-a549-81b559620fe4',
              portfolioId: '140f5933-6f4b-424f-86c3-3f350a2b1293',
              assetId: '9a4d67b9-1c7f-4379-8ee8-9d2f327d8418',
              type: 'BUY',
              quantityChange: 22,
              pricePerUnit: 23,
              date: '2026-01-08T00:00:00.000Z',
            },
            {
              id: '7a26565e-48a4-4f0e-a935-fee2c34c5d69',
              portfolioId: '140f5933-6f4b-424f-86c3-3f350a2b1293',
              assetId: '9a4d67b9-1c7f-4379-8ee8-9d2f327d8418',
              type: 'BUY',
              quantityChange: 25,
              pricePerUnit: 33,
              date: '2026-01-16T00:00:00.000Z',
            },
            {
              id: 'a9d72498-c0cd-4bea-a40a-491c835f23d1',
              portfolioId: '140f5933-6f4b-424f-86c3-3f350a2b1293',
              assetId: '9a4d67b9-1c7f-4379-8ee8-9d2f327d8418',
              type: 'BUY',
              quantityChange: 6,
              pricePerUnit: 8,
              date: '2026-01-24T00:00:00.000Z',
            },
            {
              id: 'efe73b76-270e-4aec-a20d-2c99bd9301c0',
              portfolioId: '140f5933-6f4b-424f-86c3-3f350a2b1293',
              assetId: '9a4d67b9-1c7f-4379-8ee8-9d2f327d8418',
              type: 'BUY',
              quantityChange: 6,
              pricePerUnit: 8,
              date: '2026-01-24T00:00:00.000Z',
            },
            {
              id: '754042a1-b593-485f-94c4-975258aba67c',
              portfolioId: '140f5933-6f4b-424f-86c3-3f350a2b1293',
              assetId: '9a4d67b9-1c7f-4379-8ee8-9d2f327d8418',
              type: 'BUY',
              quantityChange: 2,
              pricePerUnit: 2,
              date: '2026-01-25T00:00:00.000Z',
            },
            {
              id: '4a7d3570-1187-47fc-9dd3-1d3a6a259a76',
              portfolioId: '140f5933-6f4b-424f-86c3-3f350a2b1293',
              assetId: '9a4d67b9-1c7f-4379-8ee8-9d2f327d8418',
              type: 'BUY',
              quantityChange: 4,
              pricePerUnit: 100,
              date: '2026-03-01T00:00:00.000Z',
            },
            {
              id: 'abf2415a-ec8e-4818-abf2-50c6ed5639c0',
              portfolioId: '140f5933-6f4b-424f-86c3-3f350a2b1293',
              assetId: '9a4d67b9-1c7f-4379-8ee8-9d2f327d8418',
              type: 'BUY',
              quantityChange: 4,
              pricePerUnit: 100,
              date: '2026-03-01T00:00:00.000Z',
            },
          ],
        },
      },
    ];

    // get all transactions and add to set portfolioAsset ang price
    // const transactions = existingAsset.assets.transactions.map(t => t);

    // const existingAsset = await this.prismaService.portfolioAsset.findUnique(
    //   {
    //     where: {
    //       portfolioId_assetId: {
    //         portfolioId: id,
    //         assetId: asset.id,
    //       },
    //     },
    //   },
    // );

    // console.log(`
    //  PS input: ${JSON.stringify(input)}
    // `);

    let newQuantity = input.quantityChange;
    let newAvgPrice = input.pricePerUnit;

          let totalCost = 0;
      let quantity = 0;

    if (existingAsset) {
      // const oldQuantity = existingAsset.quantity;
      // const oldAvgPrice = existingAsset.price;

      // if (input.type === TransactionType.BUY) {
      //   newQuantity = oldQuantity + input.quantityChange;
      // }
      // else newQuantity = oldQuantity - input.quantityChange;

      // newAvgPrice = Math.round(
      //   (oldAvgPrice * oldQuantity + input.pricePerUnit * input.quantityChange) /
      //     newQuantity,
      // );

      existingAsset.assets.transactions.map((t) => {
        if (t.type === TransactionType.BUY) {
          totalCost += t.quantityChange * t.pricePerUnit;
          quantity += t.quantityChange;
        }
        if (t.type === TransactionType.SELL) {
          totalCost -= t.quantityChange * t.pricePerUnit;
          quantity -= t.quantityChange;
        }
        if (quantity === 0) {
          totalCost = 0;
          quantity = 0;
        }
      });
    }

    await this.prismaService.portfolioAsset.upsert({
      where: { portfolioId_assetId: { portfolioId: id, assetId: asset.id } },
      update: { quantity, price: newAvgPrice },
      create: {
        portfolioId: id,
        assetId: asset.id,
        quantity,
        price: newAvgPrice,
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
      }
    });

    await this.prismaService.transaction.deleteMany({
      where: {
        portfolioId: id,
        assetId: input.assetId
      }
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

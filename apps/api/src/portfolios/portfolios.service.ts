import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { PortfolioDto } from './dto/Portfolio.dto';
import { HttpException, Injectable } from '@nestjs/common';
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
        assets: {
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
      include: { assets: { include: { assets: true } } },
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
      include: { assets: { include: { assets: true } } },
    });
    return portfolios.map((p) => plainToInstance(PortfolioDto, p));
  }

  async syncAssetPrice(asset: any) {
    const exsitingAsset = await this.prismaService.asset.findUnique({
      where: asset[0].id
        ? { id: asset[0].id }
        : { asset: asset[0].assetSymbol },
    });

    return await this.assetsService.getSharePrice(exsitingAsset.asset);
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

    console.log(`
     PS found asset: ${JSON.stringify(asset)} 
    `);

    if (!asset) {
      asset = await this.assetsService.createAsset({ asset: input.assetName });
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

    console.log(`
     PS input: ${JSON.stringify(input)} 
    `);

    let newQuantity = input.quantityChange;
    let newAvgPrice = input.pricePerUnit;

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
      let totalCost = 0;
      let quantity = 0;
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
      update: { quantity: newQuantity, price: newAvgPrice },
      create: {
        portfolioId: id,
        assetId: asset.id,
        quantity: newQuantity,
        price: newAvgPrice,
      },
    });

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { assets: { include: { assets: true } } },
      });

    console.log(`
      PS updatedPortfolio: ${JSON.stringify(updatedPortfolio)} 
      `);

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

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { assets: { include: { assets: true } } },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async getPortfolioBalance(id: string, currency: Currency): Promise<any> {
    const portfolios = await this.prismaService.portfolio.findMany({
      where: { id },
      include: {
        assets: {
          include: {
            assets: true,
          },
        },
      },
    });

    const portfoliosWithAssetsPrice = await Promise.all(
      portfolios.map(async (portfolio) => {
        const assetsWithPrices = await Promise.all(
          portfolio.assets.map(async (portfolioAssets) => {
            const price = await this.assetsService.getSharePrice(
              portfolioAssets.assets.asset,
            );
            return {
              asset: portfolioAssets.assets.asset,
              price,
              currency,
              quantity: portfolioAssets.quantity,
            };
          }),
        );
        return {
          ...portfolios,
          assets: assetsWithPrices,
          totalPrice: this.calculateAssetsTotalPrice(assetsWithPrices),
        };
      }),
    );

    return portfoliosWithAssetsPrice;
  }

  calculateAssetsTotalPrice(assets: AssetsWithPrices[]) {
    return assets.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  }
}

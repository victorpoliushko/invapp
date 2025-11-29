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
import { Asset } from '@prisma/client';

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
      include: { assets: { include: { assets: true } } },
    });
    return plainToInstance(PortfolioDto, portfolio);
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

  async addAsset(id: string, input: AddAssetInputDto): Promise<PortfolioDto> {
    /*
     *  1. find existing portfolio
     *  2. find existing asset
     *    - if exists - proceed
     *    - if doesn't exist in Asset table then add find in external API and add to Asset table
     *    - if doesn't exist in external API then create from scratch and add to Asset table
     *  3. add asset to the PortfolioAsset
     */

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
      asset = await this.assetsService.createAsset({ asset: input.assetName });
    }

    await this.prismaService.portfolioAsset.upsert({
      where: { portfolioId_assetId: { portfolioId: id, assetId: asset.id } },
      update: { quantity: input.quantity, price: input.price },
      create: {
        portfolioId: id,
        assetId: asset.id,
        quantity: input.quantity,
        price: input.price,
      },
    });

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { assets: { include: { assets: true } } },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async deleteAssets(
    id: string,
    input: DeleteAssetsFromPortfolioDto,
  ): Promise<PortfolioDto> {
    await this.prismaService.portfolioAsset.deleteMany({
      where: { portfolioId: id, assetId: { in: input.assetIds } },
    });

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { assets: true },
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

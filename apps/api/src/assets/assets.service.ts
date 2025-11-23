import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { Asset, DataSource } from '@prisma/client';
import { CreateAssetDto, AssetDto, UpdateAssetDto } from './dto/Asset.dto';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { PaginationDTO } from './dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AssetsService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prismaService: PrismaService,
  ) {}

  async getSharePrice(asset: string): Promise<number> {
    try {
      const apikey = this.configService.get<string>('API_KEY');

      const matchingUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${asset.trim().toUpperCase()}&apikey=${apikey}`;
      const matchingResponse = await lastValueFrom(
        this.httpService.get(matchingUrl),
      );

      const matches = matchingResponse.data?.bestMatches || [];

      if (
        matches.length <= 0 ||
        !matches.some(
          (match) =>
            match['1. asset'].trim().toUpperCase() ===
            asset.trim().toUpperCase(),
        )
      ) {
        throw new HttpException(
          getReasonPhrase(StatusCodes.NOT_FOUND),
          StatusCodes.NOT_FOUND,
        );
      }

      const pricingUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&asset=${asset}&interval=5min&apikey=${apikey}`;

      const response = await lastValueFrom(this.httpService.get(pricingUrl));
      const timeSeries = response.data['Time Series (5min)'];

      if (!timeSeries) {
        throw new Error('No time series data available');
      }
      const latestTimestapm = Object.keys(timeSeries)[0];
      const latestData = timeSeries[latestTimestapm];
      const price = parseFloat(latestData['4. close']);

      return price;
    } catch (error) {
      console.log(error);
      console.error('API error:', error.response?.data);
      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAssets(paginationDTO: PaginationDTO): Promise<AssetDto[]> {
    return await this.prismaService.asset.findMany({
      take: paginationDTO.limit,
      skip: paginationDTO.offset,
    });
  }

  async createAsset(input: CreateAssetDto): Promise<Asset> {
    console.log(`
     create input: ${JSON.stringify(input)} 
    `);
    const id = uuidv4();
    return await this.prismaService.asset.create({
      data: {
        id,
        asset: input.asset,
        name: input.name,
        type: input.type,
        exchange: input.exchange,
        dataSource: input.dataSource
      },
    });
  }

  async updateAsset(input: UpdateAssetDto): Promise<Asset> {
    return await this.prismaService.asset.update({
      where: input.id ? { id: input.id } : { asset: input.asset },
      data: input,
    });
  }

  async fetchAndStoreAssets() {
    try {
      const func = 'LISTING_STATUS';
      const apikey = this.configService.get<string>('API_KEY');
      const url = `https://www.alphavantage.co/query?function=${func}&apikey=${apikey}`;
      const response = await lastValueFrom(this.httpService.get(url));

      const data = response.data.split('\n').slice(1);
      const alphavantageData = data.map((line) => {
        const [asset, name, exchange, type] = line.split(',');
        return {
          asset,
          name,
          exchange,
          type,
          dataSource: DataSource.ALPHA_VANTAGE,
        };
      });

      alphavantageData.pop();

      await this.prismaService.asset.createMany({
        data: alphavantageData,
        skipDuplicates: true,
      });

      console.log(`Fetched and stored ${alphavantageData.length} assets.`);
    } catch (error) {
      console.error('Error fetching assets', error);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findAsset(asset: string): Promise<Asset> {
    try {
      const apikey = this.configService.get<string>('API_KEY');
      const matchingUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${asset.trim().toUpperCase()}&apikey=${apikey}`;

      const response = await lastValueFrom(this.httpService.get(matchingUrl));
      const matches = response.data?.bestMatches || [];

      return matches.map((m) => ({
        assetSymbol: m['1. symbol'],
        name: m['2. name'],
        region: m['4. region'],
        currency: m['8. currency'],
      }));
    } catch (error) {
      console.log(error);
      console.error('Error in find assets:', error.response?.data);
      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

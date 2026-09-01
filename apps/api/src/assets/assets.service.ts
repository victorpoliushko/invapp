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
import * as finnhub from 'finnhub';

@Injectable()
export class AssetsService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prismaService: PrismaService,
  ) {}

  async getSharePrice(asset: string): Promise<number> {
    const symbol = asset.trim().toUpperCase();
    const CACHE_TTL_MS = 60 * 60 * 1000;

    const existing = await this.prismaService.asset.findUnique({ where: { ticker: symbol } });
    if (
      existing?.currentPrice != null &&
      existing.priceUpdatedAt &&
      Date.now() - existing.priceUpdatedAt.getTime() < CACHE_TTL_MS
    ) {
      return existing.currentPrice;
    }

    if (existing?.dataSource === 'COINGECKO' && existing.coingeckoId) {
      return this.getCryptoPrice(existing.coingeckoId, symbol);
    }

    try {
      const apikey = this.configService.get<string>('FINNHUB_API_KEY');
      const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apikey}`;

      const response = await lastValueFrom(this.httpService.get(quoteUrl));
      const price = response.data?.c;

      if (!price) {
        console.error('Full API Response:', JSON.stringify(response.data));
        return existing?.currentPrice ?? 0;
      }

      await this.prismaService.asset.update({
        where: { ticker: symbol },
        data: { currentPrice: price, priceUpdatedAt: new Date() },
      });

      return price;
    } catch (error) {
      console.error(`API error for ${asset}:`, error.message);
      return existing?.currentPrice ?? 0;
    }
  }

  async getCryptoPrice(coingeckoId: string, ticker: string): Promise<number> {
    try {
      const coingeckoApiKey = this.configService.get<string>('COINGECKO_API_KEY');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`;
      const response = await lastValueFrom(
        this.httpService.get(url, { headers: { 'x-cg-demo-api-key': coingeckoApiKey } }),
      );
      const price: number = response.data?.[coingeckoId]?.usd;

      if (!price) return 0;

      await this.prismaService.asset.update({
        where: { ticker: ticker.toUpperCase() },
        data: { currentPrice: price, priceUpdatedAt: new Date() },
      });

      return price;
    } catch (error) {
      console.error(`CoinGecko price error for ${coingeckoId}:`, error.message);
      const existing = await this.prismaService.asset.findUnique({ where: { ticker: ticker.toUpperCase() } });
      return existing?.currentPrice ?? 0;
    }
  }

async testFinnhub(symbol: string) {
  const finnhub_api_key = this.configService.get<string>('FINNHUB_API_KEY');
const url = `https://finnhub.io/api/v1//quote?symbol=${symbol}&token=${finnhub_api_key}`;
const response = await lastValueFrom(this.httpService.get(url));
return response.data;
}

  async findAssetByName(ticker: string): Promise<AssetDto> {
    return await this.prismaService.asset.findFirst({ where: { ticker } });
  }

  async getAssets(paginationDTO: PaginationDTO): Promise<AssetDto[]> {
    return await this.prismaService.asset.findMany({
      take: paginationDTO.limit,
      skip: paginationDTO.offset,
    });
  }

  async createAsset(input: CreateAssetDto): Promise<Asset> {
    const id = uuidv4();
    return await this.prismaService.asset.create({
      data: {
        id,
        ticker: input.ticker,
        name: input.name,
        type: input.type,
        exchange: input.exchange,
        dataSource: input.dataSource,
        coingeckoId: input.coingeckoId,
      },
    });
  }

  async updateAsset(input: UpdateAssetDto): Promise<Asset> {
    return await this.prismaService.asset.update({
      where: input.id ? { id: input.id } : { ticker: input.ticker },
      data: input,
    });
  }

  async fetchAndStoreAssets() {
    try {
      const apikey = this.configService.get<string>('FINNHUB_API_KEY');
      const url = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${apikey}`;
      const response = await lastValueFrom(this.httpService.get(url));

      const finnhubData = (response.data || []).map((entry) => ({
        asset: entry.symbol,
        name: entry.description,
        exchange: entry.mic,
        type: entry.type,
        dataSource: DataSource.FINNHUB,
      }));

      await this.prismaService.asset.createMany({
        data: finnhubData,
        skipDuplicates: true,
      });

      console.log(`Fetched and stored ${finnhubData.length} assets.`);
    } catch (error) {
      console.error('Error fetching assets', error);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async searchCrypto(query: string): Promise<{ id: string; symbol: string; name: string; thumb: string }[]> {
    const coingeckoApiKey = this.configService.get<string>('COINGECKO_API_KEY');
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
    const response = await lastValueFrom(
      this.httpService.get(url, { headers: { 'x-cg-demo-api-key': coingeckoApiKey } }),
    );
    const coins: any[] = response.data?.coins ?? [];
    return coins.slice(0, 10).map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      thumb: c.thumb,
    }));
  }

  async findAssetInAPI(asset: string): Promise<Asset> {
    try {
      const apikey = this.configService.get<string>('FINNHUB_API_KEY');
      const matchingUrl = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(asset.trim())}&token=${apikey}`;

      const response = await lastValueFrom(this.httpService.get(matchingUrl));
      const matches = response.data?.result || [];

      return matches.map((m) => ({
        assetSymbol: m.symbol,
        name: m.description,
      }));
    } catch (error) {
      console.error('Error in find assets:', error.response?.data);
      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

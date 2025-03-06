import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { DataSource } from '@prisma/client';
import { SymbolDto } from './dto/Symbol.dto';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

@Injectable()
export class SymbolsService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prismaService: PrismaService
  ) {}

  async getSharePrice(symbol: string): Promise<number> {
    try {
      const apikey = this.configService.get<string>('API_KEY');
      
      const matchingUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${apikey}`;
      // error drops when matchingUrl does not find the symbol
      const matchingResponse = await lastValueFrom(this.httpService.get(matchingUrl));
      const matches = matchingResponse.data?.bestMatches || [];

      console.log(`matches: ${JSON.stringify(matches)}`)
      const somes = matches.some(match => match["1. symbol"] === symbol)
      console.log(`some: ${JSON.stringify(somes)}`)

      if (!matches.some(match => match["1. symbol"] === symbol)) {
        throw new HttpException(getReasonPhrase(StatusCodes.NOT_FOUND), StatusCodes.NOT_FOUND);
      }

      const pricingUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apikey}`;

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
      console.error('API error:', error.response?.data);
      throw new HttpException('Error fetching data', 500);
    }
  }

  async getSymbols(limit: number): Promise<SymbolDto[]> {
    return await this.prismaService.symbol.findMany({ take: limit });
  }

  async fetchAndStoreSymbols() {
    try {
      const func = 'LISTING_STATUS';
      const apikey = this.configService.get<string>('API_KEY');
      const url = `https://www.alphavantage.co/query?function=${func}&apikey=${apikey}`;
      const response = await lastValueFrom(this.httpService.get(url));

      const data = response.data.split('\n').slice(1);
      const alphavantageData = data.map(line => {
        const [symbol, name, exchange, type] = line.split(',');
        return { symbol, name, exchange, type, dataSource: DataSource.ALPHA_VANTAGE };
      });

      alphavantageData.pop();

      await this.prismaService.symbol.createMany({
        data: alphavantageData,
        skipDuplicates: true
      });

      console.log(`Fetched and stored ${alphavantageData.length} symbols.`);
    } catch (error) {
      console.error('Error fetching symbols', error);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}

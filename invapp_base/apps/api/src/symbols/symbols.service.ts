import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

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
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apikey}`;

      const response = await lastValueFrom(this.httpService.get(url));
      console.log('Response data:', response.data);
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

  // WIP
  async fetchAndStoreSymbols() {
    try {
      const apikey = this.configService.get<string>('API_KEY');
      const url = `https://www.alphavantage.co/query`;
      const response = this.httpService.get(url, {
        params: {
          function: 'LISTING_STATUS',
          apikey
        }
      });

      console.log(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching symbols', error);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  // async getPortfolioPrice(symbols: string[]): Promise<>

  testGetPort() {
    console.log(`PORT: ${this.configService.get<string>('TEST_PORT')}`);
    console.log(`config port: ${this.configService.get<string>('test_port_configuration')}`);
  }
}

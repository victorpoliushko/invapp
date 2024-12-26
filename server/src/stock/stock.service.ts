import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable()
export class StockService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async getSharePrice(symbol: string): Promise<number> {
    try {
      const apiKey = this.configService.get<string>('API_KEY');
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apiKey}`;

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
}

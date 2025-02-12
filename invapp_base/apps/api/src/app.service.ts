import { Injectable } from '@nestjs/common';
import { StockService } from './stocks/stocks.service';

@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello World!';
  }
}

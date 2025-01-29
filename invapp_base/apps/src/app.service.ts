import { Injectable } from '@nestjs/common';
import { StockService } from './stock/stock.service';

@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello World!';
  }
}

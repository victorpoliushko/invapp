import { Controller, Get, Query } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {};

  @Get('price')
  async getSharePrice(@Query('symbol') symbol: string): Promise<{price: number}> {
    const price = await this.stockService.getSharePrice(symbol);
    return { price };
  }

  @Get('test')
  testGetPort() {
    return this.stockService.testGetPort();
  }
}

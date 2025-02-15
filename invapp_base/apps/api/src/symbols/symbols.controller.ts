import { Controller, Get, Query } from '@nestjs/common';
import { SymbolsService } from './symbols.service';

@Controller('symbols')
export class SymbolsController {
  constructor(private readonly symbolsService: SymbolsService) {};

  @Get('price')
  async getSharePrice(@Query('symbol') symbol: string): Promise<{price: number}> {
    const price = await this.symbolsService.getSharePrice(symbol);
    return { price };
  }

  @Get('test')
  testGetPort() {
    return this.symbolsService.testGetPort();
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { SymbolsService } from './symbols.service';
import { SymbolDto } from './dto/Symbol.dto';

@Controller('symbols')
export class SymbolsController {
  constructor(private readonly symbolsService: SymbolsService) {};

  @Get('price')
  async getSharePrice(@Query('symbol') symbol: string): Promise<{price: number}> {
    const price = await this.symbolsService.getSharePrice(symbol);
    return { price };
  }

  @Get()
  async getAllSymbols(@Query('limit') limit: number): Promise<SymbolDto[]> {
    console.log(`Limit: ${limit}, type: ${typeof limit}`)
    return await this.symbolsService.getSymbols(limit);
  }

  @Get('save-symbols')
  async getAndStoreSymbols(): Promise<any> {
    return await this.symbolsService.fetchAndStoreSymbols();
  }

  @Get('test')
  testGetPort() {
    return this.symbolsService.testGetPort();
  }
}

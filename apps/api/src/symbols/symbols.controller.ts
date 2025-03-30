import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { SymbolsService } from './symbols.service';
import { SymbolDto } from './dto/Symbol.dto';
import { PaginationDTO } from './dto/pagination.dto';

@Controller('symbols')
export class SymbolsController {
  constructor(private readonly symbolsService: SymbolsService) {};

  @Get('price')
  async getSharePrice(@Query('symbol') symbol: string): Promise<{price: number}> {
    const price = await this.symbolsService.getSharePrice(symbol);
    return { price };
  }

  @Get()
  async getAllSymbols(@Query() paginationDTO: PaginationDTO): Promise<SymbolDto[]> {
    return await this.symbolsService.getSymbols(paginationDTO);
  }

  @Get('save-symbols')
  async getAndStoreSymbols(): Promise<any> {
    return await this.symbolsService.fetchAndStoreSymbols();
  }
}

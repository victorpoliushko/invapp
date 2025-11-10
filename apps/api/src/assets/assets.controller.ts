import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetDto } from './dto/Asset.dto';
import { PaginationDTO } from './dto/pagination.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {};

  @Get('price')
  async getSharePrice(@Query('asset') asset: string): Promise<{price: number}> {
    const price = await this.assetsService.getSharePrice(asset);
    return { price };
  }

  @Get()
  async getAllAssets(@Query() paginationDTO: PaginationDTO): Promise<AssetDto[]> {
    return await this.assetsService.getAssets(paginationDTO);
  }

  @Get('save-assets')
  async getAndStoreAssets(): Promise<any> {
    return await this.assetsService.fetchAndStoreAssets();
  }

  @Get('search')
  async searchAsset(@Query('q') query: string) {
    return this.assetsService.findAsset(query);
  }
}

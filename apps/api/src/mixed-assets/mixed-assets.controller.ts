import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MixedAssetsService } from './mixed-assets.service';
import { CreateMixedAssetDto } from './dto/create-mixed-asset.dto';
import { UpdateMixedAssetDto } from './dto/update-mixed-asset.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('mixed-assets')
export class MixedAssetsController {
  constructor(private readonly mixedAssetsService: MixedAssetsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  create(@Body() createMixedAssetDto: CreateMixedAssetDto) {
    return this.mixedAssetsService.create(createMixedAssetDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  findAll() {
    return this.mixedAssetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mixedAssetsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMixedAssetDto: UpdateMixedAssetDto) {
    return this.mixedAssetsService.update(+id, updateMixedAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mixedAssetsService.remove(+id);
  }
}

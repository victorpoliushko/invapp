import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query, Headers } from '@nestjs/common';
import { MixedAssetsService } from './mixed-assets.service';
import { CreateMixedAssetDto } from './dto/create-mixed-asset.dto';
import { UpdateMixedAssetDto } from './dto/update-mixed-asset.dto';
import { AuthGuard } from '@nestjs/passport';
import { IdParamDto } from './dto/id-param-dto';
import { ParseLimitPipe } from './pipes/parseLimitPipe';
import { HeadersDto } from './dto/headers.dto';
import { RequestHeader } from './pipes/request-header';

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
  findAll(@Query('limit', ParseLimitPipe) limit: number) {
    return this.mixedAssetsService.findAll(limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  findOne(@Param() { id }: IdParamDto) {
    return this.mixedAssetsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() updateMixedAssetDto: UpdateMixedAssetDto) {
    return this.mixedAssetsService.update(id, updateMixedAssetDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  remove(@Param('id') id: string) {
    return this.mixedAssetsService.remove(id);
  }
}

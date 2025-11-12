import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { GetUser } from '../auth/decorators/GetUser.decorator';
import { User } from '@prisma/client';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { DeleteAssetsFromPortfolioDto } from './dto/DeleteAssetsFromPortfolio.dto';
import { Currency } from './dto/PortfolioBalance.dto';
import { AddAssetInputDto } from './dto/AssetToPortfolio.dto';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private portfoliosService: PortfoliosService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  createPortfolio(
    @Body() createPortfolioDto: CreatePortfolioDto,
    @GetUser() user: User,
  ) {
    if (createPortfolioDto.userId !== user.id) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN,
      );
    }
    return this.portfoliosService.create(createPortfolioDto);
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  getPortfolio(@Param('id') id: string) {
    return this.portfoliosService.getById(id);
  }

  @Get('/user/:userId')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  getPortfoliosByUserId(@Param('userId') userId: string) {
    return this.portfoliosService.getByUserId(userId);
  }

  @Post('/:id/assets')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  addAsset(@Param('id') id: string, @Body() addAssetToPortfolioDto: AddAssetInputDto) {
    return this.portfoliosService.addAsset(id, addAssetToPortfolioDto);
  }

  // @Patch(':id/assets')
  // @UseGuards(AuthGuard('jwt'))
  // @UsePipes(new ValidationPipe())
  // updateAssets(@Param('id') id: string, @Body() updateAssetsToPortfolioDto: AssetToPortfolioDto) {
  //   return this.portfoliosService.updateAssets(id, updateAssetsToPortfolioDto);
  // }

  @Delete(':id/assets')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  deleteAssets(@Param('id') id: string, @Body() deleteAssetsDto: DeleteAssetsFromPortfolioDto) {
    return this.portfoliosService.deleteAssets(id, deleteAssetsDto);
  }

  @Get(':id/balance')
  getBalance(@Param('id') id: string, @Query('currency') currency: Currency) {
    return this.portfoliosService.getPortfolioBalance(id, currency);
  }
}

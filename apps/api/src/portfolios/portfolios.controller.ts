import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { PortfoliosService, ReturnPeriod } from './portfolios.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { GetUser } from '../auth/decorators/GetUser.decorator';
import { User } from '@prisma/client';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { DeleteAssetsFromPortfolioDto } from './dto/DeleteAssetsFromPortfolio.dto';
import { Currency } from './dto/PortfolioBalance.dto';
import { AddAssetInputDto } from './dto/AssetToPortfolio.dto';
import { UpdatePortfolioDto } from './dto/UpdatePortfolio.dto';

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

  @Patch('/:id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  updatePortfolio(
    @Param('id') id: string,
    @Body() updatePortfolioInput: UpdatePortfolioDto,
    @GetUser() user: User,
  ) {
    return this.portfoliosService.update(updatePortfolioInput, user.id);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  deletePortfolio(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return this.portfoliosService.delete(id, user.id);
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  getPortfolio(@Param('id') id: string, @GetUser() user: User) {
    return this.portfoliosService.getById(id, user.id);
  }

  @Get('/user/:userId')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  getPortfoliosByUserId(@Param('userId') userId: string, @GetUser() user: User) {
    if (userId !== user.id) {
      throw new ForbiddenException('You do not have access to this user\'s portfolios');
    }
    return this.portfoliosService.getByUserId(userId);
  }

  @Post('/:id/assets')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  addAssetToPortfolio(
    @Param('id') id: string,
    @Body() addAssetToPortfolioDto: AddAssetInputDto,
    @GetUser() user: User,
  ) {
    return this.portfoliosService.addAssetToPortfolio(id, addAssetToPortfolioDto, user.id);
  }

  @Delete('/:id/assets')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  deleteAsset(
    @Param('id') assetId: string,
    @Body() deleteAssetsDto: DeleteAssetsFromPortfolioDto,
    @GetUser() user: User,
  ) {
    return this.portfoliosService.deleteAsset(assetId, deleteAssetsDto, user.id);
  }

  @Get(':id/balance')
  @UseGuards(AuthGuard('jwt'))
  getBalance(
    @Param('id') id: string,
    @Query('currency') currency: Currency,
    @GetUser() user: User,
  ) {
    return this.portfoliosService.getPortfolioBalance(id, currency, user.id);
  }

  @Get(':id/returns')
  @UseGuards(AuthGuard('jwt'))
  getReturns(
    @Param('id') id: string,
    @Query('period') period: ReturnPeriod = 'all',
    @GetUser() user: User,
  ) {
    return this.portfoliosService.getPortfolioReturns(id, period, user.id);
  }
}

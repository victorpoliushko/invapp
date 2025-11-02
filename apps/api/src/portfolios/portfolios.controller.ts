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
import { SymbolToPortfolioDto } from './dto/SymbolToPortfolio.dto';
import { DeleteSymbolsFromPortfolioDto } from './dto/DeleteSymbolsFromPortfolio.dto';
import { Currency } from './dto/PortfolioBalance.dto';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private portfoliosService: PortfoliosService) {
    console.log('portfolios controller'); 
  }

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

  @Post('/:id/symbols')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  addSymbols(@Param('id') id: string, @Body() addSymbolToPortfolioDto: SymbolToPortfolioDto) {
    console.log(`
     add symbols controller method 
    `);
    return this.portfoliosService.addSymbols(id, addSymbolToPortfolioDto);
  }

  @Patch(':id/symbols')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  updateSymbols(@Param('id') id: string, @Body() updateSymbolsToPortfolioDto: SymbolToPortfolioDto) {
    return this.portfoliosService.updateSymbols(id, updateSymbolsToPortfolioDto);
  }

  @Delete(':id/symbols')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  deleteSymbols(@Param('id') id: string, @Body() deleteSymbolsDto: DeleteSymbolsFromPortfolioDto) {
    return this.portfoliosService.deleteSymbols(id, deleteSymbolsDto);
  }

  @Get(':id/balance')
  getBalance(@Param('id') id: string, @Query('currency') currency: Currency) {
    return this.portfoliosService.getPortfolioBalance(id, currency);
  }
}

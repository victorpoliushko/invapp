import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
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
import { AddSymbolToPortfolioDto } from './dto/AddSymbolsToPortfolio.dto';

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

  @Get(':userId')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  getPortfoliosByUserId(@Param('userId') userId: string) {
    return this.portfoliosService.getByUserId(userId);
  }

  @Post('/symbols')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  addSymbols(@Body() addSymbolToPortfolioDto: AddSymbolToPortfolioDto) {
    return this.portfoliosService.addSymbols(addSymbolToPortfolioDto);
  }
}

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { BondsService } from './bonds.service';
import { PassportJwtAuthGuard } from 'src/auth/guards/passport-jwt.guard';

@UseGuards(PassportJwtAuthGuard)
@Controller('bonds')
export class BondsController {
  constructor(private readonly bondsService: BondsService) {}

  @Get(':portfolioId')
  getByPortfolio(@Param('portfolioId') portfolioId: string) {
    return this.bondsService.getByPortfolio(portfolioId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.bondsService.delete(id);
  }

  @Post('transaction/by-isin')
  addTransactionByIsin(@Body() body: {
    portfolioId: string;
    isin: string;
    name: string;
    faceValue: number;
    couponRate: number;
    couponFrequency: string;
    maturityDate: string;
    type: string;
    quantity: number;
    pricePerUnit: number;
    date: string;
  }) {
    return this.bondsService.addTransactionByIsin(
      body.portfolioId,
      body.isin,
      body.name,
      body.faceValue,
      body.couponRate,
      body.couponFrequency as any,
      body.maturityDate,
      body.type as any,
      body.quantity,
      body.pricePerUnit,
      body.date,
    );
  }

  @Patch('transaction/:id')
  updateTransaction(@Param('id') id: string, @Body() body: any) {
    return this.bondsService.updateTransaction(id, body);
  }

  @Delete('transaction/:id')
  deleteTransaction(@Param('id') id: string) {
    return this.bondsService.deleteTransaction(id);
  }
}

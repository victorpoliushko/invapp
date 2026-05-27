import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RealEstateService } from './real-estate.service';
import { CreateRealEstateDto, CreateRealEstateTransactionDto } from './dto/real-estate.dto';

@Controller('real-estate')
@UseGuards(AuthGuard('jwt'))
export class RealEstateController {
  constructor(private realEstateService: RealEstateService) {}

  @Get(':portfolioId')
  getByPortfolio(@Param('portfolioId') portfolioId: string) {
    return this.realEstateService.getByPortfolio(portfolioId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateRealEstateDto) {
    return this.realEstateService.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.realEstateService.delete(id);
  }

  @Post('transaction')
  @UsePipes(new ValidationPipe({ transform: true }))
  createTransaction(@Body() dto: CreateRealEstateTransactionDto) {
    return this.realEstateService.createTransaction(dto);
  }

  @Post('transaction/by-code')
  addTransactionByCode(
    @Body() body: { portfolioId: string; code: string; startDate: string; endDate: string; monthlyRent: number },
  ) {
    return this.realEstateService.addTransactionByCode(
      body.portfolioId, body.code, body.startDate, body.endDate, body.monthlyRent,
    );
  }

  @Patch('transaction/:id')
  updateTransaction(
    @Param('id') id: string,
    @Body() data: { startDate: string; endDate: string; monthlyRent: number },
  ) {
    return this.realEstateService.updateTransaction(id, data);
  }

  @Delete('transaction/:id')
  deleteTransaction(@Param('id') id: string) {
    return this.realEstateService.deleteTransaction(id);
  }
}

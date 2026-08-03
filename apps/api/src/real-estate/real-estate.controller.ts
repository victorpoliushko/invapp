import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RealEstateService } from './real-estate.service';
import { CreateRealEstateDto, CreateRealEstateTransactionDto, UpdateRealEstateDto } from './dto/real-estate.dto';
import { GetUser } from '../auth/decorators/GetUser.decorator';
import { User } from '@prisma/client';

@Controller('real-estate')
@UseGuards(AuthGuard('jwt'))
export class RealEstateController {
  constructor(private realEstateService: RealEstateService) {}

  @Get(':portfolioId')
  getByPortfolio(@Param('portfolioId') portfolioId: string, @GetUser() user: User) {
    return this.realEstateService.getByPortfolio(portfolioId, user.id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateRealEstateDto, @GetUser() user: User) {
    return this.realEstateService.create(dto, user.id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() dto: UpdateRealEstateDto, @GetUser() user: User) {
    return this.realEstateService.update(id, dto, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser() user: User) {
    return this.realEstateService.delete(id, user.id);
  }

  @Post('transaction')
  @UsePipes(new ValidationPipe({ transform: true }))
  createTransaction(@Body() dto: CreateRealEstateTransactionDto, @GetUser() user: User) {
    return this.realEstateService.createTransaction(dto, user.id);
  }

  @Post('transaction/by-code')
  addTransactionByCode(
    @Body() body: { portfolioId: string; code: string; startDate: string; endDate: string; monthlyRent: number },
    @GetUser() user: User,
  ) {
    return this.realEstateService.addTransactionByCode(
      body.portfolioId, body.code, body.startDate, body.endDate, body.monthlyRent, user.id,
    );
  }

  @Patch('transaction/:id')
  updateTransaction(
    @Param('id') id: string,
    @Body() data: { startDate: string; endDate: string; monthlyRent: number },
    @GetUser() user: User,
  ) {
    return this.realEstateService.updateTransaction(id, data, user.id);
  }

  @Delete('transaction/:id')
  deleteTransaction(@Param('id') id: string, @GetUser() user: User) {
    return this.realEstateService.deleteTransaction(id, user.id);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { PassportJwtAuthGuard } from 'src/auth/guards/passport-jwt.guard';
import { GetUser } from '../auth/decorators/GetUser.decorator';
import { CashService } from './cash.service';

@UseGuards(PassportJwtAuthGuard)
@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Get(':portfolioId')
  getByPortfolio(@Param('portfolioId') portfolioId: string, @GetUser() user: User) {
    return this.cashService.getByPortfolio(portfolioId, user.id);
  }

  @Post()
  create(@Body() body: any, @GetUser() user: User) {
    return this.cashService.create(body, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @GetUser() user: User) {
    return this.cashService.update(id, body, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser() user: User) {
    return this.cashService.delete(id, user.id);
  }
}

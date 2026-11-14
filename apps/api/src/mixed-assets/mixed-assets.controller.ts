import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MixedAssetsService } from './mixed-assets.service';
import { PassportJwtAuthGuard } from 'src/auth/guards/passport-jwt.guard';
import { GetUser } from '../auth/decorators/GetUser.decorator';
import { User } from '@prisma/client';
import { CashCredit } from '../cash/cash-ledger';

@UseGuards(PassportJwtAuthGuard)
@Controller('mixed-assets')
export class MixedAssetsController {
  constructor(private readonly mixedAssetsService: MixedAssetsService) {}

  @Get(':portfolioId')
  getByPortfolio(@Param('portfolioId') portfolioId: string, @GetUser() user: User) {
    return this.mixedAssetsService.getByPortfolio(portfolioId, user.id);
  }

  @Post()
  create(@Body() body: any, @GetUser() user: User) {
    return this.mixedAssetsService.create(body, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @GetUser() user: User) {
    return this.mixedAssetsService.update(id, body, user.id);
  }

  @Post(':id/sell')
  sell(@Param('id') id: string, @Body() body: { cash?: CashCredit }, @GetUser() user: User) {
    return this.mixedAssetsService.sell(id, body?.cash, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser() user: User) {
    return this.mixedAssetsService.delete(id, user.id);
  }
}

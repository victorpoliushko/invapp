import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { BondsService } from './bonds.service';
import { PassportJwtAuthGuard } from 'src/auth/guards/passport-jwt.guard';
import { UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators/GetUser.decorator';
import { User } from '@prisma/client';

@UseGuards(PassportJwtAuthGuard)
@Controller('bonds')
export class BondsController {
  constructor(private readonly bondsService: BondsService) {}

  @Get(':portfolioId')
  getByPortfolio(@Param('portfolioId') portfolioId: string, @GetUser() user: User) {
    return this.bondsService.getByPortfolio(portfolioId, user.id);
  }

  @Post()
  create(@Body() body: any, @GetUser() user: User) {
    return this.bondsService.create(body, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @GetUser() user: User) {
    return this.bondsService.update(id, body, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser() user: User) {
    return this.bondsService.delete(id, user.id);
  }
}

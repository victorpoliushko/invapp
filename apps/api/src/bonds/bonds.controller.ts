import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { BondsService } from './bonds.service';
import { PassportJwtAuthGuard } from 'src/auth/guards/passport-jwt.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(PassportJwtAuthGuard)
@Controller('bonds')
export class BondsController {
  constructor(private readonly bondsService: BondsService) {}

  @Get(':portfolioId')
  getByPortfolio(@Param('portfolioId') portfolioId: string) {
    return this.bondsService.getByPortfolio(portfolioId);
  }

  @Post()
  create(@Body() body: any) {
    return this.bondsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.bondsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.bondsService.delete(id);
  }
}

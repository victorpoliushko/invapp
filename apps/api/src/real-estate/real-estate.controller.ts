import { Body, Controller, Delete, Get, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RealEstateService } from './real-estate.service';
import { CreateRealEstateDto } from './dto/real-estate.dto';

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
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRealEstateDto } from './dto/real-estate.dto';

@Injectable()
export class RealEstateService {
  constructor(private prismaService: PrismaService) {}

  async getByPortfolio(portfolioId: string) {
    return this.prismaService.realEstate.findMany({ where: { portfolioId } });
  }

  async create(dto: CreateRealEstateDto) {
    return this.prismaService.realEstate.create({
      data: {
        name: dto.name,
        type: dto.type,
        purchaseDate: new Date(dto.purchaseDate),
        purchasePrice: dto.purchasePrice,
        monthlyRent: dto.monthlyRent,
        occupancyPct: dto.occupancyPct ?? 100,
        portfolioId: dto.portfolioId,
      },
    });
  }

  async delete(id: string) {
    return this.prismaService.realEstate.delete({ where: { id } });
  }
}

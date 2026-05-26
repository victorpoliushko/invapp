import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRealEstateDto, CreateRealEstateTransactionDto } from './dto/real-estate.dto';

@Injectable()
export class RealEstateService {
  constructor(private prismaService: PrismaService) {}

  async getByPortfolio(portfolioId: string) {
    return this.prismaService.realEstate.findMany({
      where: { portfolioId },
      include: { transactions: { orderBy: { startDate: 'desc' } } },
    });
  }

  async create(dto: CreateRealEstateDto) {
    return this.prismaService.realEstate.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        purchaseDate: new Date(dto.purchaseDate),
        purchasePrice: dto.purchasePrice,
        portfolioId: dto.portfolioId,
      },
      include: { transactions: true },
    });
  }

  async delete(id: string) {
    return this.prismaService.realEstate.delete({ where: { id } });
  }

  async createTransaction(dto: CreateRealEstateTransactionDto) {
    return this.prismaService.realEstateTransaction.create({
      data: {
        realEstateId: dto.realEstateId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        monthlyRent: dto.monthlyRent,
      },
    });
  }

  async deleteTransaction(id: string) {
    return this.prismaService.realEstateTransaction.delete({ where: { id } });
  }
}

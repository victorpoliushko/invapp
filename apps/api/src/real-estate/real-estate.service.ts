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

  async addTransactionByCode(portfolioId: string, code: string, startDate: string, endDate: string, monthlyRent: number) {
    let property = await this.prismaService.realEstate.findFirst({
      where: { portfolioId, code },
    });

    if (!property) {
      property = await this.prismaService.realEstate.create({
        data: {
          code,
          name: code,
          type: 'APARTMENT',
          purchaseDate: new Date(),
          purchasePrice: 0,
          portfolioId,
        },
      });
    }

    return this.prismaService.realEstateTransaction.create({
      data: {
        realEstateId: property.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent: Number(monthlyRent),
      },
    });
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

  async updateTransaction(id: string, data: { startDate: string; endDate: string; monthlyRent: number }) {
    return this.prismaService.realEstateTransaction.update({
      where: { id },
      data: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        monthlyRent: Number(data.monthlyRent),
      },
    });
  }

  async deleteTransaction(id: string) {
    return this.prismaService.realEstateTransaction.delete({ where: { id } });
  }
}

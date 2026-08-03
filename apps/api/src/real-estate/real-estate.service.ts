import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRealEstateDto, CreateRealEstateTransactionDto, UpdateRealEstateDto } from './dto/real-estate.dto';
import { PortfoliosService } from '../portfolios/portfolios.service';

@Injectable()
export class RealEstateService {
  constructor(
    private prismaService: PrismaService,
    private portfoliosService: PortfoliosService,
  ) {}

  private async getPortfolioIdForProperty(id: string): Promise<string> {
    const property = await this.prismaService.realEstate.findUnique({
      where: { id },
      select: { portfolioId: true },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property.portfolioId;
  }

  private async getPortfolioIdForTransaction(transactionId: string): Promise<string> {
    const transaction = await this.prismaService.realEstateTransaction.findUnique({
      where: { id: transactionId },
      select: { realEstate: { select: { portfolioId: true } } },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction.realEstate.portfolioId;
  }

  async getByPortfolio(portfolioId: string, userId: string) {
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prismaService.realEstate.findMany({
      where: { portfolioId },
      include: { transactions: { orderBy: { startDate: 'desc' } } },
    });
  }

  async create(dto: CreateRealEstateDto, userId: string) {
    await this.portfoliosService.assertOwnership(dto.portfolioId, userId);

    return this.prismaService.realEstate.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        purchaseDate: new Date(dto.purchaseDate),
        purchasePrice: dto.purchasePrice,
        rooms: dto.rooms,
        totalArea: dto.totalArea,
        portfolioId: dto.portfolioId,
      },
      include: { transactions: true },
    });
  }

  async update(id: string, dto: UpdateRealEstateDto, userId: string) {
    const portfolioId = await this.getPortfolioIdForProperty(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prismaService.realEstate.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        ...(dto.purchaseDate && { purchaseDate: new Date(dto.purchaseDate) }),
        purchasePrice: dto.purchasePrice,
        rooms: dto.rooms,
        totalArea: dto.totalArea,
      },
      include: { transactions: true },
    });
  }

  async delete(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForProperty(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prismaService.realEstate.delete({ where: { id } });
  }

  async addTransactionByCode(
    portfolioId: string,
    code: string,
    startDate: string,
    endDate: string,
    monthlyRent: number,
    userId: string,
  ) {
    await this.portfoliosService.assertOwnership(portfolioId, userId);

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

  async createTransaction(dto: CreateRealEstateTransactionDto, userId: string) {
    const portfolioId = await this.getPortfolioIdForProperty(dto.realEstateId);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prismaService.realEstateTransaction.create({
      data: {
        realEstateId: dto.realEstateId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        monthlyRent: dto.monthlyRent,
      },
    });
  }

  async updateTransaction(
    id: string,
    data: { startDate: string; endDate: string; monthlyRent: number },
    userId: string,
  ) {
    const portfolioId = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prismaService.realEstateTransaction.update({
      where: { id },
      data: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        monthlyRent: Number(data.monthlyRent),
      },
    });
  }

  async deleteTransaction(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prismaService.realEstateTransaction.delete({ where: { id } });
  }
}

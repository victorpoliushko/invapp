import { Injectable, NotFoundException } from '@nestjs/common';
import { applyCashCredit, CashCredit } from '../cash/cash-ledger';
import { cipher, optionalCipher } from '../common/cipher';
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
        purchasePrice: cipher(dto.purchasePrice, 'purchasePrice'),
        currentValue: optionalCipher(dto.currentValue, 'currentValue') ?? undefined,
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
        ...(dto.purchasePrice != null && { purchasePrice: cipher(dto.purchasePrice, 'purchasePrice') }),
        ...(dto.currentValue != null && { currentValue: cipher(dto.currentValue, 'currentValue') }),
        rooms: dto.rooms,
        totalArea: dto.totalArea,
      },
      include: { transactions: true },
    });
  }

  async sell(id: string, cash: CashCredit | undefined, userId: string) {
    const portfolioId = await this.getPortfolioIdForProperty(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prismaService.$transaction(async (tx) => {
      await applyCashCredit(tx, portfolioId, cash);
      await tx.realEstate.delete({ where: { id } });
      return null;
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
    monthlyRent: string,
    purchasePrice: string,
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
          purchasePrice: cipher(purchasePrice, 'purchasePrice'),
          portfolioId,
        },
      });
    }

    return this.prismaService.realEstateTransaction.create({
      data: {
        realEstateId: property.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent: cipher(monthlyRent, 'monthlyRent'),
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
        monthlyRent: cipher(dto.monthlyRent, 'monthlyRent'),
      },
    });
  }

  async updateTransaction(
    id: string,
    data: { startDate: string; endDate: string; monthlyRent: string },
    userId: string,
  ) {
    const portfolioId = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prismaService.realEstateTransaction.update({
      where: { id },
      data: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        monthlyRent: cipher(data.monthlyRent, 'monthlyRent'),
      },
    });
  }

  async deleteTransaction(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prismaService.realEstateTransaction.delete({ where: { id } });
  }
}

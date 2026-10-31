import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { isSupportedCurrency, SUPPORTED_CURRENCIES } from '../fx/currencies';

type CashInput = { name: string; currency: string; amount: number };

@Injectable()
export class CashService {
  constructor(
    private prisma: PrismaService,
    private portfoliosService: PortfoliosService,
  ) {}

  private async getPortfolioIdForCash(id: string): Promise<string> {
    const cash = await this.prisma.cash.findUnique({ where: { id }, select: { portfolioId: true } });
    if (!cash) throw new NotFoundException('Cash entry not found');
    return cash.portfolioId;
  }

  async getByPortfolio(portfolioId: string, userId: string) {
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.cash.findMany({ where: { portfolioId }, orderBy: { name: 'asc' } });
  }

  async create(data: CashInput & { portfolioId: string }, userId: string) {
    await this.portfoliosService.assertOwnership(data.portfolioId, userId);

    return this.prisma.cash.create({
      data: {
        portfolioId: data.portfolioId,
        name: parseName(data.name),
        currency: parseCurrency(data.currency),
        amount: parseAmount(data.amount),
      },
    });
  }

  async update(id: string, data: Partial<CashInput>, userId: string) {
    const portfolioId = await this.getPortfolioIdForCash(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.cash.update({
      where: { id },
      data: {
        ...(data.name != null && { name: parseName(data.name) }),
        ...(data.currency != null && { currency: parseCurrency(data.currency) }),
        ...(data.amount != null && { amount: parseAmount(data.amount) }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForCash(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.cash.delete({ where: { id } });
  }
}

function parseName(value: unknown): string {
  const name = String(value ?? '').trim();
  if (!name) throw new BadRequestException('name is required');
  return name;
}

function parseCurrency(value: unknown): string {
  const code = String(value ?? '').trim().toUpperCase();
  if (!isSupportedCurrency(code)) {
    throw new BadRequestException(`currency must be one of ${SUPPORTED_CURRENCIES.join(', ')}`);
  }
  return code;
}

function parseAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new BadRequestException('amount must be a non-negative number');
  return amount;
}

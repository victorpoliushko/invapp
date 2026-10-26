import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponFrequency, Prisma, TransactionType } from '@prisma/client';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { BondTransactionInputDto, BondTransactionUpdateDto } from './dto/BondTransaction.dto';

const WITH_TRANSACTIONS = {
  transactions: { orderBy: { date: 'desc' as const } },
};

@Injectable()
export class BondsService {
  constructor(
    private prisma: PrismaService,
    private portfoliosService: PortfoliosService,
  ) {}

  private async getPortfolioIdForBond(id: string): Promise<string> {
    const bond = await this.prisma.bond.findUnique({
      where: { id },
      select: { portfolioId: true },
    });
    if (!bond) throw new NotFoundException('Bond not found');
    return bond.portfolioId;
  }

  async getByPortfolio(portfolioId: string, userId: string) {
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.bond.findMany({ where: { portfolioId }, include: WITH_TRANSACTIONS });
  }

  async create(
    data: {
      portfolioId: string;
      isin: string;
      name: string;
      faceValue: number;
      couponRate: number;
      couponFrequency: CouponFrequency;
      quantity: number;
      purchasePrice: number;
      currentValue?: number;
      purchaseDate: string;
      maturityDate?: string;
    },
    userId: string,
  ) {
    await this.portfoliosService.assertOwnership(data.portfolioId, userId);

    const quantity = Number(data.quantity);
    const purchasePrice = Number(data.purchasePrice);
    const purchaseDate = new Date(data.purchaseDate);

    return this.prisma.bond.create({
      include: WITH_TRANSACTIONS,
      data: {
        portfolioId: data.portfolioId,
        isin: data.isin,
        name: data.name,
        faceValue: Number(data.faceValue),
        couponRate: Number(data.couponRate),
        couponFrequency: data.couponFrequency,
        quantity,
        purchasePrice,
        currentValue: data.currentValue != null ? Number(data.currentValue) : undefined,
        purchaseDate,
        maturityDate: data.maturityDate ? new Date(data.maturityDate) : undefined,
        ...(quantity > 0 && {
          transactions: {
            create: { type: TransactionType.BUY, quantity, pricePerUnit: purchasePrice, date: purchaseDate },
          },
        }),
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      isin: string;
      name: string;
      faceValue: number;
      couponRate: number;
      couponFrequency: CouponFrequency;
      currentValue: number;
      maturityDate: string;
    }>,
    userId: string,
  ) {
    const portfolioId = await this.getPortfolioIdForBond(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.bond.update({
      where: { id },
      data: {
        ...(data.isin && { isin: data.isin }),
        ...(data.name && { name: data.name }),
        ...(data.faceValue != null && { faceValue: Number(data.faceValue) }),
        ...(data.couponRate != null && { couponRate: Number(data.couponRate) }),
        ...(data.couponFrequency && { couponFrequency: data.couponFrequency }),
        ...(data.currentValue != null && { currentValue: Number(data.currentValue) }),
        ...(data.maturityDate && { maturityDate: new Date(data.maturityDate) }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForBond(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.bond.delete({ where: { id } });
  }

  async addTransaction(bondId: string, input: BondTransactionInputDto, userId: string) {
    const portfolioId = await this.getPortfolioIdForBond(bondId);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.bondTransaction.create({
        data: {
          bondId,
          type: input.type,
          quantity: Number(input.quantity),
          pricePerUnit: Number(input.pricePerUnit),
          date: new Date(input.date),
        },
      });
      return this.recalculate(tx, bondId);
    });
  }

  async updateTransaction(transactionId: string, input: BondTransactionUpdateDto, userId: string) {
    const bondId = await this.getBondIdForTransaction(transactionId, userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.bondTransaction.update({
        where: { id: transactionId },
        data: {
          ...(input.type && { type: input.type }),
          ...(input.quantity != null && { quantity: Number(input.quantity) }),
          ...(input.pricePerUnit != null && { pricePerUnit: Number(input.pricePerUnit) }),
          ...(input.date && { date: new Date(input.date) }),
        },
      });
      return this.recalculate(tx, bondId);
    });
  }

  async deleteTransaction(transactionId: string, userId: string) {
    const bondId = await this.getBondIdForTransaction(transactionId, userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.bondTransaction.delete({ where: { id: transactionId } });
      return this.recalculate(tx, bondId);
    });
  }

  private async getBondIdForTransaction(transactionId: string, userId: string): Promise<string> {
    const transaction = await this.prisma.bondTransaction.findUnique({
      where: { id: transactionId },
      select: { bondId: true, bond: { select: { portfolioId: true } } },
    });
    if (!transaction) throw new NotFoundException('Bond transaction not found');
    await this.portfoliosService.assertOwnership(transaction.bond.portfolioId, userId);
    return transaction.bondId;
  }

  // Quantity, average purchase price and first purchase date are derived from
  // the bond's trades. Throws (rolling back the surrounding transaction) if
  // the trades would leave a negative holding, e.g. selling more than owned.
  private async recalculate(tx: Prisma.TransactionClient, bondId: string) {
    const transactions = await tx.bondTransaction.findMany({ where: { bondId } });
    const buys = transactions.filter((t) => t.type === TransactionType.BUY);

    const bought = buys.reduce((sum, t) => sum + t.quantity, 0);
    const sold = transactions
      .filter((t) => t.type === TransactionType.SELL)
      .reduce((sum, t) => sum + t.quantity, 0);
    const quantity = bought - sold;
    if (quantity < 0) throw new BadRequestException('Cannot sell more bonds than are held');

    const cost = buys.reduce((sum, t) => sum + t.quantity * t.pricePerUnit, 0);
    const firstBuy = buys.reduce<Date | null>((min, t) => (!min || t.date < min ? t.date : min), null);

    return tx.bond.update({
      where: { id: bondId },
      include: WITH_TRANSACTIONS,
      data: {
        quantity,
        purchasePrice: bought > 0 ? cost / bought : 0,
        ...(firstBuy && { purchaseDate: firstBuy }),
      },
    });
  }
}

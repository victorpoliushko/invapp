import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { applyCashCredit, CashCredit } from '../cash/cash-ledger';
import { cipher, optionalCipher } from '../common/cipher';
import { PrismaService } from '../prisma/prisma.service';
import { CouponFrequency, TransactionType } from '@prisma/client';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { BondHolding, BondTransactionInputDto, BondTransactionUpdateDto } from './dto/BondTransaction.dto';

function parseCurrency(value: string): string {
  const code = String(value).trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) throw new BadRequestException('currency must be a 3-letter ISO code');
  return code;
}

function holding(bond: BondHolding | undefined) {
  return {
    quantity: cipher(bond?.quantity, 'bond.quantity'),
    purchasePrice: cipher(bond?.purchasePrice, 'bond.purchasePrice'),
    ...(bond?.purchaseDate && { purchaseDate: new Date(bond.purchaseDate) }),
  };
}

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
      faceValue: string;
      couponRate: string;
      couponFrequency: CouponFrequency;
      currency?: string;
      quantity: string;
      purchasePrice: string;
      currentValue?: string;
      purchaseDate: string;
      maturityDate?: string;
      transaction?: { quantity: string; pricePerUnit: string };
    },
    userId: string,
  ) {
    await this.portfoliosService.assertOwnership(data.portfolioId, userId);

    const purchaseDate = new Date(data.purchaseDate);

    return this.prisma.bond.create({
      include: WITH_TRANSACTIONS,
      data: {
        portfolioId: data.portfolioId,
        isin: data.isin,
        name: data.name,
        faceValue: cipher(data.faceValue, 'faceValue'),
        couponRate: cipher(data.couponRate, 'couponRate'),
        couponFrequency: data.couponFrequency,
        currency: data.currency ? parseCurrency(data.currency) : undefined,
        quantity: cipher(data.quantity, 'quantity'),
        purchasePrice: cipher(data.purchasePrice, 'purchasePrice'),
        currentValue: optionalCipher(data.currentValue, 'currentValue') ?? undefined,
        purchaseDate,
        maturityDate: data.maturityDate ? new Date(data.maturityDate) : undefined,
        ...(data.transaction && {
          transactions: {
            create: {
              type: TransactionType.BUY,
              quantity: cipher(data.transaction.quantity, 'transaction.quantity'),
              pricePerUnit: cipher(data.transaction.pricePerUnit, 'transaction.pricePerUnit'),
              date: purchaseDate,
            },
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
      faceValue: string;
      couponRate: string;
      couponFrequency: CouponFrequency;
      currency: string;
      currentValue: string;
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
        ...(data.faceValue != null && { faceValue: cipher(data.faceValue, 'faceValue') }),
        ...(data.couponRate != null && { couponRate: cipher(data.couponRate, 'couponRate') }),
        ...(data.couponFrequency && { couponFrequency: data.couponFrequency }),
        ...(data.currency && { currency: parseCurrency(data.currency) }),
        ...(data.currentValue != null && { currentValue: cipher(data.currentValue, 'currentValue') }),
        ...(data.maturityDate && { maturityDate: new Date(data.maturityDate) }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForBond(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.bond.delete({ where: { id } });
  }

  async sellAll(bondId: string, cash: CashCredit | undefined, userId: string) {
    const portfolioId = await this.getPortfolioIdForBond(bondId);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.$transaction(async (tx) => {
      await applyCashCredit(tx, portfolioId, cash);
      await tx.bond.delete({ where: { id: bondId } });
      return null;
    });
  }

  async addTransaction(bondId: string, input: BondTransactionInputDto, userId: string) {
    const portfolioId = await this.getPortfolioIdForBond(bondId);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    const quantity = cipher(input.quantity, 'quantity');
    const pricePerUnit = cipher(input.pricePerUnit, 'pricePerUnit');
    const values = input.soldOut ? null : holding(input.bond);

    return this.prisma.$transaction(async (tx) => {
      await applyCashCredit(tx, portfolioId, input.cash);

      if (!values) {
        await tx.bond.delete({ where: { id: bondId } });
        return null;
      }

      await tx.bondTransaction.create({
        data: { bondId, type: input.type, quantity, pricePerUnit, date: new Date(input.date) },
      });
      return tx.bond.update({ where: { id: bondId }, include: WITH_TRANSACTIONS, data: values });
    });
  }

  async updateTransaction(transactionId: string, input: BondTransactionUpdateDto, userId: string) {
    const bondId = await this.getBondIdForTransaction(transactionId, userId);
    const values = holding(input.bond);

    return this.prisma.$transaction(async (tx) => {
      await tx.bondTransaction.update({
        where: { id: transactionId },
        data: {
          ...(input.type && { type: input.type }),
          ...(input.quantity != null && { quantity: cipher(input.quantity, 'quantity') }),
          ...(input.pricePerUnit != null && { pricePerUnit: cipher(input.pricePerUnit, 'pricePerUnit') }),
          ...(input.date && { date: new Date(input.date) }),
        },
      });
      return tx.bond.update({ where: { id: bondId }, include: WITH_TRANSACTIONS, data: values });
    });
  }

  async deleteTransaction(transactionId: string, bond: BondHolding, userId: string) {
    const bondId = await this.getBondIdForTransaction(transactionId, userId);
    const values = holding(bond);

    return this.prisma.$transaction(async (tx) => {
      await tx.bondTransaction.delete({ where: { id: transactionId } });
      return tx.bond.update({ where: { id: bondId }, include: WITH_TRANSACTIONS, data: values });
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
}

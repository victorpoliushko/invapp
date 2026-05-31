import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponFrequency, TransactionType } from '@prisma/client';

@Injectable()
export class BondsService {
  constructor(private prisma: PrismaService) {}

  getByPortfolio(portfolioId: string) {
    return this.prisma.bond.findMany({
      where: { portfolioId },
      include: { transactions: { orderBy: { date: 'desc' } } },
    });
  }

  delete(id: string) {
    return this.prisma.bond.delete({ where: { id } });
  }

  async addTransactionByIsin(
    portfolioId: string,
    isin: string,
    name: string,
    faceValue: number,
    couponRate: number,
    couponFrequency: CouponFrequency,
    maturityDate: string,
    type: TransactionType,
    quantity: number,
    pricePerUnit: number,
    date: string,
  ) {
    let bond = await this.prisma.bond.findFirst({ where: { portfolioId, isin } });

    if (!bond) {
      bond = await this.prisma.bond.create({
        data: {
          portfolioId,
          isin,
          name,
          faceValue: Number(faceValue),
          couponRate: Number(couponRate),
          couponFrequency,
          maturityDate: new Date(maturityDate),
        },
      });
    }

    return this.prisma.bondTransaction.create({
      data: {
        bondId: bond.id,
        type,
        quantity: Number(quantity),
        pricePerUnit: Number(pricePerUnit),
        date: new Date(date),
      },
    });
  }

  updateTransaction(
    id: string,
    data: { type?: TransactionType; quantity?: number; pricePerUnit?: number; date?: string },
  ) {
    return this.prisma.bondTransaction.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.quantity != null && { quantity: Number(data.quantity) }),
        ...(data.pricePerUnit != null && { pricePerUnit: Number(data.pricePerUnit) }),
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  }

  deleteTransaction(id: string) {
    return this.prisma.bondTransaction.delete({ where: { id } });
  }
}

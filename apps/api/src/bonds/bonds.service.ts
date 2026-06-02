import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponFrequency } from '@prisma/client';

@Injectable()
export class BondsService {
  constructor(private prisma: PrismaService) {}

  getByPortfolio(portfolioId: string) {
    return this.prisma.bond.findMany({ where: { portfolioId } });
  }

  create(data: {
    portfolioId: string;
    isin: string;
    name: string;
    faceValue: number;
    couponRate: number;
    couponFrequency: CouponFrequency;
    quantity: number;
    purchasePrice: number;
    purchaseDate: string;
  }) {
    return this.prisma.bond.create({
      data: {
        portfolioId: data.portfolioId,
        isin: data.isin,
        name: data.name,
        faceValue: Number(data.faceValue),
        couponRate: Number(data.couponRate),
        couponFrequency: data.couponFrequency,
        quantity: Number(data.quantity),
        purchasePrice: Number(data.purchasePrice),
        purchaseDate: new Date(data.purchaseDate),
      },
    });
  }

  update(id: string, data: Partial<{
    isin: string;
    name: string;
    faceValue: number;
    couponRate: number;
    couponFrequency: CouponFrequency;
    quantity: number;
    purchasePrice: number;
    purchaseDate: string;
  }>) {
    return this.prisma.bond.update({
      where: { id },
      data: {
        ...(data.isin && { isin: data.isin }),
        ...(data.name && { name: data.name }),
        ...(data.faceValue != null && { faceValue: Number(data.faceValue) }),
        ...(data.couponRate != null && { couponRate: Number(data.couponRate) }),
        ...(data.couponFrequency && { couponFrequency: data.couponFrequency }),
        ...(data.quantity != null && { quantity: Number(data.quantity) }),
        ...(data.purchasePrice != null && { purchasePrice: Number(data.purchasePrice) }),
        ...(data.purchaseDate && { purchaseDate: new Date(data.purchaseDate) }),
      },
    });
  }

  delete(id: string) {
    return this.prisma.bond.delete({ where: { id } });
  }
}

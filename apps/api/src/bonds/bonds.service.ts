import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponFrequency } from '@prisma/client';
import { PortfoliosService } from '../portfolios/portfolios.service';

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

    return this.prisma.bond.findMany({ where: { portfolioId } });
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
      purchaseDate: string;
    },
    userId: string,
  ) {
    await this.portfoliosService.assertOwnership(data.portfolioId, userId);

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

  async update(
    id: string,
    data: Partial<{
      isin: string;
      name: string;
      faceValue: number;
      couponRate: number;
      couponFrequency: CouponFrequency;
      quantity: number;
      purchasePrice: number;
      purchaseDate: string;
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
        ...(data.quantity != null && { quantity: Number(data.quantity) }),
        ...(data.purchasePrice != null && { purchasePrice: Number(data.purchasePrice) }),
        ...(data.purchaseDate && { purchaseDate: new Date(data.purchaseDate) }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForBond(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.bond.delete({ where: { id } });
  }
}

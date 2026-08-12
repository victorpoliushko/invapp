import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosService } from '../portfolios/portfolios.service';

@Injectable()
export class MixedAssetsService {
  constructor(
    private prisma: PrismaService,
    private portfoliosService: PortfoliosService,
  ) {}

  private async getPortfolioIdForMixedAsset(id: string): Promise<string> {
    const mixedAsset = await this.prisma.mixedAsset.findUnique({
      where: { id },
      select: { portfolioId: true },
    });
    if (!mixedAsset) throw new NotFoundException('Mixed asset not found');
    return mixedAsset.portfolioId;
  }

  async getByPortfolio(portfolioId: string, userId: string) {
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.mixedAsset.findMany({ where: { portfolioId } });
  }

  async create(
    data: {
      portfolioId: string;
      name: string;
      quantity: number;
      purchasePrice: number;
      purchaseDate: string;
      currentValue?: number;
    },
    userId: string,
  ) {
    await this.portfoliosService.assertOwnership(data.portfolioId, userId);

    return this.prisma.mixedAsset.create({
      data: {
        portfolioId: data.portfolioId,
        name: data.name,
        quantity: Number(data.quantity),
        purchasePrice: Number(data.purchasePrice),
        purchaseDate: new Date(data.purchaseDate),
        currentValue: data.currentValue != null ? Number(data.currentValue) : undefined,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      quantity: number;
      purchasePrice: number;
      purchaseDate: string;
      currentValue: number;
    }>,
    userId: string,
  ) {
    const portfolioId = await this.getPortfolioIdForMixedAsset(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.mixedAsset.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.quantity != null && { quantity: Number(data.quantity) }),
        ...(data.purchasePrice != null && { purchasePrice: Number(data.purchasePrice) }),
        ...(data.purchaseDate && { purchaseDate: new Date(data.purchaseDate) }),
        ...(data.currentValue != null && { currentValue: Number(data.currentValue) }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForMixedAsset(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.mixedAsset.delete({ where: { id } });
  }
}

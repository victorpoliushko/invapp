import { Injectable, NotFoundException } from '@nestjs/common';
import { applyCashCredit, CashCredit } from '../cash/cash-ledger';
import { cipher, optionalCipher } from '../common/cipher';
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
      quantity: string;
      purchasePrice: string;
      purchaseDate: string;
      currentValue?: string;
    },
    userId: string,
  ) {
    await this.portfoliosService.assertOwnership(data.portfolioId, userId);

    return this.prisma.mixedAsset.create({
      data: {
        portfolioId: data.portfolioId,
        name: data.name,
        quantity: cipher(data.quantity, 'quantity'),
        purchasePrice: cipher(data.purchasePrice, 'purchasePrice'),
        purchaseDate: new Date(data.purchaseDate),
        currentValue: optionalCipher(data.currentValue, 'currentValue') ?? undefined,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      quantity: string;
      purchasePrice: string;
      purchaseDate: string;
      currentValue: string;
    }>,
    userId: string,
  ) {
    const portfolioId = await this.getPortfolioIdForMixedAsset(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.mixedAsset.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.quantity != null && { quantity: cipher(data.quantity, 'quantity') }),
        ...(data.purchasePrice != null && { purchasePrice: cipher(data.purchasePrice, 'purchasePrice') }),
        ...(data.purchaseDate && { purchaseDate: new Date(data.purchaseDate) }),
        ...(data.currentValue != null && { currentValue: cipher(data.currentValue, 'currentValue') }),
      },
    });
  }

  async sell(id: string, cash: CashCredit | undefined, userId: string) {
    const portfolioId = await this.getPortfolioIdForMixedAsset(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.$transaction(async (tx) => {
      await applyCashCredit(tx, portfolioId, cash);
      await tx.mixedAsset.delete({ where: { id } });
      return null;
    });
  }

  async delete(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForMixedAsset(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return this.prisma.mixedAsset.delete({ where: { id } });
  }
}

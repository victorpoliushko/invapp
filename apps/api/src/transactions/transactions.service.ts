import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/CreateTransaction.dto';
import { TransactionsDto } from './dto/Transations.dto';
import { plainToInstance } from 'class-transformer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PortfoliosService } from 'src/portfolios/portfolios.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prismaService: PrismaService,
    private portfoliosService: PortfoliosService,
  ) {}

  private async getPortfolioIdForTransaction(id: string): Promise<string> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
      select: { portfolioId: true },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction.portfolioId;
  }

  async create(input: CreateTransactionDto, userId: string): Promise<TransactionsDto> {
    await this.portfoliosService.assertOwnership(input.portfolioId, userId);

    let assetId = input.assetId;

    if (!assetId && input.assetName) {
      const asset = await this.prismaService.asset.findFirst({
        where: { ticker: input.assetName },
      });

      assetId = asset.id;
    }

    const createdTransaction = await this.prismaService.transaction.create({
      data: {
        type: input.type,
        quantityChange: input.quantityChange,
        date: input.date,
        pricePerUnit: input.pricePerUnit,
        portfolioAsset: {
          connect: {
            portfolioId_assetId: {
              portfolioId: input.portfolioId,
              assetId: input.assetId,
            },
          },
        },
      },
    });

    this.portfoliosService.addAssetToPortfolio(input.portfolioId, input, userId);

    return plainToInstance(TransactionsDto, createdTransaction);
  }

  async getById(id: string): Promise<TransactionsDto> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
      include: {
        portfolioAsset: { include: {
          portfolio: true,
          asset: true
        }}
      },
    });
    return plainToInstance(TransactionsDto, transaction);
  }

  async update(
    id: string,
    data: { date: string; quantityChange: number; pricePerUnit: number },
    userId: string,
  ) {
    const portfolioId = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return await this.prismaService.$transaction(async (trx) => {
      await trx.transaction.update({
        where: { id },
        data: {
          date: new Date(data.date),
          quantityChange: Number(data.quantityChange),
          pricePerUnit: Number(data.pricePerUnit),
        },
      });

      const updated = await trx.transaction.findUniqueOrThrow({ where: { id } });
      const { assetId } = updated;

      const allTransactions = await trx.transaction.findMany({
        where: { portfolioId, assetId },
      });

      let totalQuantityBought = 0;
      let totalQuantitySold = 0;
      let totalCostBasis = 0;

      allTransactions.forEach((t) => {
        if (t.type === 'BUY') {
          totalQuantityBought += t.quantityChange;
          totalCostBasis += t.quantityChange * t.pricePerUnit;
        } else if (t.type === 'SELL') {
          totalQuantitySold += t.quantityChange;
        }
      });

      const currentQuantity = totalQuantityBought - totalQuantitySold;
      const avgBuyPrice =
        totalQuantityBought > 0 ? totalCostBasis / totalQuantityBought : 0;

      await trx.portfolioAsset.update({
        where: { portfolioId_assetId: { portfolioId, assetId } },
        data: { quantity: currentQuantity, price: avgBuyPrice },
      });
    });
  }

  async delete(id: string, userId: string) {
    const portfolioId = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return await this.prismaService.$transaction(async (trx) => {
      const transaction = await trx.transaction.findUniqueOrThrow({
        where: { id },
      });

      const { assetId } = transaction;

      await trx.transaction.delete({ where: { id } });

      const remainingTransactions = await trx.transaction.findMany({
        where: { portfolioId, assetId },
      });

      let totalQuantityBought = 0;
      let totalQuantitySold = 0;
      let totalCostBasis = 0;

      remainingTransactions.forEach((t) => {
        if (t.type === 'BUY') {
          totalQuantityBought += t.quantityChange;
          totalCostBasis += t.quantityChange * t.pricePerUnit;
        } else if (t.type === 'SELL') {
          totalQuantitySold += t.quantityChange;
        }
      });

      const currentQuantity = totalQuantityBought - totalQuantitySold;
      const avgBuyPrice =
        totalQuantityBought > 0 ? totalCostBasis / totalQuantityBought : 0;

      await trx.portfolioAsset.update({
        where: { portfolioId_assetId: { portfolioId, assetId } },
        data: {
          quantity: currentQuantity,
          price: avgBuyPrice,
        },
      });
    });
  }
}

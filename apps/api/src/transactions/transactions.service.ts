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

  // Both stock and crypto transactions share the same shape, so routing
  // between the two split tables comes down to one lookup: is the asset a
  // cryptocurrency? Everything else (including untyped/legacy assets) is
  // treated as a stock transaction.
  private async isCrypto(assetId: string): Promise<boolean> {
    const asset = await this.prismaService.asset.findUnique({ where: { id: assetId } });
    return asset?.type === 'CRYPTOCURRENCY';
  }

  private async getPortfolioIdForTransaction(id: string): Promise<{ portfolioId: string; isCrypto: boolean }> {
    const stockTransaction = await this.prismaService.stockTransaction.findUnique({
      where: { id },
      select: { portfolioId: true },
    });
    if (stockTransaction) return { portfolioId: stockTransaction.portfolioId, isCrypto: false };

    const cryptoTransaction = await this.prismaService.cryptoTransaction.findUnique({
      where: { id },
      select: { portfolioId: true },
    });
    if (cryptoTransaction) return { portfolioId: cryptoTransaction.portfolioId, isCrypto: true };

    throw new NotFoundException('Transaction not found');
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

    const isCrypto = await this.isCrypto(assetId);
    const transaction: any = isCrypto ? this.prismaService.cryptoTransaction : this.prismaService.stockTransaction;
    const positionRelation = isCrypto ? 'cryptoPosition' : 'stockPosition';

    const createdTransaction = await transaction.create({
      data: {
        type: input.type,
        quantityChange: input.quantityChange,
        date: input.date,
        pricePerUnit: input.pricePerUnit,
        [positionRelation]: {
          connect: {
            portfolioId_assetId: {
              portfolioId: input.portfolioId,
              assetId,
            },
          },
        },
      },
    });

    this.portfoliosService.addAssetToPortfolio(input.portfolioId, { ...input, assetId } as any, userId);

    return plainToInstance(TransactionsDto, createdTransaction);
  }

  async getById(id: string): Promise<TransactionsDto> {
    const { isCrypto } = await this.getPortfolioIdForTransaction(id);
    const transaction: any = isCrypto ? this.prismaService.cryptoTransaction : this.prismaService.stockTransaction;
    const positionRelation = isCrypto ? 'cryptoPosition' : 'stockPosition';

    const found = await transaction.findUnique({
      where: { id },
      include: {
        [positionRelation]: { include: {
          portfolio: true,
          asset: true
        }}
      },
    });
    return plainToInstance(TransactionsDto, found);
  }

  async update(
    id: string,
    data: { date: string; quantityChange: number; pricePerUnit: number },
    userId: string,
  ) {
    const { portfolioId, isCrypto } = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return await this.prismaService.$transaction(async (trx) => {
      const transaction: any = isCrypto ? trx.cryptoTransaction : trx.stockTransaction;
      const position: any = isCrypto ? trx.cryptoPosition : trx.stockPosition;

      await transaction.update({
        where: { id },
        data: {
          date: new Date(data.date),
          quantityChange: Number(data.quantityChange),
          pricePerUnit: Number(data.pricePerUnit),
        },
      });

      const updated = await transaction.findUniqueOrThrow({ where: { id } });
      const { assetId } = updated;

      const allTransactions = await transaction.findMany({
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

      await position.update({
        where: { portfolioId_assetId: { portfolioId, assetId } },
        data: { quantity: currentQuantity, price: avgBuyPrice },
      });
    });
  }

  async delete(id: string, userId: string) {
    const { portfolioId, isCrypto } = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    return await this.prismaService.$transaction(async (trx) => {
      const transaction: any = isCrypto ? trx.cryptoTransaction : trx.stockTransaction;
      const position: any = isCrypto ? trx.cryptoPosition : trx.stockPosition;

      const found = await transaction.findUniqueOrThrow({
        where: { id },
      });

      const { assetId } = found;

      await transaction.delete({ where: { id } });

      const remainingTransactions = await transaction.findMany({
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

      await position.update({
        where: { portfolioId_assetId: { portfolioId, assetId } },
        data: {
          quantity: currentQuantity,
          price: avgBuyPrice,
        },
      });
    });
  }
}

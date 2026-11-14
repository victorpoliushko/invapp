import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/CreateTransaction.dto';
import { TransactionsDto } from './dto/Transations.dto';
import { plainToInstance } from 'class-transformer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PortfoliosService } from 'src/portfolios/portfolios.service';
import { cipher, optionalCipher } from '../common/cipher';

export type PositionUpdate = { quantity: string; price?: string | null };

@Injectable()
export class TransactionsService {
  constructor(
    private prismaService: PrismaService,
    private portfoliosService: PortfoliosService,
  ) {}

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

  async create(input: CreateTransactionDto, userId: string) {
    return this.portfoliosService.addAssetToPortfolio(input.portfolioId, input as any, userId);
  }

  async getById(id: string): Promise<TransactionsDto> {
    const { isCrypto } = await this.getPortfolioIdForTransaction(id);
    const transaction: any = isCrypto ? this.prismaService.cryptoTransaction : this.prismaService.stockTransaction;
    const positionRelation = isCrypto ? 'cryptoPosition' : 'stockPosition';

    const found = await transaction.findUnique({
      where: { id },
      include: {
        [positionRelation]: { include: { portfolio: true, asset: true } },
      },
    });
    return plainToInstance(TransactionsDto, found);
  }

  async update(
    id: string,
    data: { date: string; quantityChange: string; pricePerUnit: string; position: PositionUpdate },
    userId: string,
  ) {
    const { portfolioId, isCrypto } = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    const quantityChange = cipher(data.quantityChange, 'quantityChange');
    const pricePerUnit = cipher(data.pricePerUnit, 'pricePerUnit');
    const position = this.parsePosition(data.position);

    return this.prismaService.$transaction(async (trx) => {
      const transaction: any = isCrypto ? trx.cryptoTransaction : trx.stockTransaction;
      const positions: any = isCrypto ? trx.cryptoPosition : trx.stockPosition;

      const updated = await transaction.update({
        where: { id },
        data: { date: new Date(data.date), quantityChange, pricePerUnit },
      });
      await positions.update({
        where: { portfolioId_assetId: { portfolioId, assetId: updated.assetId } },
        data: position,
      });
    });
  }

  async delete(id: string, position: PositionUpdate, userId: string) {
    const { portfolioId, isCrypto } = await this.getPortfolioIdForTransaction(id);
    await this.portfoliosService.assertOwnership(portfolioId, userId);

    const values = this.parsePosition(position);

    return this.prismaService.$transaction(async (trx) => {
      const transaction: any = isCrypto ? trx.cryptoTransaction : trx.stockTransaction;
      const positions: any = isCrypto ? trx.cryptoPosition : trx.stockPosition;

      const found = await transaction.delete({ where: { id } });
      await positions.update({
        where: { portfolioId_assetId: { portfolioId, assetId: found.assetId } },
        data: values,
      });
    });
  }

  private parsePosition(position: PositionUpdate | undefined) {
    return {
      quantity: cipher(position?.quantity, 'position.quantity'),
      price: optionalCipher(position?.price, 'position.price') ?? null,
    };
  }
}

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/CreateTransaction.dto';
import { TransactionsDto } from './dto/Transations.dto';
import { plainToInstance } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { PortfoliosService } from 'src/portfolios/portfolios.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prismaService: PrismaService,
    private portfoliosService: PortfoliosService,
  ) {}

  async create(input: CreateTransactionDto): Promise<TransactionsDto> {
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
        portfolio: {
          connect: { id: input.portfolioId },
        },
        ...(assetId && {
          asset: {
            connect: {
              id: assetId,
            },
          },
        }),
      },
    });

    this.portfoliosService.addAssetToPortfolio(input.portfolioId, input);

    return plainToInstance(TransactionsDto, createdTransaction);
  }

  async getById(id: string): Promise<TransactionsDto> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
      include: {
        asset: true,
        portfolio: true,
      },
    });
    return plainToInstance(TransactionsDto, transaction);
  }

  async delete(id: string) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: { id },
    });
    const portfolioAsset = await this.prismaService.portfolioAsset.findFirst({
      where: {
        assetId: transaction.assetId,
        portfolioId: transaction.portfolioId,
      },
    });
    await this.prismaService.portfolioAsset.update({
      where: {
        assetId: transaction.assetId,
        portfolioId: transaction.portfolioId,
      },
      data: {
        quantity: portfolioAsset.quantity - transaction.quantityChange,
      },
    });
    await this.prismaService.transaction.delete({ where: { id } });

    // const allTransactions = await this.prismaService.transaction.findMany({
    //   where: { portfolioId: id, assetId: asset.id },
    // });

    // let totalQuantity = 0;
    // let totalCost = 0;

    // allTransactions.forEach((t) => {
    //   if (t.type === TransactionType.BUY) {
    //     totalQuantity += t.quantityChange;
    //     totalCost += t.quantityChange * t.pricePerUnit;
    //   } else {
    //     totalQuantity -= t.quantityChange;
    //     totalCost -= t.quantityChange * t.pricePerUnit;
    //   }
    // });

    // const avgPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;

    // await this.prismaService.portfolioAsset.update({
    //   where: { portfolioId_assetId: { portfolioId: id, assetId: asset.id } },
    //   data: {
    //     quantity: totalQuantity,
    //     price: Math.round(avgPrice),
    //   },
    // });
  }
}

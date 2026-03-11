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
    // const transaction = await this.prismaService.transaction.findFirst({
    //   where: { id },
    // });
    
    // const portfolioAsset = await this.prismaService.portfolioAsset.findFirst({
    //   where: {
    //     assetId: transaction.assetId,
    //     portfolioId: transaction.portfolioId,
    //   },
    // });

    // const costOfRemovedTransactions = transaction.quantityChange * transaction.pricePerUnit;
    // const remaningTotalCost = portfolioAsset.price - costOfRemovedTransactions;
    // const remaningQuantity = remaningTotalCost

    // await this.prismaService.portfolioAsset.update({
    //   where: {
    //     portfolioId_assetId: {
    //       assetId: transaction.assetId,
    //       portfolioId: transaction.portfolioId,
    //     },
    //   },
    //   data: {
    //     quantity: portfolioAsset.quantity - transaction.quantityChange,
    //     price: portfolioAsset.price
    //   },
    // });
    await this.prismaService.transaction.delete({ where: { id } });
  }
}

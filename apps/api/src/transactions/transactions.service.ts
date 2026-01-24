import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/CreateTransaction.dto';
import { TransactionsDto } from './dto/Transations.dto';
import { plainToInstance } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { PortfoliosService } from 'src/portfolios/portfolios.service';

@Injectable()
export class TransactionsService {
  constructor(private prismaService: PrismaService, private portfoliosService: PortfoliosService) {}

  async create(input: CreateTransactionDto): Promise<TransactionsDto> {
    let assetId = input.assetId;

    if (!assetId && input.assetName) {
      const asset = await this.prismaService.asset.findFirst({
        where: { asset: input.assetName },
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

    console.log(`
     TS createdTransaction: ${JSON.stringify(createdTransaction)} 
    `);

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
}

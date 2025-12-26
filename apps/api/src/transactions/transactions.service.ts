import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDto } from "./dto/CreateTransaction.dto";
import { TransactionsDto } from "./dto/Transations.dto";
import { plainToInstance } from "class-transformer";

export class TransactionsService {
  constructor(
    private prismaService: PrismaService
  ) {}

  async create(input: CreateTransactionDto): Promise<TransactionsDto> {
    const createdTransaction = await this.prismaService.transaction.create({
      data: input
    });

    return plainToInstance(TransactionsDto, createdTransaction);
  }
}

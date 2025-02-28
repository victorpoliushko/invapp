import { plainToClass, plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { SymbolsService } from '../symbols/symbols.service';
import { UsersService } from '../users/users.service';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { PortfolioDto } from './dto/Portfolio.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { AddSymbolToPortfolioDto } from './dto/AddSymbolsToPortfolio.dto';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

@Injectable()
export class PortfoliosService {
  constructor(
    private usersService: UsersService,
    private prismaService: PrismaService,
  ) {}

  async create(input: CreatePortfolioDto): Promise<PortfolioDto> {
    const createdPortfolio = await this.prismaService.portfolio.create({
      data: input,
      include: { user: true },
    });
    return plainToInstance(PortfolioDto, createdPortfolio);
  }

  async getByUserId(userId: string): Promise<PortfolioDto[]> {
    const portfolios = await this.prismaService.portfolio.findMany({
      where: { userId },
      include: { symbols: { include: { symbols: true } } }
    });
    return portfolios.map((p) => plainToInstance(PortfolioDto, p));
  }

  async addSymbols(input: AddSymbolToPortfolioDto): Promise<PortfolioDto> {
    const { id: portfolioId, userId, symbols } = input;

    const exsitingPortfolio = await this.prismaService.portfolio.findUniqueOrThrow({ where: { id: portfolioId }});

    if (!exsitingPortfolio) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.NOT_FOUND),
        StatusCodes.NOT_FOUND
      );
    }

    await this.prismaService.portfolioSymbol.createMany({
      data: symbols.map(({ symbolId, quantity }) => ({
        portfolioId,
        symbolId,
        quantity
      })),
      skipDuplicates: true
    });

    const updatedPortfolio = await this.prismaService.portfolio.findUniqueOrThrow({
      where: { id: portfolioId },
      include: { symbols: true },
    });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }
}

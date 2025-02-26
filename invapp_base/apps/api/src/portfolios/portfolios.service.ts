import { plainToClass, plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { SymbolsService } from '../symbols/symbols.service';
import { UsersService } from '../users/users.service';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { PortfolioDto } from './dto/Portfolio.dto';
import { Injectable } from '@nestjs/common';
import { AddSymbolToPortfolioDto } from './dto/AddSymbolsToPortfolio.dto';

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
    });
    return portfolios.map((p) => plainToInstance(PortfolioDto, p));
  }

  async addSymbols(input: AddSymbolToPortfolioDto): Promise<PortfolioDto> {
    const { id, userId } = input;

    const updatedPortfolio = await this.prismaService.portfolio.update({
      where: { userId, id },
      data: {
        symbols: {
          create: input.symbols.map(({symbolId, quantity}) => ({
            symbolId,
            quantity
          }))
        }
      }, include: { symbols: true }
    });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }
}

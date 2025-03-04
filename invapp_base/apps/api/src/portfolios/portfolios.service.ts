import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { PortfolioDto } from './dto/Portfolio.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { SymbolToPortfolioDto } from './dto/SymbolToPortfolio.dto';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { DeleteSymbolsFromPortfolioDto } from './dto/DeleteSymbolsFromPortfolio.dto';
import { Currency } from './dto/PortfolioBalance.dto';

@Injectable()
export class PortfoliosService {
  constructor(private prismaService: PrismaService) {}

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
      include: { symbols: { include: { symbols: true } } },
    });
    return portfolios.map((p) => plainToInstance(PortfolioDto, p));
  }

  async addSymbols(
    id: string,
    input: SymbolToPortfolioDto,
  ): Promise<PortfolioDto> {
    const exsitingPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({ where: { id } });

    if (!exsitingPortfolio) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.NOT_FOUND),
        StatusCodes.NOT_FOUND,
      );
    }

    const portfolioSymbols = input.symbols.map(({ symbolId, quantity }) => {
      return this.prismaService.portfolioSymbol.upsert({
        where: { portfolioId_symbolId: { portfolioId: id, symbolId } },
        update: { quantity },
        create: { portfolioId: id, symbolId: symbolId, quantity },
      });
    });

    await Promise.all(portfolioSymbols);

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { symbols: true },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async updateSymbols(
    id: string,
    input: SymbolToPortfolioDto,
  ): Promise<PortfolioDto> {
    const updates = input.symbols.map(({ symbolId, quantity }) =>
      this.prismaService.portfolioSymbol.update({
        where: { portfolioId_symbolId: { portfolioId: id, symbolId } },
        data: {
          portfolioId: id,
          symbolId,
          quantity,
        },
      }),
    );

    await Promise.all(updates);

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { symbols: true },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async deleteSymbols(
    id: string,
    input: DeleteSymbolsFromPortfolioDto,
  ): Promise<PortfolioDto> {
    await this.prismaService.portfolioSymbol.deleteMany({
      where: { portfolioId: id, symbolId: { in: input.symbolIds } },
    });

    const updatedPortfolio =
      await this.prismaService.portfolio.findUniqueOrThrow({
        where: { id },
        include: { symbols: true },
      });

    return plainToInstance(PortfolioDto, updatedPortfolio);
  }

  async getPortfolioBalance(id: string, currency: Currency): Promise<any> {
    // : Promise<PortfolioTotalPriceDto>
    const allSymbolsQuantity = await this.prismaService.portfolio.findMany({
      where: { id },
      include: { 
        symbols: { 
          include: { 
            symbols: true 
          } 
        } 
      },
    });
    
    allSymbolsQuantity.map((asq) =>
      asq.symbols.map((asqs) => {
        this.symbolService.getSharePrice(asqs.symbols.symbol);
      }),
    );
    console.log(`allSymbolsQuantity: ${JSON.stringify(allSymbolsQuantity)}`);
  }
}

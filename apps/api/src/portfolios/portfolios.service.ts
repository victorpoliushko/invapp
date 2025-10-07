import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/CreatePortfolio.dto';
import { PortfolioDto } from './dto/Portfolio.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { SymbolToPortfolioDto } from './dto/SymbolToPortfolio.dto';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { DeleteSymbolsFromPortfolioDto } from './dto/DeleteSymbolsFromPortfolio.dto';
import { Currency } from './dto/PortfolioBalance.dto';
import { SymbolsService } from '../symbols/symbols.service';

interface SymbolsWithPrices {
  symbol: string;
  price: number;
  currency: Currency;
  quantity: number;
}
@Injectable()
export class PortfoliosService {
  constructor(
    private prismaService: PrismaService,
    private symbolsService: SymbolsService,
  ) {}

  async create(input: CreatePortfolioDto): Promise<PortfolioDto> {
    const createdPortfolio = await this.prismaService.portfolio.create({
      data: input,
      include: { user: true },
    });
    return plainToInstance(PortfolioDto, createdPortfolio);
  }

  async getById(id: string): Promise<PortfolioDto> {
    const portfolio = await this.prismaService.portfolio.findUnique({
      where: { id },
      include: { symbols: { include: { symbols: true } } },
    });
    console.log(`Portfolio BE: ${JSON.stringify(id)}`)
    return plainToInstance(PortfolioDto, portfolio);
  }

  async getByUserId(userId: string): Promise<PortfolioDto[]> {
    const portfolios = await this.prismaService.portfolio.findMany({
      where: { userId },
      include: { symbols: { include: { symbols: true } } },
    });
    return portfolios.map((p) => plainToInstance(PortfolioDto, p));
  }

  async syncSymbolPrice(symbolId: string) {
    const exsitingSymbol = await this.prismaService.symbol.findUnique({
      where: { id: symbolId },
    });

    return await this.symbolsService.getSharePrice(exsitingSymbol.symbol);
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

    const portfolioSymbols = input.symbols.map(
      async ({ symbolId, quantity }) => {
        const price = await this.syncSymbolPrice(symbolId);
        
        return this.prismaService.portfolioSymbol.upsert({
          where: { portfolioId_symbolId: { portfolioId: id, symbolId } },
          update: { quantity, price },
          create: { portfolioId: id, symbolId: symbolId, quantity, price },
        });
      },
    );

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
    const portfolios = await this.prismaService.portfolio.findMany({
      where: { id },
      include: {
        symbols: {
          include: {
            symbols: true,
          },
        },
      },
    });

    const portfoliosWithSymbolsPrice = await Promise.all(
      portfolios.map(async (portfolio) => {
        const symbolsWithPrices = await Promise.all(
          portfolio.symbols.map(async (portfolioSymbols) => {
            console.log(`Symbol: ${portfolioSymbols.symbols.symbol}`);
            const price = await this.symbolsService.getSharePrice(
              portfolioSymbols.symbols.symbol,
            );
            return {
              symbol: portfolioSymbols.symbols.symbol,
              price,
              currency,
              quantity: portfolioSymbols.quantity,
            };
          }),
        );
        return {
          ...portfolios,
          symbols: symbolsWithPrices,
          totalPrice: this.calculateSymbolsTotalPrice(symbolsWithPrices),
        };
      }),
    );

    return portfoliosWithSymbolsPrice;
  }

  calculateSymbolsTotalPrice(symbols: SymbolsWithPrices[]) {
    return symbols.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  }
}

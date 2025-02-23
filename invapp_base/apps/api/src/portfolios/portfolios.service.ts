import { plainToClass, plainToInstance } from "class-transformer";
import { PrismaService } from "../prisma/prisma.service";
import { SymbolsService } from "../symbols/symbols.service";
import { UsersService } from "../users/users.service";
import { CreatePortfolioDto } from "./dto/CreatePortfolio.dto";
import { PortfolioDto } from "./dto/Portfolio.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PortfoliosService {
  constructor(private usersService: UsersService, private prismaService: PrismaService) {}

  async create(input: CreatePortfolioDto): Promise<PortfolioDto> {
    const createdPortfolio = await this.prismaService.portfolio.create({ data: input, include: { user: true} });
    return plainToInstance(PortfolioDto, createdPortfolio);
  }

  async getByUserId(userId: string): Promise<PortfolioDto[]> {
    const portfolios = await this.prismaService.portfolio.findMany({ where: { userId }});
    return plainToInstance(PortfolioDto, portfolios);
  }
}

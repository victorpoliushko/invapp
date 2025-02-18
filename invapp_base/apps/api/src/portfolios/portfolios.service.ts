import { plainToInstance } from "class-transformer";
import { PrismaService } from "../prisma/prisma.service";
import { SymbolsService } from "../symbols/symbols.service";
import { UsersService } from "../users/users.service";
import { CreatePortfolioDto } from "./dto/CreatePortfolio.dto";
import { PortfolioDto } from "./dto/Portfolio.dto";


export class PortfoliosService {
  constructor(private usersService: UsersService, private prismaService: PrismaService, private symbolsService: SymbolsService) {}

  async create(input: CreatePortfolioDto): Promise<PortfolioDto> {
    const createdPortfolio = await this.prismaService.portfolio.create({ data: input, include: { user: true} });
    console.log(`createdPortfolio: ${createdPortfolio}`);
    return plainToInstance(PortfolioDto, createdPortfolio);
  }
}

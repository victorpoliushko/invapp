import { Module } from "@nestjs/common";
import { PortfoliosController } from "./portfolios.controller";
import { PortfoliosService } from "./portfolios.service";
import { UsersService } from "../users/users.service";
import { SymbolsService } from "../symbols/symbols.service";
import { SymbolsModule } from "../symbols/symbols.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [SymbolsModule, PrismaModule],
  controllers: [PortfoliosController],
  providers: [PortfoliosService, UsersService, SymbolsService]
})
export class PortfoliosModule {}

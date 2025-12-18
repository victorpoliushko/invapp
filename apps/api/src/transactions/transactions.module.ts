import { Module } from "@nestjs/common";
import { AssetsModule } from "../assets/assets.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PortfoliosModule } from "src/portfolios/portfolios.module";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
  imports: [AssetsModule, PrismaModule, PortfoliosModule],
  controllers: [TransactionsController],
  providers: [TransactionsService]
})
export class TransactionsModule {}

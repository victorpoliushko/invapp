import { Module } from "@nestjs/common";
import { PortfoliosController } from "./portfolios.controller";
import { PortfoliosService } from "./portfolios.service";
import { AssetsModule } from "../assets/assets.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [AssetsModule, PrismaModule],
  controllers: [PortfoliosController],
  providers: [PortfoliosService]
})
export class PortfoliosModule {}

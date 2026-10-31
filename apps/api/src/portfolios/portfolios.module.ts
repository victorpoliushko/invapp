import { Module } from "@nestjs/common";
import { PortfoliosController } from "./portfolios.controller";
import { PortfoliosService } from "./portfolios.service";
import { AssetsModule } from "../assets/assets.module";
import { PrismaModule } from "../prisma/prisma.module";
import { FxModule } from "../fx/fx.module";

@Module({
  imports: [AssetsModule, PrismaModule, FxModule],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  exports: [PortfoliosService]
})
export class PortfoliosModule {}

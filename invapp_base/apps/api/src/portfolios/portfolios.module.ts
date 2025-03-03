import { Module } from "@nestjs/common";
import { PortfoliosController } from "./portfolios.controller";
import { PortfoliosService } from "./portfolios.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";

@Module({
  controllers: [PortfoliosController],
  providers: [PortfoliosService, PrismaService, UsersService]
})
export class PortfoliosModule {}

import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule, HttpService } from "@nestjs/axios";
import { SymbolsController } from "./symbols.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { SymbolsService } from "./symbols.service";

@Module({
  imports: [HttpModule, PrismaModule, ConfigModule],
  controllers: [SymbolsController],
  providers: [SymbolsService],
  exports: [SymbolsService]
})
export class SymbolsModule {}

import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { HttpModule, HttpService } from "@nestjs/axios";
import { SymbolsController } from "./symbols.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { SymbolsService } from "./symbols.service";

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [SymbolsController],
  providers: [ConfigService, HttpService],
  exports: [SymbolsService]
})
export class SymbolsModule {}

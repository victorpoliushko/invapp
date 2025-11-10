import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule, HttpService } from "@nestjs/axios";
import { AssetsController } from "./assets.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AssetsService } from "./assets.service";

@Module({
  imports: [HttpModule, PrismaModule, ConfigModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService]
})
export class AssetsModule {}

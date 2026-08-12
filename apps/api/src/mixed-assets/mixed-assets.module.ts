import { Module } from '@nestjs/common';
import { MixedAssetsService } from './mixed-assets.service';
import { MixedAssetsController } from './mixed-assets.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosModule } from '../portfolios/portfolios.module';

@Module({
  imports: [PortfoliosModule],
  controllers: [MixedAssetsController],
  providers: [MixedAssetsService, PrismaService],
})
export class MixedAssetsModule {}

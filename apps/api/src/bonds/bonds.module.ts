import { Module } from '@nestjs/common';
import { BondsService } from './bonds.service';
import { BondsController } from './bonds.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosModule } from '../portfolios/portfolios.module';

@Module({
  imports: [PortfoliosModule],
  controllers: [BondsController],
  providers: [BondsService, PrismaService],
})
export class BondsModule {}

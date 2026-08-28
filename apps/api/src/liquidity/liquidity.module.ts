import { Module } from '@nestjs/common';
import { LiquidityService } from './liquidity.service';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PortfoliosModule, PrismaModule],
  providers: [LiquidityService],
  exports: [LiquidityService],
})
export class LiquidityModule {}

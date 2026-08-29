import { Module } from '@nestjs/common';
import { LiquidityService } from './liquidity.service';
import { LiquidityController } from './liquidity.controller';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PortfoliosModule, PrismaModule],
  controllers: [LiquidityController],
  providers: [LiquidityService],
  exports: [LiquidityService],
})
export class LiquidityModule {}

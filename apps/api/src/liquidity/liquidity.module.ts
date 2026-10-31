import { Module } from '@nestjs/common';
import { LiquidityService } from './liquidity.service';
import { LiquidityController } from './liquidity.controller';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FxModule } from '../fx/fx.module';

@Module({
  imports: [PortfoliosModule, PrismaModule, FxModule],
  controllers: [LiquidityController],
  providers: [LiquidityService],
  exports: [LiquidityService],
})
export class LiquidityModule {}

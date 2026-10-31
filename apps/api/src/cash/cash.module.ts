import { Module } from '@nestjs/common';
import { CashService } from './cash.service';
import { CashController } from './cash.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';

@Module({
  imports: [PrismaModule, PortfoliosModule],
  controllers: [CashController],
  providers: [CashService],
})
export class CashModule {}

import { Module } from '@nestjs/common';
import { BondsService } from './bonds.service';
import { BondsController } from './bonds.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BondsController],
  providers: [BondsService, PrismaService],
})
export class BondsModule {}

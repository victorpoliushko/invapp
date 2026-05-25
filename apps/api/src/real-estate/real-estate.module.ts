import { Module } from '@nestjs/common';
import { RealEstateController } from './real-estate.controller';
import { RealEstateService } from './real-estate.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RealEstateController],
  providers: [RealEstateService],
})
export class RealEstateModule {}

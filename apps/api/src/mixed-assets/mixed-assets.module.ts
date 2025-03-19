import { Module } from '@nestjs/common';
import { MixedAssetsService } from './mixed-assets.service';
import { MixedAssetsController } from './mixed-assets.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MixedAssetsController],
  providers: [MixedAssetsService],
})
export class MixedAssetsModule {}

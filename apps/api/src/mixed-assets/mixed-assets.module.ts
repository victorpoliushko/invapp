import { Module } from '@nestjs/common';
import { MixedAssetsService } from './mixed-assets.service';
import { MixedAssetsController } from './mixed-assets.controller';

@Module({
  controllers: [MixedAssetsController],
  providers: [MixedAssetsService],
})
export class MixedAssetsModule {}

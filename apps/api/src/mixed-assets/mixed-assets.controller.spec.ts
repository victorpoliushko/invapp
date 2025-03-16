import { Test, TestingModule } from '@nestjs/testing';
import { MixedAssetsController } from './mixed-assets.controller';
import { MixedAssetsService } from './mixed-assets.service';

describe('MixedAssetsController', () => {
  let controller: MixedAssetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MixedAssetsController],
      providers: [MixedAssetsService],
    }).compile();

    controller = module.get<MixedAssetsController>(MixedAssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

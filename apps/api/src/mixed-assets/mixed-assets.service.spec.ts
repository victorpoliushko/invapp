import { Test, TestingModule } from '@nestjs/testing';
import { MixedAssetsService } from './mixed-assets.service';

describe('MixedAssetsService', () => {
  let service: MixedAssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MixedAssetsService],
    }).compile();

    service = module.get<MixedAssetsService>(MixedAssetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Injectable } from '@nestjs/common';
import { CreateMixedAssetDto } from './dto/create-mixed-asset.dto';
import { UpdateMixedAssetDto } from './dto/update-mixed-asset.dto';

@Injectable()
export class MixedAssetsService {
  create(createMixedAssetDto: CreateMixedAssetDto) {
    return 'This action adds a new mixedAsset';
  }

  findAll() {
    return `This action returns all mixedAssets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mixedAsset`;
  }

  update(id: number, updateMixedAssetDto: UpdateMixedAssetDto) {
    return `This action updates a #${id} mixedAsset`;
  }

  remove(id: number) {
    return `This action removes a #${id} mixedAsset`;
  }
}

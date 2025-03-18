import { Injectable } from '@nestjs/common';
import { CreateMixedAssetDto } from './dto/create-mixed-asset.dto';
import { UpdateMixedAssetDto } from './dto/update-mixed-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MixedAssetsDto } from './dto/mixed-assets.dto';

@Injectable()
export class MixedAssetsService {
  constructor(private prismaService: PrismaService) {}

  async create(createMixedAssetDto: CreateMixedAssetDto): Promise<MixedAssetsDto> {
    const createdAsset = await this.prismaService.mixedAssets.create({
      data: createMixedAssetDto
    });
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

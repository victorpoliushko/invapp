import { Injectable } from '@nestjs/common';
import { CreateMixedAssetDto } from './dto/create-mixed-asset.dto';
import { UpdateMixedAssetDto } from './dto/update-mixed-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MixedAssetsDto } from './dto/mixed-assets.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MixedAssetsService {
  constructor(private prismaService: PrismaService) {}

  async create(createMixedAssetDto: CreateMixedAssetDto): Promise<MixedAssetsDto> {
    const createdAsset = await this.prismaService.mixedAssets.create({
      data: createMixedAssetDto
    });
    return plainToInstance(MixedAssetsDto, createdAsset);
  }

  async findAll(limit: number): Promise<MixedAssetsDto[]> {
    const foundAssets = await this.prismaService.mixedAssets.findMany({ take: limit });
    return foundAssets.map(asset => plainToInstance(MixedAssetsDto, asset));
  }

  async findOne(id: string): Promise<MixedAssetsDto> {
    const foundAsset = await this.prismaService.mixedAssets.findFirstOrThrow({ where: { id } });
    return plainToInstance(MixedAssetsDto, foundAsset);
  }

  update(id: number, updateMixedAssetDto: UpdateMixedAssetDto) {
    return `This action updates a #${id} mixedAsset`;
  }

  remove(id: number) {
    return `This action removes a #${id} mixedAsset`;
  }
}

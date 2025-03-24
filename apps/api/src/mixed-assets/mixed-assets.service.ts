import { Injectable } from '@nestjs/common';
import { CreateMixedAssetDto } from './dto/create-mixed-asset.dto';
import { UpdateMixedAssetDto } from './dto/update-mixed-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MixedAssetsDto } from './dto/mixed-assets.dto';
import { plainToInstance } from 'class-transformer';
import { MixedAssets } from '@prisma/client';

@Injectable()
export class MixedAssetsService {
  constructor(private prismaService: PrismaService) {}

  async create(createMixedAssetDto: CreateMixedAssetDto): Promise<MixedAssets> {
    return await this.prismaService.mixedAssets.create({
      data: createMixedAssetDto
    });
    // return plainToInstance(MixedAssetsDto, createdAsset);
  }

  async findAll(limit: number): Promise<MixedAssets[]> {
    return await this.prismaService.mixedAssets.findMany({ take: limit });
  }

  async findOne(id: string): Promise<MixedAssets> {
    return await this.prismaService.mixedAssets.findFirstOrThrow({ where: { id } });
  }

  async update(id: string, updateMixedAssetDto: UpdateMixedAssetDto): Promise<MixedAssets> {
    return await this.prismaService.mixedAssets.update({ where: { id }, data: updateMixedAssetDto });
  }

  remove(id: number) {
    return `This action removes a #${id} mixedAsset`;
  }
}

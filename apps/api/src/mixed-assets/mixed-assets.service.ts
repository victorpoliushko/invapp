import { Injectable } from '@nestjs/common';
import { CreateMixedAssetDto } from './dto/create-mixed-asset.dto';
import { UpdateMixedAssetDto } from './dto/update-mixed-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
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

  async remove(id: string): Promise<MixedAssets[]> {
    await this.prismaService.mixedAssets.delete({ where: { id } });
    return await this.prismaService.mixedAssets.findMany();
  }
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateMixedAssetDto } from './create-mixed-asset.dto';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { MixedAssetType } from './mixed-assets.dto';

export class UpdateMixedAssetDto extends PartialType(CreateMixedAssetDto) {
  @IsString()
  title: string;

  @IsEnum(MixedAssetType)
  type: MixedAssetType;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

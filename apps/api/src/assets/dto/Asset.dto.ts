import { DataSource, AssetType } from '@prisma/client';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AssetDto {
  @IsDefined()
  @IsNotEmpty()
  id: string;

  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  asset: string;

  @IsString()
  @IsNotEmpty()
  exchange: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(DataSource)
  dataSource: DataSource;

  @IsOptional()
  updatedAt?: Date;
}

export class CreateAssetDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  asset: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(AssetType)
  @IsNotEmpty()
  type?: AssetType;

  @IsOptional()
  @IsString()
  exchange?: string;

  @IsOptional()
  @IsEnum(DataSource)
  dataSource?: DataSource;

  @IsOptional()
  @IsString()
  updatedAt?: string;
}

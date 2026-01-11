import { DataSource, AssetType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { TransactionsDto } from 'src/transactions/dto/Transations.dto';

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

  @Type(() => TransactionsDto)
  @Expose()
  transactions?: TransactionsDto[];
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
  buyDate?: string;
}

export class UpdateAssetDto {
  @ValidateIf(i => i.id || i.asset)
  @IsDefined({message: 'At least one of id or asset must be provided'})
  @IsString()
  id?: string;

  @ValidateIf(i => i.id || i.asset)
  @IsDefined({message: 'At least one of id or asset must be provided'})
  @IsString()
  asset?: string;

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

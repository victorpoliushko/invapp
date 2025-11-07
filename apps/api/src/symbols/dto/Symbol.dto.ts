import { DataSource, SymbolType } from '@prisma/client';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SymbolDto {
  @IsDefined()
  @IsNotEmpty()
  id: string;

  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

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

export class CreateSymbolDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(SymbolType)
  @IsNotEmpty()
  type?: SymbolType;

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

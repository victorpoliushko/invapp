import { RealEstateType } from '@prisma/client';
import { IsEnum, IsNumber, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateRealEstateDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(RealEstateType)
  type: RealEstateType;

  @IsString()
  purchaseDate: string;

  @IsNumber()
  purchasePrice: number;

  @IsOptional()
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsNumber()
  totalArea?: number;

  @IsUUID()
  portfolioId: string;
}

export class UpdateRealEstateDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RealEstateType)
  type?: RealEstateType;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsNumber()
  totalArea?: number;
}

export class CreateRealEstateTransactionDto {
  @IsUUID()
  realEstateId: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsNumber()
  monthlyRent: number;
}

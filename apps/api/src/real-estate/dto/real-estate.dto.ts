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

  @IsUUID()
  portfolioId: string;
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

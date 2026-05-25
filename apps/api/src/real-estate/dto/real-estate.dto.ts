import { RealEstateType } from '@prisma/client';
import { IsEnum, IsNumber, IsString, IsUUID, Min, Max, IsOptional } from 'class-validator';

export class CreateRealEstateDto {
  @IsString()
  name: string;

  @IsEnum(RealEstateType)
  type: RealEstateType;

  @IsString()
  purchaseDate: string;

  @IsNumber()
  purchasePrice: number;

  @IsNumber()
  monthlyRent: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  occupancyPct?: number;

  @IsUUID()
  portfolioId: string;
}

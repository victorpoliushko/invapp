import { TransactionType } from '@prisma/client';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';
import { AssetDto } from 'src/assets/dto/Asset.dto';
import { PortfolioDto } from 'src/portfolios/dto/Portfolio.dto';

export class TransactionsDto {
  @IsUUID()
  @IsDefined()
  id: string;

  @IsUUID()
  @IsDefined()
  portfolioId: string;

  @IsUUID()
  @IsDefined()
  assetId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  quantityChange: string;

  @IsString()
  @IsDefined()
  pricePerUnit: string;

  @IsString()
  @IsDefined()
  @Expose()
  @Transform(({ value }) => value.toISOString().split('T')[0])
  date: string;

  @Type(() => PortfolioDto)
  portfolio: PortfolioDto;

  @Type(() => AssetDto)
  asset: AssetDto;
}

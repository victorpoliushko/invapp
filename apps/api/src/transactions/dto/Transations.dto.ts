import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDecimal,
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

  @IsDecimal()
  quantityChange: number;

  @IsString()
  @IsDefined()
  date: string;

  @Type(() => PortfolioDto)
  portfolio: PortfolioDto;

  @Type(() => AssetDto)
  asset: AssetDto;
}

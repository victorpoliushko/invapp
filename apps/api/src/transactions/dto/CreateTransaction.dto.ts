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

export class CreateTransactionDto {
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
}

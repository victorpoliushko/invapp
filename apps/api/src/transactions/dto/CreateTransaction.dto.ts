import { TransactionType } from '@prisma/client';
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  pricePerUnit: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  quantityChange: number;

  @IsString()
  @IsDefined()
  date: string;

  @IsUUID()
  @IsDefined()
  portfolioId: string;

  @ValidateIf(i => !i.assetName || i.assetId)
  @IsDefined({message: 'At least one of id or assetName must be provided'})
  @IsUUID()
  assetId?: string;

  @ValidateIf(i => !i.assetId || i.assetName)
  @IsDefined({message: 'At least one of id or assetName must be provided'})
  @IsString()
  assetName?: string;
}

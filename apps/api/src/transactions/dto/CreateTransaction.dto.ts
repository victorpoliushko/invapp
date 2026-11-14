import { TransactionType } from '@prisma/client';
import {
  IsDefined,
  IsEnum,
  IsObject,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateTransactionDto {
  @IsDefined()
  @IsString()
  pricePerUnit: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  quantityChange: string;

  @IsObject()
  position: { quantity: string; price?: string | null };

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

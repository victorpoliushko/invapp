import { TransactionType } from '@prisma/client';
import { Expose, Transform } from 'class-transformer';
import { IsDefined, IsEnum, IsObject, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { CashCredit } from '../../cash/cash-ledger';

export class AddAssetInputDto {
  @ValidateIf(i => !i.assetName || i.assetId)
  @IsDefined({message: 'At least one of id or assetName must be provided'})
  @IsUUID()
  assetId?: string;

  @ValidateIf(i => !i.assetId || i.assetName)
  @IsDefined({message: 'At least one of id or assetName must be provided'})
  @IsString()
  assetName?: string;

  @IsString()
  @IsDefined()
  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString().split('T')[0] : value)
  date: string;

  @IsString()
  quantityChange: string;

  @IsString()
  pricePerUnit: string;

  @IsEnum(TransactionType, {
    message: 'type must be "BUY" or "SELL"',
  })
  type: TransactionType;

  @IsOptional()
  @IsString()
  coingeckoId?: string;

  @IsObject()
  position: { quantity: string; price?: string | null };

  @IsOptional()
  @IsObject()
  cash?: CashCredit;
}

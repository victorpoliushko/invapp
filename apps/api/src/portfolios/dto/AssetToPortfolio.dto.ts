import { TransactionType } from '@prisma/client';
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

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
  date: string;

  @IsNumber()
  @IsDefined()
  quantityChange: number;

  @IsNumber()
  @IsDefined()
  pricePerUnit: number;

  @IsEnum(TransactionType, {
    message: 'type must be "BUY" or "SELL"',
  })
  type: TransactionType;
}

import { TransactionType } from '@prisma/client';
import {
  IsDecimal,
  IsDefined,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';

export class AddTransactionInputDto {
  @IsUUID()
  @IsDefined()
  portfolioId: string;
  
  @IsUUID()
  @IsDefined()
  assetId: string;

  @IsEnum(TransactionType, {
    message: 'type must be "BUY" or "SELL"',
  })
  type: TransactionType;

  @IsDecimal()
  quantityChange: number;

  @IsString()
  @IsDefined()
  date: string;
}

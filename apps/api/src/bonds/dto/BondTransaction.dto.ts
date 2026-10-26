import { TransactionType } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class BondTransactionInputDto {
  @IsEnum(TransactionType, { message: 'type must be "BUY" or "SELL"' })
  type: TransactionType;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  pricePerUnit: number;

  @IsDateString()
  date: string;
}

export class BondTransactionUpdateDto {
  @IsOptional()
  @IsEnum(TransactionType, { message: 'type must be "BUY" or "SELL"' })
  type?: TransactionType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  pricePerUnit?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}

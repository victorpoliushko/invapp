import { TransactionType } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { CashCredit } from '../../cash/cash-ledger';

export type BondHolding = { quantity: string; purchasePrice: string; purchaseDate?: string | null };

export class BondTransactionInputDto {
  @IsEnum(TransactionType, { message: 'type must be "BUY" or "SELL"' })
  type: TransactionType;

  @IsString()
  quantity: string;

  @IsString()
  pricePerUnit: string;

  @IsDateString()
  date: string;

  @IsObject()
  bond: BondHolding;

  @IsOptional()
  @IsBoolean()
  soldOut?: boolean;

  @IsOptional()
  @IsObject()
  cash?: CashCredit;
}

export class BondTransactionUpdateDto {
  @IsOptional()
  @IsEnum(TransactionType, { message: 'type must be "BUY" or "SELL"' })
  type?: TransactionType;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  pricePerUnit?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsObject()
  bond: BondHolding;
}

export class BondTransactionDeleteDto {
  @IsObject()
  bond: BondHolding;
}

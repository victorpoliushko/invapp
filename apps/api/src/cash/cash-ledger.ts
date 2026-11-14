import { BadRequestException } from '@nestjs/common';
import { CashCategory, Prisma, PrismaClient } from '@prisma/client';
import { cipher } from '../common/cipher';
import { isSupportedCurrency } from '../fx/currencies';

type Db = PrismaClient | Prisma.TransactionClient;

export type CashCredit = {
  id?: string;
  name?: string | null;
  category?: CashCategory;
  currency?: string;
  amount: string;
};

/** Stores sale proceeds the device already added up: updates an existing cash entry or creates one. */
export async function applyCashCredit(db: Db, portfolioId: string, credit: CashCredit | null | undefined): Promise<void> {
  if (!credit) return;
  const amount = cipher(credit.amount, 'cash.amount');

  if (credit.id) {
    const existing = await db.cash.findUnique({ where: { id: credit.id }, select: { portfolioId: true } });
    if (!existing || existing.portfolioId !== portfolioId) throw new BadRequestException('Unknown cash entry');
    await db.cash.update({ where: { id: credit.id }, data: { amount } });
    return;
  }

  const currency = String(credit.currency ?? '').toUpperCase();
  if (!isSupportedCurrency(currency)) throw new BadRequestException('Unsupported cash currency');
  const category = credit.category && credit.category in CashCategory ? credit.category : CashCategory.GENERAL;
  await db.cash.create({ data: { portfolioId, category, currency, name: credit.name ?? null, amount } });
}

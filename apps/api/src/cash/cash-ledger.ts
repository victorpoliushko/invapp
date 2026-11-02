import { CashCategory, Prisma, PrismaClient } from '@prisma/client';

type Db = PrismaClient | Prisma.TransactionClient;

const PROCEEDS_NAME: Record<CashCategory, string> = {
  GENERAL: 'Sale proceeds',
  STOCK: 'Digital cash',
  CRYPTO: 'Digital cash',
};

/** Adds sale proceeds to the portfolio's matching cash position, creating it on first sale. */
export async function creditCash(
  db: Db,
  portfolioId: string,
  category: CashCategory,
  currency: string,
  amount: number,
): Promise<void> {
  if (!(amount > 0)) return;
  const name = PROCEEDS_NAME[category];
  const existing = await db.cash.findFirst({ where: { portfolioId, category, currency, name } });
  if (existing) {
    await db.cash.update({ where: { id: existing.id }, data: { amount: existing.amount + amount } });
  } else {
    await db.cash.create({ data: { portfolioId, category, currency, name, amount } });
  }
}

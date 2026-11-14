export type CashCategory = "GENERAL" | "STOCK" | "CRYPTO";

export type CashCredit =
  | { id: string; amount: number }
  | { name: string; category: CashCategory; currency: string; amount: number };

const PROCEEDS_NAME: Record<CashCategory, string> = {
  GENERAL: "Sale proceeds",
  STOCK: "Digital cash",
  CRYPTO: "Digital cash",
};

export function cashCredit(
  entries: { id: string; name: string | null; currency: string; amount: number; category?: string | null }[] | undefined,
  category: CashCategory,
  currency: string,
  amount: number,
): CashCredit | undefined {
  if (!(amount > 0)) return undefined;
  const name = PROCEEDS_NAME[category];
  const existing = (entries ?? []).find(
    (e) => (e.category ?? "GENERAL") === category && e.currency === currency && e.name === name,
  );
  if (existing) return { id: existing.id, amount: existing.amount + amount };
  return { name, category, currency, amount };
}

import { Holdings, ToUsd } from "./types";

export type NetWorthByType = {
  stocks: number;
  crypto: number;
  bonds: number;
  realEstate: number;
  mixedAssets: number;
  cash: number;
};

export const EMPTY_NET_WORTH: NetWorthByType = { stocks: 0, crypto: 0, bonds: 0, realEstate: 0, mixedAssets: 0, cash: 0 };

export function unitPrice(currentPrice: number | null | undefined, averagePrice: number | null | undefined): number {
  return currentPrice != null && currentPrice > 0 ? currentPrice : averagePrice ?? 0;
}

export function netWorthByType(portfolio: Holdings, toUsd: ToUsd): NetWorthByType {
  const byType = { ...EMPTY_NET_WORTH };

  for (const p of portfolio.stockPositions ?? []) byType.stocks += unitPrice(p.asset.currentPrice, p.price) * p.quantity;
  for (const p of portfolio.cryptoPositions ?? []) byType.crypto += unitPrice(p.asset.currentPrice, p.price) * p.quantity;
  for (const b of portfolio.bonds ?? []) {
    byType.bonds += toUsd((b.currentValue ?? b.purchasePrice) * b.quantity, b.currency ?? "USD");
  }
  for (const r of portfolio.realEstateAssets ?? []) byType.realEstate += r.currentValue ?? r.purchasePrice;
  for (const m of portfolio.mixedAssets ?? []) byType.mixedAssets += (m.currentValue ?? m.purchasePrice) * m.quantity;
  for (const c of portfolio.cash ?? []) {
    const usd = toUsd(c.amount, c.currency);
    if (c.category === "STOCK") byType.stocks += usd;
    else if (c.category === "CRYPTO") byType.crypto += usd;
    else byType.cash += usd;
  }

  return byType;
}

export function totalNetWorth(byType: NetWorthByType): number {
  return byType.stocks + byType.crypto + byType.bonds + byType.realEstate + byType.mixedAssets + byType.cash;
}

export function combinedNetWorth(portfolios: Holdings[], toUsd: ToUsd): { total: number; byType: NetWorthByType } {
  const byType = { ...EMPTY_NET_WORTH };
  for (const portfolio of portfolios) {
    const one = netWorthByType(portfolio, toUsd);
    (Object.keys(byType) as (keyof NetWorthByType)[]).forEach((k) => (byType[k] += one[k]));
  }
  return { total: totalNetWorth(byType), byType };
}

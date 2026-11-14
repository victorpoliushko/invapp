import { HoldingBond, HoldingPosition, Holdings, ToUsd, Trade } from "./types";

export type ReturnPeriod = "all" | "year" | "month";

export type Mover = { label: string; type: string; pct: number; dollarReturn: number };

const DAY_MS = 1000 * 60 * 60 * 24;

function periodStartDate(period: ReturnPeriod, now: Date): Date | null {
  if (period === "year") return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
}

function periodPosition(trades: Trade[], periodStart: Date | null): { quantity: number; avgPrice: number } | null {
  let quantity = 0;
  let cost = 0;
  for (const t of trades) {
    if (periodStart && new Date(t.date) < periodStart) continue;
    const sign = t.type === "BUY" ? 1 : -1;
    quantity += sign * t.quantityChange;
    cost += sign * t.quantityChange * t.pricePerUnit;
  }
  if (quantity <= 0) return null;
  return { quantity, avgPrice: cost / quantity };
}

function daysOverlap(periodStart: Date | null, now: Date, rangeStart: Date, rangeEnd: Date): number {
  const start = periodStart && periodStart > rangeStart ? periodStart : rangeStart;
  const end = now < rangeEnd ? now : rangeEnd;
  const ms = end.getTime() - start.getTime();
  return ms > 0 ? ms / DAY_MS : 0;
}

function bondReturn(bond: HoldingBond, periodStart: Date | null, now: Date): number {
  const holdingEnd = bond.maturityDate ? new Date(bond.maturityDate) : now;
  const days = daysOverlap(periodStart, now, new Date(bond.purchaseDate), holdingEnd);
  if (days <= 0) return 0;
  const income = bond.faceValue * (bond.couponRate / 100) * bond.quantity * (days / 365.25);
  const capitalGain = bond.currentValue != null ? (bond.currentValue - bond.purchasePrice) * bond.quantity : 0;
  return income + capitalGain;
}

function rentalIncome(leases: { startDate: string; endDate: string; monthlyRent: number }[], periodStart: Date | null, now: Date) {
  return leases.reduce((sum, l) => {
    const days = daysOverlap(periodStart, now, new Date(l.startDate), new Date(l.endDate));
    return days > 0 ? sum + (days / 30.4375) * l.monthlyRent : sum;
  }, 0);
}

type Line = { label: string; type: string; cost: number; dollarReturn: number };

function returnLines(portfolio: Holdings, period: ReturnPeriod, toUsd: ToUsd, now = new Date()): Line[] {
  const periodStart = periodStartDate(period, now);
  const lines: Line[] = [];

  const positions: HoldingPosition[] = [...(portfolio.stockPositions ?? []), ...(portfolio.cryptoPositions ?? [])];
  for (const p of positions) {
    const currentPrice = p.asset.currentPrice;
    if (currentPrice == null) continue;
    const position = periodPosition(p.transactions ?? [], periodStart);
    if (!position || position.avgPrice === 0) continue;
    const cost = position.avgPrice * position.quantity;
    lines.push({
      label: p.asset.ticker,
      type: p.asset.type ?? "Stock",
      cost,
      dollarReturn: currentPrice * position.quantity - cost,
    });
  }

  for (const b of portfolio.bonds ?? []) {
    if (b.quantity <= 0) continue;
    const currency = b.currency ?? "USD";
    const cost = toUsd(b.purchasePrice * b.quantity, currency);
    const dollarReturn = toUsd(bondReturn(b, periodStart, now), currency);
    if (cost <= 0 || dollarReturn === 0) continue;
    lines.push({ label: b.isin, type: "BOND", cost, dollarReturn });
  }

  for (const r of portfolio.realEstateAssets ?? []) {
    if (r.purchasePrice <= 0) continue;
    const income = rentalIncome(r.transactions ?? [], periodStart, now);
    const capitalGain = r.currentValue != null ? r.currentValue - r.purchasePrice : 0;
    lines.push({
      label: r.name ?? r.code ?? "Real estate",
      type: "REAL_ESTATE",
      cost: r.purchasePrice,
      dollarReturn: income + capitalGain,
    });
  }

  for (const m of portfolio.mixedAssets ?? []) {
    if (m.currentValue == null || m.quantity <= 0) continue;
    if (daysOverlap(periodStart, now, new Date(m.purchaseDate), now) <= 0) continue;
    const cost = m.purchasePrice * m.quantity;
    if (cost <= 0) continue;
    lines.push({ label: m.name, type: "MIXED_ASSET", cost, dollarReturn: m.currentValue * m.quantity - cost });
  }

  return lines;
}

export function portfolioReturns(portfolio: Holdings, period: ReturnPeriod, toUsd: ToUsd) {
  const lines = returnLines(portfolio, period, toUsd);
  const cost = lines.reduce((sum, l) => sum + l.cost, 0);
  const dollarReturn = lines.reduce((sum, l) => sum + l.dollarReturn, 0);
  if (lines.length === 0 || cost === 0) return { pctReturn: null, dollarReturn: null };
  return { pctReturn: (dollarReturn / cost) * 100, dollarReturn };
}

export function topMovers(portfolio: Holdings, period: ReturnPeriod, toUsd: ToUsd) {
  const movers: Mover[] = returnLines(portfolio, period, toUsd)
    .filter((l) => l.cost > 0)
    .map((l) => ({ label: l.label, type: l.type, pct: (l.dollarReturn / l.cost) * 100, dollarReturn: l.dollarReturn }));
  return {
    topPerformers: [...movers].sort((a, b) => b.pct - a.pct).slice(0, 3),
    topLosers: movers.filter((m) => m.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 3),
  };
}

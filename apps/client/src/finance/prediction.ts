import { Holdings, ToUsd } from "./types";
import { unitPrice } from "./valuation";

export const FALLBACK_RATE = 0.07;
export const MIN_HISTORY_YEARS = 1;
export const RATE_CAP = { min: -0.2, max: 0.25 };
export const MARKET_RATE = 0.1;

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

type Weighted = { value: number; rate: number };

function yearsSince(date: string | undefined | null, now: Date): number {
  if (!date) return 0;
  const ms = now.getTime() - new Date(date).getTime();
  return ms > 0 ? ms / YEAR_MS : 0;
}

function clamp(rate: number): number {
  return Math.min(RATE_CAP.max, Math.max(RATE_CAP.min, rate));
}

function annualized(value: number, cost: number, years: number): number {
  if (years < MIN_HISTORY_YEARS || cost <= 0 || value <= 0) return FALLBACK_RATE;
  return clamp(Math.pow(value / cost, 1 / years) - 1);
}

function activeRent(leases: { startDate: string; endDate: string; monthlyRent: number }[] | undefined, now: Date): number {
  return (leases ?? [])
    .filter((l) => new Date(l.startDate) <= now && new Date(l.endDate) >= now)
    .reduce((sum, l) => sum + l.monthlyRent * 12, 0);
}

function weightedHoldings(portfolio: Holdings, toUsd: ToUsd, now: Date): Weighted[] {
  const out: Weighted[] = [];

  for (const p of [...(portfolio.stockPositions ?? []), ...(portfolio.cryptoPositions ?? [])]) {
    if (p.quantity <= 0) continue;
    const value = unitPrice(p.asset.currentPrice, p.price) * p.quantity;
    const cost = (p.price ?? 0) * p.quantity;
    const firstBuy = (p.transactions ?? [])
      .filter((t) => t.type === "BUY")
      .map((t) => t.date)
      .sort()[0];
    out.push({ value, rate: annualized(value, cost, yearsSince(firstBuy, now)) });
  }

  for (const b of portfolio.bonds ?? []) {
    if (b.quantity <= 0) continue;
    const unit = b.currentValue ?? b.purchasePrice;
    const value = toUsd(unit * b.quantity, b.currency ?? "USD");
    const rate = unit > 0 ? clamp((b.faceValue * (b.couponRate / 100)) / unit) : FALLBACK_RATE;
    out.push({ value, rate });
  }

  for (const r of portfolio.realEstateAssets ?? []) {
    const value = r.currentValue ?? r.purchasePrice;
    if (value <= 0) continue;
    const growth =
      r.currentValue != null ? annualized(r.currentValue, r.purchasePrice, yearsSince(r.purchaseDate, now)) : 0;
    const rentYield = activeRent(r.transactions, now) / value;
    out.push({ value, rate: clamp(growth + rentYield) });
  }

  for (const m of portfolio.mixedAssets ?? []) {
    if (m.quantity <= 0) continue;
    const value = (m.currentValue ?? m.purchasePrice) * m.quantity;
    const rate =
      m.currentValue != null
        ? annualized(value, m.purchasePrice * m.quantity, yearsSince(m.purchaseDate, now))
        : FALLBACK_RATE;
    out.push({ value, rate });
  }

  for (const c of portfolio.cash ?? []) {
    const value = toUsd(c.amount, c.currency);
    if (value > 0) out.push({ value, rate: 0 });
  }

  return out;
}

export function expectedAnnualRate(portfolios: Holdings[], toUsd: ToUsd, now = new Date()): number {
  const holdings = portfolios.flatMap((p) => weightedHoldings(p, toUsd, now)).filter((h) => h.value > 0);
  const total = holdings.reduce((sum, h) => sum + h.value, 0);
  if (total <= 0) return FALLBACK_RATE;
  return holdings.reduce((sum, h) => sum + h.rate * (h.value / total), 0);
}

export type ProjectionInput = {
  startValue: number;
  annualRate: number;
  monthlyContribution: number;
  monthlyWithdrawal: number;
  oneTimeWithdrawal?: { amount: number; atYear: number };
  years: number;
};

export type Projection = {
  keep: number[];
  stop: number[];
  withdraw: number[];
  runsOutAtYear: number | null;
};

export function project(input: ProjectionInput): Projection {
  const monthlyRate = Math.pow(1 + input.annualRate, 1 / 12) - 1;
  let keep = input.startValue;
  let stop = input.startValue;
  let withdraw = input.startValue;
  let runsOutAtYear: number | null = null;
  const oneTime = input.oneTimeWithdrawal;
  const takeOneTime = (month: number) => {
    if (!oneTime || oneTime.amount <= 0 || month !== oneTime.atYear * 12 || withdraw <= 0) return;
    withdraw -= oneTime.amount;
    if (withdraw <= 0) {
      withdraw = 0;
      runsOutAtYear ??= month / 12;
    }
  };
  takeOneTime(0);
  const result: Projection = { keep: [keep], stop: [stop], withdraw: [withdraw], runsOutAtYear: null };

  for (let month = 1; month <= input.years * 12; month++) {
    keep = keep * (1 + monthlyRate) + input.monthlyContribution;
    stop = stop * (1 + monthlyRate);
    if (withdraw > 0) {
      withdraw = withdraw * (1 + monthlyRate) - input.monthlyWithdrawal;
      if (withdraw <= 0) {
        withdraw = 0;
        runsOutAtYear ??= month / 12;
      }
    }
    takeOneTime(month);
    if (month % 12 === 0) {
      result.keep.push(keep);
      result.stop.push(stop);
      result.withdraw.push(withdraw);
    }
  }

  return { ...result, runsOutAtYear };
}

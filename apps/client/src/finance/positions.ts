import { TradeType } from "./types";

type Lot = { type: TradeType; quantity: number; price: number; date: string };

export function averageCost(lots: Lot[]): { quantity: number; price: number } {
  const ordered = [...lots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let quantity = 0;
  let cost = 0;

  for (const lot of ordered) {
    if (lot.type === "BUY") {
      quantity += lot.quantity;
      cost += lot.quantity * lot.price;
    } else {
      const avg = quantity > 0 ? cost / quantity : 0;
      quantity -= lot.quantity;
      cost -= lot.quantity * avg;
    }
  }

  if (quantity <= 1e-9) return { quantity: Math.max(quantity, 0), price: 0 };
  return { quantity, price: cost / quantity };
}

export function positionFromTrades(trades: { type: TradeType; quantityChange: number; pricePerUnit: number; date: string }[]) {
  return averageCost(trades.map((t) => ({ type: t.type, quantity: t.quantityChange, price: t.pricePerUnit, date: t.date })));
}

export function bondHoldingFromTrades(trades: { type: TradeType; quantity: number; pricePerUnit: number; date: string }[]) {
  const { quantity, price } = averageCost(trades.map((t) => ({ type: t.type, quantity: t.quantity, price: t.pricePerUnit, date: t.date })));
  const firstBuy = trades
    .filter((t) => t.type === "BUY")
    .reduce<string | null>((min, t) => (!min || new Date(t.date) < new Date(min) ? t.date : min), null);
  return { quantity, purchasePrice: price, purchaseDate: firstBuy };
}

export function oversold(trades: { type: TradeType; quantity: number }[]): boolean {
  const held = trades.reduce((sum, t) => sum + (t.type === "BUY" ? t.quantity : -t.quantity), 0);
  return held < -1e-9;
}

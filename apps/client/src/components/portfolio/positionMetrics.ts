import { PositionDto } from "../../types/portfolio";

export function totalPosition(position: PositionDto): number {
  return position.transactions
    .filter((t) => t.type === "BUY")
    .reduce((sum, t) => sum + t.quantityChange * t.pricePerUnit, 0);
}

export function pctChange(position: PositionDto, currentPrice: number | undefined): number | null {
  const avg = position.price;
  return currentPrice != null && avg != null && avg !== 0 ? ((currentPrice - avg) / avg) * 100 : null;
}

export function totalReturn(position: PositionDto, currentPrice: number | undefined): number | null {
  const avg = position.price;
  return currentPrice != null && avg != null ? (currentPrice - avg) * position.quantity : null;
}

export function lastTradeDate(position: PositionDto): Date | null {
  if (!position.transactions?.length) return null;
  return new Date(Math.max(...position.transactions.map((t) => new Date(t.date).getTime())));
}

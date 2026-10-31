export function formatMoney(value: number, digits = 0): string {
  const abs = Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: digits });
  return `${value < 0 ? "-" : ""}$${abs}`;
}

const COMPACT_FROM = 10_000;

export function formatCurrency(value: number, currency: string, digits = 0): string {
  const compact = Math.abs(value) >= COMPACT_FROM;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: compact ? 1 : digits,
    ...(compact && { notation: "compact", roundingMode: "trunc" }),
  } as Intl.NumberFormatOptions).format(value);
}

export function signedMoney(value: number, digits = 0): string {
  return `${value >= 0 ? "+" : ""}${formatMoney(value, digits)}`;
}

export function signedCurrency(value: number, currency: string, digits = 0): string {
  return `${value >= 0 ? "+" : ""}${formatCurrency(value, currency, digits)}`;
}

export function signedPct(value: number, digits = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function gainColor(value: number): string {
  return value >= 0 ? "var(--text-success)" : "var(--text-danger)";
}

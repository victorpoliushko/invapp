export function formatMoney(value: number, digits = 0): string {
  const abs = Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: digits });
  return `${value < 0 ? "-" : ""}$${abs}`;
}

export function formatCurrency(value: number, currency: string, digits = 0): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

export function signedMoney(value: number, digits = 0): string {
  return `${value >= 0 ? "+" : ""}${formatMoney(value, digits)}`;
}

export function signedPct(value: number, digits = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function gainColor(value: number): string {
  return value >= 0 ? "var(--text-success)" : "var(--text-danger)";
}

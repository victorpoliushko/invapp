export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
export const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDateValue(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export const formatFieldDate = (d: Date | null) =>
  d ? d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }) : "Select";

export function monthGrid(view: Date): Date[] {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(new Date(first.getFullYear(), first.getMonth(), 1 - offset + i));
  return days.slice(0, days[35].getMonth() === view.getMonth() ? 42 : 35);
}

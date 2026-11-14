import { useMemo } from "react";
import "./LiquiditySummary.css";
import { useCurrency } from "../../context/CurrencyContext";
import { formatCurrency } from "../../utils/money";
import { useAllPortfolios } from "../../hooks/useAllPortfolios";
import { computeLiquidity } from "../../finance/liquidity";
import { combinedNetWorth } from "../../finance/valuation";

// The reference data only has day-level granularity (no hours), so a
// same-day range (e.g. major crypto) reads as "same day" rather than the
// product owner's illustrative "~2 hours" — closest honest approximation
// without inventing precision the data doesn't have.
function formatDays(days: number): string {
  if (days <= 0) return "same day";
  if (days < 30) return `${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`;
  const months = Math.round(days / 30.4375);
  return `${months} month${months === 1 ? "" : "s"}`;
}

function formatRange(min: number, max: number): string {
  if (max <= 0) return "same day";
  if (Math.round(min) === Math.round(max)) return `~${formatDays(max)}`;
  return `~${formatDays(min)}–${formatDays(max)}`;
}

const SPEED_STOPS = [
  [76, 175, 80],
  [247, 147, 26],
  [229, 115, 115],
];

function speedColor(index: number, count: number): string {
  if (count <= 1) return `rgb(${SPEED_STOPS[0].join(", ")})`;
  const t = index / (count - 1);
  const scaled = t * (SPEED_STOPS.length - 1);
  const i = Math.min(Math.floor(scaled), SPEED_STOPS.length - 2);
  const f = scaled - i;
  const mix = SPEED_STOPS[i].map((c, k) => Math.round(c + (SPEED_STOPS[i + 1][k] - c) * f));
  return `rgb(${mix.join(", ")})`;
}

const ROWS: { key: "cash" | "stocks" | "bonds" | "crypto"; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "stocks", label: "Stocks" },
  { key: "bonds", label: "Bonds" },
  { key: "crypto", label: "Crypto" },
];

export function LiquiditySummary() {
  const { defaultCurrency, fromUsd, toUsd } = useCurrency();
  const portfolios = useAllPortfolios();
  const liquidity = useMemo(() => (portfolios ? computeLiquidity(portfolios, toUsd) : null), [portfolios, toUsd]);
  const netWorthTotal = useMemo(
    () => (portfolios ? combinedNetWorth(portfolios, toUsd).total : null),
    [portfolios, toUsd],
  );

  if (!liquidity) return null;

  const realEstate = liquidity.byType.realEstate;

  // Sorted fastest-to-cash first. Real estate sorts on its fast-sale range
  // (the headline figure), same as what's displayed, not the full-value one.
  const rows = [
    ...ROWS.map((r) => ({ ...r, line: liquidity.byType[r.key], isRealEstate: false as const })),
    { key: "realEstate" as const, label: "Real estate", line: realEstate, isRealEstate: true as const },
  ]
    .filter((r) => r.line.amount > 0)
    .sort((a, b) => a.line.minDays - b.line.minDays || a.line.maxDays - b.line.maxDays);

  if (rows.length === 0) return null;

  return (
    <section className="section-container">
      <div className="liquidity-summary">
        <div className="liquidity-summary-header">
          <span className="liquidity-summary-label">Time to cash</span>
        </div>

        <div className="liquidity-summary-rows">
          {rows.map((r, i) => (
            <div key={r.key} className="liquidity-summary-row">
              <span className="liquidity-summary-row-label">{r.label}</span>
              <span className="liquidity-summary-row-range" style={{ color: speedColor(i, rows.length) }}>
                {formatRange(r.line.minDays, r.line.maxDays)}
                {r.isRealEstate && (
                  <span className="liquidity-summary-row-range-alt">
                    {" "}
                    (full value: {formatRange(realEstate.full.minDays, realEstate.full.maxDays)})
                  </span>
                )}
              </span>
              <span className="liquidity-summary-row-amount">{formatCurrency(fromUsd(r.line.amount, defaultCurrency), defaultCurrency)}</span>
              {netWorthTotal != null && netWorthTotal > 0 && (
                <span className="liquidity-summary-row-pct">
                  {((r.line.amount / netWorthTotal) * 100).toFixed(1)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

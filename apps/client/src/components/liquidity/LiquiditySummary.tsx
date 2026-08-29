import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import "./LiquiditySummary.css";

type LiquidityLine = { amount: number; minDays: number; maxDays: number };
type RealEstateLiquidityLine = LiquidityLine & { full: LiquidityLine };

type LiquiditySummary = {
  byType: {
    stocks: LiquidityLine;
    bonds: LiquidityLine;
    crypto: LiquidityLine;
    realEstate: RealEstateLiquidityLine;
  };
};

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

const ROWS: { key: "stocks" | "bonds" | "crypto"; label: string }[] = [
  { key: "stocks", label: "Stocks" },
  { key: "bonds", label: "Bonds" },
  { key: "crypto", label: "Crypto" },
];

export function LiquiditySummary() {
  const { userId } = useAuth();
  const [liquidity, setLiquidity] = useState<LiquiditySummary | null>(null);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("accessToken");
    fetch(`/api/users/${userId}/liquidity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setLiquidity)
      .catch(() => setLiquidity(null));
  }, [userId]);

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
          {rows.map((r) => (
            <div key={r.key} className="liquidity-summary-row">
              <span className="liquidity-summary-row-label">{r.label}</span>
              <span className="liquidity-summary-row-amount">${Math.round(r.line.amount).toLocaleString()}</span>
              <span className="liquidity-summary-row-range">
                {formatRange(r.line.minDays, r.line.maxDays)}
                {r.isRealEstate && (
                  <span className="liquidity-summary-row-range-alt">
                    {" "}
                    (full value: {formatRange(realEstate.full.minDays, realEstate.full.maxDays)})
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import "./NetWorthAllocation.css";
import { API_BASE_URL } from "../../config";

type NetWorth = {
  total: number;
  byType: { stocks: number; crypto: number; bonds: number; realEstate: number; mixedAssets: number };
};

const ASSET_CLASSES: { key: keyof NetWorth["byType"]; label: string; color: string }[] = [
  { key: "stocks", label: "Stocks", color: "#4caf50" },
  { key: "crypto", label: "Crypto", color: "#f7931a" },
  { key: "bonds", label: "Bonds", color: "#42a5f5" },
  { key: "realEstate", label: "Real estate", color: "#ab47bc" },
  { key: "mixedAssets", label: "Other", color: "#78909c" },
];

export function NetWorthAllocation() {
  const { userId } = useAuth();
  const [netWorth, setNetWorth] = useState<NetWorth | null>(null);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("accessToken");
    fetch(`${API_BASE_URL}/portfolios/user/${userId}/net-worth`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setNetWorth)
      .catch(() => setNetWorth(null));
  }, [userId]);

  if (!netWorth || netWorth.total <= 0) return null;

  const segments = ASSET_CLASSES
    .map((c) => ({ ...c, value: netWorth.byType[c.key] ?? 0 }))
    .filter((c) => c.value > 0)
    .map((c) => ({ ...c, pct: (c.value / netWorth.total) * 100 }));

  return (
    <section className="section-container">
      <div className="net-worth-allocation">
        <div className="net-worth-allocation-header">
          <span className="net-worth-allocation-label">Net worth</span>
          <span className="net-worth-allocation-total">
            ${Math.round(netWorth.total).toLocaleString()}
          </span>
        </div>

        <div className="net-worth-allocation-bar">
          {segments.map((s) => (
            <div
              key={s.key}
              className="net-worth-allocation-segment"
              style={{ width: `${s.pct}%`, backgroundColor: s.color }}
              title={`${s.label}: ${s.pct.toFixed(1)}%`}
            />
          ))}
        </div>

        <div className="net-worth-allocation-legend">
          {segments.map((s) => (
            <div key={s.key} className="net-worth-allocation-legend-item">
              <span className="net-worth-allocation-swatch" style={{ backgroundColor: s.color }} />
              <span className="net-worth-allocation-legend-label">{s.label}</span>
              <span className="net-worth-allocation-legend-pct">{s.pct.toFixed(1)}%</span>
              <span className="net-worth-allocation-legend-value">
                ${Math.round(s.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

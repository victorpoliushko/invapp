import { useEffect, useState } from "react";
import "./PortfoliosPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";

const TYPE_LABEL: Record<string, string> = {
  CRYPTOCURRENCY: "Crypto",
  Stock: "Stock",
  ETF: "ETF",
  BOND: "Bond",
  MUTUALFUND: "Fund",
  COMMODITY: "Commodity",
  PRECIOUS_METAL: "Metal",
  PRIVATE_EQUITY: "PE",
  CASH: "Cash",
};

function assetTypeLabel(type: string | null | undefined): string {
  if (!type) return "Stock";
  return TYPE_LABEL[type] ?? type;
}

type ReturnPeriod = "all" | "year" | "month";

const RETURN_PERIOD_OPTIONS: { value: ReturnPeriod; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "year", label: "Last year" },
  { value: "month", label: "This month" },
];

function periodStartDate(period: ReturnPeriod): Date | null {
  const now = new Date();
  if (period === "year") return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
}

// Positions held as of the period start, derived from the asset's own BUY/SELL
// transactions dated within the period (there's no historical price snapshot to
// compare against, so "return for the period" means return on what was bought/sold
// during that period, not the return on pre-existing holdings).
function calcPeriodPosition(pa: any, periodStart: Date | null): { quantity: number; avgPrice: number } | null {
  if (!periodStart) {
    if (pa.price == null || pa.price === 0) return null;
    return { quantity: pa.quantity, avgPrice: pa.price };
  }

  let quantity = 0;
  let cost = 0;
  for (const t of pa.transactions ?? []) {
    if (new Date(t.date) < periodStart) continue;
    if (t.type === "BUY") {
      quantity += t.quantityChange;
      cost += t.quantityChange * t.pricePerUnit;
    } else {
      quantity -= t.quantityChange;
      cost -= t.quantityChange * t.pricePerUnit;
    }
  }
  if (quantity <= 0) return null;
  return { quantity, avgPrice: cost / quantity };
}

function calcAssetReturns(portfolioAssets: any[], period: ReturnPeriod = "all") {
  const periodStart = periodStartDate(period);
  const results: { ticker: string; type: string; pct: number; dollarReturn: number }[] = [];

  for (const pa of portfolioAssets) {
    if (pa.asset?.currentPrice == null) continue;
    const position = calcPeriodPosition(pa, periodStart);
    if (!position || position.avgPrice === 0) continue;

    const pct = ((pa.asset.currentPrice - position.avgPrice) / position.avgPrice) * 100;
    const dollarReturn = (pa.asset.currentPrice - position.avgPrice) * position.quantity;
    results.push({ ticker: pa.asset.ticker, type: pa.asset.type, pct, dollarReturn });
  }

  return results;
}

function topPerformers(portfolioAssets: any[]) {
  return calcAssetReturns(portfolioAssets).sort((a, b) => b.pct - a.pct).slice(0, 3);
}

function topLosers(portfolioAssets: any[]) {
  return calcAssetReturns(portfolioAssets).filter((a) => a.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 3);
}

type PortfolioReturns = { pctReturn: number | null; dollarReturn: number | null };

async function fetchPortfolioReturns(portfolioId: string, period: ReturnPeriod): Promise<PortfolioReturns | null> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:5173/api/portfolios/${portfolioId}/returns?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export default function PortfoliosPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { createPortolio, deletePortfolio, refreshUserPortfolios, portfolios } =
    usePortfolio();
  // const [portfolios, setPortfolios] = useState([]);
  const [portfolioName, setPortfolioName] = useState<string>("");
  const [portfolioGoal, setPortfolioGoal] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [returnPeriods, setReturnPeriods] = useState<Record<string, ReturnPeriod>>({});
  const [portfolioReturns, setPortfolioReturns] = useState<Record<string, PortfolioReturns>>({});

  const handleCreate = () => {
    if (portfolioName.trim()) {
      const goal = portfolioGoal !== "" ? parseFloat(portfolioGoal) : undefined;
      createPortolio(portfolioName, userId ?? "", goal);
      setPortfolioName("");
      setPortfolioGoal("");
    }
    setIsCreating(false);
  };

  useEffect(() => {
    refreshUserPortfolios();
  }, [userId, refreshUserPortfolios]);

  useEffect(() => {
    if (!portfolios) return;
    portfolios.forEach((p: any) => {
      const period = returnPeriods[p.id] ?? "all";
      fetchPortfolioReturns(p.id, period).then((data) => {
        if (data) setPortfolioReturns((prev) => ({ ...prev, [p.id]: data }));
      });
    });
  }, [portfolios, returnPeriods]);

  // if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="portfolios-section section-container">
      {portfolios && portfolios.length > 0 &&
        portfolios.map((p: any) => {
          const period = returnPeriods[p.id] ?? "all";
          return (
          <div
            className="portfolio-min portfolio-min--clickable"
            key={p.id}
            onClick={() => navigate(`/portfolios/${p.id}`)}
          >
            <h2>{p.name}</h2>
            <div className="portfolio-min-cols">
                <div className="portfolio-min-col">
                  <div className="portfolio-returns-header">
                    <h4>Returns</h4>
                    <select
                      value={period}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const value = e.target.value as ReturnPeriod;
                        setReturnPeriods((prev) => ({ ...prev, [p.id]: value }));
                      }}
                    >
                      {RETURN_PERIOD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <p>Goal: {p.goal != null ? `${p.goal}%` : "—"}</p>
                  <p>%: {(() => { const r = portfolioReturns[p.id]?.pctReturn; if (r == null) return "—"; return <span style={{ color: r >= 0 ? "#4caf50" : "#e57373" }}>{r >= 0 ? "+" : ""}{r.toFixed(2)}%</span>; })()}</p>
                  <p>$: {(() => { const d = portfolioReturns[p.id]?.dollarReturn; if (d == null) return "—"; return <span style={{ color: d >= 0 ? "#4caf50" : "#e57373" }}>{d >= 0 ? "+" : ""}{Math.round(d).toLocaleString()}$</span>; })()}</p>
                </div>
                <div className="portfolio-min-col">
                  <h4>Top performers</h4>
                  {topPerformers(p.portfolioAssets ?? []).map((a) => (
                    <div key={a.ticker} className="portfolio-performer-row">
                      <span className="portfolio-performer-type">{assetTypeLabel(a.type)}</span>
                      <span className="portfolio-performer-name">{a.ticker}</span>
                      <span className="portfolio-performer-pct" style={{ color: a.pct >= 0 ? "#4caf50" : "#e57373" }}>
                        {a.pct >= 0 ? "+" : ""}{a.pct.toFixed(2)}%
                      </span>
                      <span className="portfolio-performer-dollar" style={{ color: a.dollarReturn >= 0 ? "#4caf50" : "#e57373" }}>
                        {a.dollarReturn >= 0 ? "+" : ""}{Math.round(a.dollarReturn).toLocaleString()}$
                      </span>
                    </div>
                  ))}
                  {topPerformers(p.portfolioAssets ?? []).length === 0 && (
                    <p className="portfolio-performer-empty">No price data yet</p>
                  )}
                </div>
                <div className="portfolio-min-col">
                  <h4>Losers</h4>
                  {topLosers(p.portfolioAssets ?? []).map((a) => (
                    <div key={a.ticker} className="portfolio-performer-row">
                      <span className="portfolio-performer-type">{assetTypeLabel(a.type)}</span>
                      <span className="portfolio-performer-name">{a.ticker}</span>
                      <span className="portfolio-performer-pct" style={{ color: a.pct >= 0 ? "#4caf50" : "#e57373" }}>
                        {a.pct >= 0 ? "+" : ""}{a.pct.toFixed(2)}%
                      </span>
                      <span className="portfolio-performer-dollar" style={{ color: a.dollarReturn >= 0 ? "#4caf50" : "#e57373" }}>
                        {a.dollarReturn >= 0 ? "+" : ""}{Math.round(a.dollarReturn).toLocaleString()}$
                      </span>
                    </div>
                  ))}
                  {topLosers(p.portfolioAssets ?? []).length === 0 && (
                    <p className="portfolio-performer-empty">No price data yet</p>
                  )}
                </div>
                <button
                  className="portfolio-delete-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deletePortfolio(p.id);
                  }}
                >
                  <img src={deleteIcon} height={24} width={24} alt="delete" />
                </button>
              </div>
            </div>
          );
        })
      }

      {isCreating ? (
        <div className="portfolio-min portfolio-min--creating">
          <input
            type="text"
            className="portfolio-create-input"
            placeholder="Portfolio name"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setIsCreating(false);
            }}
            autoFocus
          />
          <input
            type="number"
            className="portfolio-create-input"
            placeholder="Goal % (optional)"
            value={portfolioGoal}
            onChange={(e) => setPortfolioGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setIsCreating(false);
            }}
            min={0}
          />
          <div className="portfolio-create-actions">
            <button className="portfolio-create-confirm" onClick={handleCreate}>Create</button>
            <button className="portfolio-create-cancel" onClick={() => setIsCreating(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="portfolio-min portfolio-min--add" onClick={() => setIsCreating(true)}>
          <span>New portfolio</span>
          <span className="portfolio-min--add-icon">+</span>
        </button>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import "./PortfoliosPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import deleteIcon from "../../assets/crud-icons/delete.svg";
import plusIcon from "../../assets/icons/plus.svg";
import { API_BASE_URL } from "../../config";
import { MaskIcon } from "../../components/MaskIcon";
import { NewPortfolioModal } from "./NewPortfolioModal";

const TYPE_LABEL: Record<string, string> = {
  CRYPTOCURRENCY: "Crypto",
  Stock: "Stock",
  ETF: "ETF",
  BOND: "Bond",
  REAL_ESTATE: "Real estate",
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

function formatMoney(value: number): string {
  return `$${Math.abs(Math.round(value)).toLocaleString()}`;
}

function signedPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function signedMoney(value: number): string {
  return `${value >= 0 ? "+" : "-"}${formatMoney(value)}`;
}

function gainColor(value: number): string {
  return value >= 0 ? "var(--text-success)" : "var(--text-danger)";
}

type PortfolioReturns = { pctReturn: number | null; dollarReturn: number | null };
type Mover = { label: string; type: string; pct: number; dollarReturn: number };
type PortfolioMovers = { topPerformers: Mover[]; topLosers: Mover[] };
type PortfolioNetWorth = { total: number };

async function fetchPortfolioReturns(portfolioId: string, period: ReturnPeriod): Promise<PortfolioReturns | null> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/returns?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchTopMovers(portfolioId: string, period: ReturnPeriod): Promise<PortfolioMovers | null> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/movers?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchPortfolioNetWorth(portfolioId: string): Promise<PortfolioNetWorth | null> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/net-worth`, {
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
  const [isCreating, setIsCreating] = useState(false);
  const [returnPeriods, setReturnPeriods] = useState<Record<string, ReturnPeriod>>({});
  const [portfolioReturns, setPortfolioReturns] = useState<Record<string, PortfolioReturns>>({});
  const [portfolioMovers, setPortfolioMovers] = useState<Record<string, PortfolioMovers>>({});
  const [portfolioNetWorth, setPortfolioNetWorth] = useState<Record<string, PortfolioNetWorth>>({});

  const handleCreate = (name: string, goal: number | undefined) => {
    createPortolio(name, userId ?? "", goal);
    setIsCreating(false);
  };

  useEffect(() => {
    refreshUserPortfolios();
  }, [userId, refreshUserPortfolios]);

  useEffect(() => {
    if (!portfolios) return;
    portfolios.forEach((p) => {
      const period = returnPeriods[p.id] ?? "all";
      fetchPortfolioReturns(p.id, period).then((data) => {
        if (data) setPortfolioReturns((prev) => ({ ...prev, [p.id]: data }));
      });
      fetchTopMovers(p.id, period).then((data) => {
        if (data) setPortfolioMovers((prev) => ({ ...prev, [p.id]: data }));
      });
    });
  }, [portfolios, returnPeriods]);

  useEffect(() => {
    if (!portfolios) return;
    portfolios.forEach((p) => {
      fetchPortfolioNetWorth(p.id).then((data) => {
        if (data) setPortfolioNetWorth((prev) => ({ ...prev, [p.id]: data }));
      });
    });
  }, [portfolios]);

  return (
    <section className="portfolios-section section-container">
      <div className="page-header">
        <h1 className="page-title">Portfolios</h1>
        <button className="btn-pill" onClick={() => setIsCreating(true)}>
          <MaskIcon src={plusIcon} size={14} />
          New
        </button>
      </div>

      <div className="portfolio-list">
        {portfolios && portfolios.length > 0 &&
          portfolios.map((p) => {
            const period = returnPeriods[p.id] ?? "all";
            const returns = portfolioReturns[p.id];
            const movers = portfolioMovers[p.id];
            const performers = movers?.topPerformers ?? [];
            const losers = movers?.topLosers ?? [];
            const netWorth = portfolioNetWorth[p.id]?.total;
            return (
              <article
                className="portfolio-card"
                key={p.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/portfolios/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/portfolios/${p.id}`);
                }}
              >
                <div className="portfolio-card-top">
                  <h2 className="portfolio-card-name">
                    {p.name}
                    {p.goal != null && <span className="portfolio-card-goal">Goal {p.goal}%</span>}
                  </h2>
                  <button
                    className="portfolio-card-delete"
                    aria-label={`Delete ${p.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePortfolio(p.id);
                    }}
                  >
                    <MaskIcon src={deleteIcon} size={20} />
                  </button>
                </div>

                <div className="portfolio-card-header-row">
                  <span className="portfolio-card-total">
                    {netWorth != null ? formatMoney(netWorth) : "—"}
                  </span>
                  {returns?.pctReturn != null && (
                    <span className="portfolio-card-returns">
                      <span className="portfolio-card-returns-pct" style={{ color: gainColor(returns.pctReturn) }}>
                        {signedPct(returns.pctReturn)}
                      </span>
                      {returns.dollarReturn != null && (
                        <span className="portfolio-card-returns-dollar">
                          ({returns.dollarReturn < 0 ? "-" : ""}{formatMoney(returns.dollarReturn)})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <div className="segmented" role="group" aria-label="Return period" onClick={(e) => e.stopPropagation()}>
                  {RETURN_PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className="segmented-tab"
                      aria-pressed={period === opt.value}
                      onClick={() => setReturnPeriods((prev) => ({ ...prev, [p.id]: opt.value }))}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="portfolio-card-movers">
                  <MoverGroup title="Top performers" movers={performers} />
                  <MoverGroup title="Losers" movers={losers} />
                </div>
              </article>
            );
          })}
      </div>

      {isCreating && (
        <NewPortfolioModal onSave={handleCreate} onClose={() => setIsCreating(false)} />
      )}
    </section>
  );
}

function MoverGroup({ title, movers }: { title: string; movers: Mover[] }) {
  return (
    <div className="portfolio-card-movers-group">
      <p className="portfolio-card-movers-title">{title}</p>
      {movers.map((a) => (
        <div key={a.label} className="portfolio-mover">
          <span className="portfolio-mover-meta">
            <span className="portfolio-mover-name">{a.label}</span>
            <span className="portfolio-mover-type">{assetTypeLabel(a.type)}</span>
          </span>
          <span className="portfolio-mover-value">
            <span className="portfolio-mover-pct" style={{ color: gainColor(a.pct) }}>{signedPct(a.pct)}</span>
            <span className="portfolio-mover-dollar">{signedMoney(a.dollarReturn)}</span>
          </span>
        </div>
      ))}
      {movers.length === 0 && <p className="portfolio-mover-empty">No price data yet</p>}
    </div>
  );
}

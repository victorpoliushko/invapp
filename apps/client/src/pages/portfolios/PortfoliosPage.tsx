import { useEffect, useMemo, useState } from "react";
import "./PortfoliosPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import editIcon from "../../assets/icons/edit.svg";
import plusIcon from "../../assets/icons/plus.svg";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { Mover, portfolioReturns, ReturnPeriod, topMovers } from "../../finance/returns";
import { netWorthByType, totalNetWorth } from "../../finance/valuation";
import { MaskIcon } from "../../components/MaskIcon";
import { NewPortfolioModal } from "./NewPortfolioModal";
import { formatCurrency, gainColor, signedCurrency, signedPct } from "../../utils/money";
import { Currency, useCurrency } from "../../context/CurrencyContext";
import { CurrencySelect } from "../../components/CurrencySelect";
import { EditPortfolioModal } from "./EditPortfolioModal";

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
  MIXED_ASSET: "Other",
  MIXED_ASSETS: "Other",
};

function assetTypeLabel(type: string | null | undefined): string {
  if (!type) return "Stock";
  return TYPE_LABEL[type] ?? type;
}

const RETURN_PERIOD_OPTIONS: { value: ReturnPeriod; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "year", label: "Last year" },
  { value: "month", label: "This month" },
];

export default function PortfoliosPage() {
  const { defaultCurrency, fromUsd, toUsd } = useCurrency();
  const fetchWithRedirect = useFetchWithRedirect();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { createPortolio, deletePortfolio, refreshUserPortfolios, portfolios } =
    usePortfolio();
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [returnPeriods, setReturnPeriods] = useState<Record<string, ReturnPeriod>>({});

  const handleCreate = (name: string, goal: number | undefined) => {
    createPortolio(name, userId ?? "", goal);
    setIsCreating(false);
  };

  const renamePortfolio = async (portfolioId: string, name: string) => {
    const res = await fetchWithRedirect(`/portfolios/${portfolioId}`, {
      method: "PATCH",
      body: JSON.stringify({ id: portfolioId, name }),
    });
    if (!res.ok) throw new Error("Failed to rename portfolio");
    await refreshUserPortfolios();
  };

  const handleCurrencyChange = async (portfolioId: string, currency: Currency) => {
    const res = await fetchWithRedirect(`/portfolios/${portfolioId}`, {
      method: "PATCH",
      body: JSON.stringify({ id: portfolioId, displayCurrency: currency }),
    });
    if (!res.ok) {
      alert("Failed to save currency");
      return;
    }
    await refreshUserPortfolios();
  };

  useEffect(() => {
    refreshUserPortfolios();
  }, [userId, refreshUserPortfolios]);

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        (portfolios ?? []).map((p) => {
          const period = returnPeriods[p.id] ?? "all";
          return [
            p.id,
            {
              netWorth: totalNetWorth(netWorthByType(p, toUsd)),
              returns: portfolioReturns(p, period, toUsd),
              movers: topMovers(p, period, toUsd),
            },
          ];
        }),
      ),
    [portfolios, returnPeriods, toUsd],
  );

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
            const summary = summaries[p.id];
            const returns = summary?.returns;
            const performers = summary?.movers.topPerformers ?? [];
            const losers = summary?.movers.topLosers ?? [];
            const netWorth = summary?.netWorth;
            const currency = p.displayCurrency ?? defaultCurrency;
            const money = (usd: number) => formatCurrency(fromUsd(usd, currency), currency);
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
                  <div className="portfolio-card-actions" onClick={(e) => e.stopPropagation()}>
                    <CurrencySelect value={currency} onChange={(c) => handleCurrencyChange(p.id, c)} />
                    <button
                      className="portfolio-card-delete"
                      aria-label={`Edit ${p.name}`}
                      onClick={() => setEditing({ id: p.id, name: p.name })}
                    >
                      <MaskIcon src={editIcon} size={20} />
                    </button>
                  </div>
                </div>

                <div className="portfolio-card-header-row">
                  <span className="portfolio-card-total">
                    {netWorth != null ? money(netWorth) : "—"}
                  </span>
                  {returns?.pctReturn != null && (
                    <span className="portfolio-card-returns">
                      <span className="portfolio-card-returns-pct" style={{ color: gainColor(returns.pctReturn) }}>
                        {signedPct(returns.pctReturn)}
                      </span>
                      {returns.dollarReturn != null && (
                        <span className="portfolio-card-returns-dollar">
                          ({money(returns.dollarReturn)})
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
                  <MoverGroup title="Top performers" movers={performers} currency={currency} />
                  <MoverGroup title="Losers" movers={losers} currency={currency} />
                </div>
              </article>
            );
          })}
      </div>

      {editing && (
        <EditPortfolioModal
          name={editing.name}
          onSave={(name) => renamePortfolio(editing.id, name)}
          onDelete={() => deletePortfolio(editing.id)}
          onClose={() => setEditing(null)}
        />
      )}

      {isCreating && (
        <NewPortfolioModal onSave={handleCreate} onClose={() => setIsCreating(false)} />
      )}
    </section>
  );
}

function MoverGroup({ title, movers, currency }: { title: string; movers: Mover[]; currency: string }) {
  const { fromUsd } = useCurrency();
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
            <span className="portfolio-mover-dollar">{signedCurrency(fromUsd(a.dollarReturn, currency), currency)}</span>
          </span>
        </div>
      ))}
      {movers.length === 0 && <p className="portfolio-mover-empty">No price data yet</p>}
    </div>
  );
}

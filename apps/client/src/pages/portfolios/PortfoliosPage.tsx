import { useEffect, useState } from "react";
import "./PortfoliosPage.css";
import { Link, useParams } from "react-router-dom";
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

function topPerformers(portfolioAssets: any[]) {
  return portfolioAssets
    .filter((pa) => pa.asset?.currentPrice != null && pa.price != null && pa.price !== 0)
    .map((pa) => {
      const pct = ((pa.asset.currentPrice - pa.price) / pa.price) * 100;
      const dollarReturn = (pa.asset.currentPrice - pa.price) * pa.quantity;
      return { ticker: pa.asset.ticker, type: pa.asset.type, pct, dollarReturn };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);
}

export default function PortfoliosPage() {
  const { userId } = useParams();
  const { createPortolio, deletePortfolio, refreshUserPortfolios, portfolios } =
    usePortfolio();
  // const [portfolios, setPortfolios] = useState([]);
  const [portfolioName, setPortfolioName] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = () => {
    if (portfolioName.trim()) {
      createPortolio(portfolioName, userId ?? "");
      setPortfolioName("");
    }
    setIsCreating(false);
  };

    console.log(`
   portfolios 1: ${JSON.stringify(portfolios)} 
  `);


  useEffect(() => {
    refreshUserPortfolios();
  }, [userId, refreshUserPortfolios]);

  console.log(`
   portfolios 2: ${JSON.stringify(portfolios)} 
  `);

  // if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="portfolios-section section-container">
      {portfolios && portfolios.length > 0 &&
        portfolios.map((p: any) => (
          <Link to={{ pathname: `/portfolios/${p.id}` }} key={p.id}>
            <div className="portfolio-min">
              <h2>{p.name}</h2>
              <div className="portfolio-min-cols">
                <div className="portfolio-min-col">
                  <h4>Returns</h4>
                  <p>Goal: {p.goal}%</p>
                  <p>Actual: {p.actual}%</p>
                  <p>$: {p.value}</p>
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
          </Link>
        ))
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

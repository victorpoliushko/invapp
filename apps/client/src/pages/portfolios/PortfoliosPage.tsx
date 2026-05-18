import { useEffect, useState } from "react";
import "./PortfoliosPage.css";
import { Link, useParams } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";

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
                </div>
                <div className="portfolio-min-col">
                  <h4>Losers</h4>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deletePortfolio(p.id);
                  }}
                ></button>
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

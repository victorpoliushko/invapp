import { useContext, useEffect, useState } from "react";
import "./PortfoliosPage.css";
import { Link, useParams } from "react-router-dom";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { usePortfolio } from "../../context/PortfolioContext";

export default function PortfoliosPage() {
  const { userId } = useParams();
  const { createPortolio, deletePortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();

  const [portfolios, setPortfolios] = useState([]);
  const [portfolioName, setPortfolioName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const fetchPortfolios = async () => {
      try {
        const response = await fetchWithRedirect(
          `http://localhost:5173/api/portfolios/user/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setPortfolios(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolios();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="portfolios-section section-container">
      <div className="test">Create portfolio</div>
      <input
            type="text"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createPortolio(portfolioName, userId ?? '')}
            className="assets-h1-input"
            autoFocus
          />
          <button onClick={() => createPortolio(portfolioName, userId ?? '')}>Save</button>
      {portfolios.map((p: any) => (
        <Link to={{ pathname: `/portfolios/${p.id}` }} key={1}>
          <div key={p.id} className="portfolio-min">
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
                {/* map over top performers here */}
              </div>
              <div className="portfolio-min-col">
                <h4>Losers</h4>
                {/* map over losers here */}
              </div>
               <button onClick={() => deletePortfolio(p.id)}>Delete</button>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}

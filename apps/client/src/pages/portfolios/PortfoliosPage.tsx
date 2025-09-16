import { useEffect, useState } from "react";
import "./PortfoliosPage.css";

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
      const token = localStorage.getItem("accessToken");

    const fetchPortfolios = async () => {
      try {
        const response = await fetch(
          `http://localhost:5173/api/portfolios/user/${storedUserId}`,
          {
            method: "GET",
            headers: {
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
      {portfolios.map((p: any) => (
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
          </div>
        </div>
      ))}
    </section>
  );
}

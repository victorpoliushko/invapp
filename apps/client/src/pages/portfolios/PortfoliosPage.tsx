import { useEffect, useState } from "react";
import "./PortfoliosPage.css";


export default function PortfoliosPage() {
  // const portfolios = [1, 2, 3, 4, 5];

  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    console.log('storedUserId :', storedUserId)

    const fetchPortfolios = async () => {
      try {
      const response = await fetch(`http://localhost:5173/api/portfolios/user/${storedUserId}`, {
        method: "GET",
        credentials: "include",
      });  

        console.log('DATA: ', response)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
      {/* <div className='portfolios'>
        {portfolios.map(p => (
          <Link key={p} to={`/portfolios/${p}`}>
            Portfolio {p}
          </Link>
        ))}
      </div> */}
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

      <div className="portfolio-min">
        <h2>Retirement</h2>
        <div className="portfolio-min-cols">
          <div className="portfolio-min-col">
            <h4>Returns</h4>
            <p>Goal: 6%</p>
            <p>Actual: 11.2%</p>
            <p>$: 10000</p>
          </div>
          <div className="portfolio-min-col">
            <h4>Top performers</h4>
            <p>VOO 13% +$7605</p>
            <p>NEAR 10% +$800</p>
            <p>GOOG 8% +$600</p>
          </div>
          <div className="portfolio-min-col">
            <h4>Losers</h4>
            <p>ADA -2% +$50</p>
            <p>PLTR 4% +$50</p>
            <p>SCHD 1$ +15%</p>
          </div>
        </div>
      </div>

      <div className="portfolio-min">
        <h2>Gain</h2>
        <div className="portfolio-min-cols">
          <div className="portfolio-min-col">
            <h4>Returns</h4>
            <p>Goal: 6%</p>
            <p>Actual: 11.2%</p>
            <p>$: 10000</p>
          </div>
          <div className="portfolio-min-col">
            <h4>Top performers</h4>
            <p>VOO 13% +$7605</p>
            <p>NEAR 10% +$800</p>
            <p>GOOG 8% +$600</p>
          </div>
          <div className="portfolio-min-col">
            <h4>Losers</h4>
            <p>ADA -2% +$50</p>
            <p>PLTR 4% +$50</p>
            <p>SCHD 1$ +15%</p>
          </div>
        </div>
      </div>

       <div className="portfolio-min">
        <h2>Gain</h2>
        <div className="portfolio-min-cols">
          <div className="portfolio-min-col">
            <h4>Returns</h4>
            <p>Goal: 6%</p>
            <p>Actual: 11.2%</p>
            <p>$: 10000</p>
          </div>
          <div className="portfolio-min-col">
            <h4>Top performers</h4>
            <p>VOO 13% +$7605</p>
            <p>NEAR 10% +$800</p>
            <p>GOOG 8% +$600</p>
          </div>
          <div className="portfolio-min-col">
            <h4>Losers</h4>
            <p>ADA -2% +$50</p>
            <p>PLTR 4% +$50</p>
            <p>SCHD 1$ +15%</p>
          </div>
        </div>
      </div>

       <div className="portfolio-min">
        <h2>Gain</h2>
        <div className="portfolio-min-cols">
          <div className="portfolio-min-col">
            <h4>Returns</h4>
            <p>Goal: 6%</p>
            <p>Actual: 11.2%</p>
            <p>$: 10000</p>
          </div>
          <div className="portfolio-min-col">
            <h4>Top performers</h4>
            <p>VOO 13% +$7605</p>
            <p>NEAR 10% +$800</p>
            <p>GOOG 8% +$600</p>
          </div>
          <div className="portfolio-min-col">
            <h4>Losers</h4>
            <p>ADA -2% +$50</p>
            <p>PLTR 4% +$50</p>
            <p>SCHD 1$ +15%</p>
          </div>
        </div>
      </div>
    </section>
  );
}

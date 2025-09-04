import "./PortfoliosPage.css";

export default function PortfoliosPage() {
  const portfolios = [1, 2, 3, 4, 5];

  return (
    <section className="portfolios-section section-container">
      {/* <div className='portfolios'>
        {portfolios.map(p => (
          <Link key={p} to={`/portfolios/${p}`}>
            Portfolio {p}
          </Link>
        ))}
      </div> */}
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

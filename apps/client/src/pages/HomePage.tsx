import "../App.css";
import { LocationPicker } from "../components/LocationPicker";

export const HomePage = () => {
  return (
    <>
      <section className="section-container section-flex-container intro-section-1">
        <h1 className="intro-section-1-h1">
          Application to track your investments from multiple sources
        </h1>
        <p className="intro-section-1-p">
          Application to track your investments from multiple sources. Stay in
          control with a single dashboard that consolidates all your assets —
          from stocks and crypto to real estate. The app is designed to be
          simple yet powerful, offering AI-powered suggestions, curated
          portfolios you can follow, and return predictions to help you make
          informed financial decisions with confidence.
        </p>
      </section>
      <section className="section-container section-flex-container try-section-1">
        <button className="try-section-1-btn">Give it a try. It's free!</button>
        <img
          src="/invapp-preview.png"
          height={500}
          width={800}
          alt="placeholder"
        />
      </section>
      <section className="section-container section-flex-container pros-section-1">
        <h1 className="pros-section-1-h1">A single tool to track your gains</h1>
        <div className="pros-section-cols">
          <div className="pros-section-div">
            <h3>Stocks & Crypto</h3>
            <p>
              Track your stock and cryptocurrency positions in one place. See
              average buy price, current price, % change, and total return for
              every asset — updated in real time.
            </p>
          </div>
          <div className="pros-section-div">
            <h3>Real Estate</h3>
            <p>
              Log rental properties by code and record occupation periods with
              monthly rent. The app calculates occupancy rate, annual net income,
              and total rental return automatically.
            </p>
          </div>
          <div className="pros-section-div">
            <h3>One Dashboard</h3>
            <p>
              All your assets - equities, crypto, and real estate - live in a
              single portfolio. Add BUY or SELL transactions, review history
              inline, and see your total position sorted by size at a glance.
            </p>
          </div>
        </div>
      </section>
      <section className="section-container advanced-section">
        <h1>Advanced techniques</h1>
        <div className="advanced-level-1">
          <h1>Track across asset classes</h1>
          <p>
            Most tools force you to choose — stocks or crypto or real estate.
            This app holds all three in one portfolio so you can see your true
            net position at a glance, compare returns across classes, and stop
            juggling spreadsheets.
          </p>
        </div>
        <div className="advanced-level-2">
          <div className="advanced-level-2-left">
            <h1>Know your real return</h1>
            <p>
              Average purchase price, current price, % change, and total return
              are calculated automatically from your transaction history. Add a
              buy or sell and the numbers update instantly — no manual formulas
              needed.
            </p>
          </div>
          <div className="advanced-level-2-right">
            <h1>Rental income, calculated</h1>
            <p>
              Log occupation periods for each property and the app computes
              occupancy rate, annual net income, and total rental return. Gaps
              between tenants are counted against occupancy automatically.
            </p>
          </div>
        </div>
        <div className="advanced-level-3">
          <div className="advanced-level-3-left">
            <h1>Live market prices</h1>
            <p>
              Stock prices are fetched from Alpha Vantage and cached hourly.
              Crypto prices come from CoinGecko. Your portfolio value stays
              current without any manual refresh.
            </p>
          </div>
          <div className="advanced-level-3-center">
            <h1>Bond coupon income</h1>
            <p>
              Add bonds with face value, coupon rate, and frequency. Annual
              income and total position are computed on the fly so you always
              know what your fixed-income holdings contribute to your portfolio.
            </p>
          </div>
          <div className="advanced-level-3-right">
            <h1>Sorted by size by default</h1>
            <p>
              Assets are ranked by total position so your largest holdings
              always appear first. Spot concentration risk immediately and
              focus your attention where it matters most.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

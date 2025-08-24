import "../../App.css";

export const MainPage = () => {
  return (
    <>
      <section className="news-section section-container section-flex-container">
        <h1>News</h1>
        <div className="news-div">
          <div className="news-item">
            <h3>
              VOO Continues Strong Performance Amid S&P 500 Records The Vanguard
              S&P 500 ETF (VOO) continues to show robust performance, reaching
              new highs in tandem with the broader S&P 500 Index. The fund's
              year-to-date returns have been strong, mirroring the impressive
              run in the U.S. stock market.
            </h3>
          </div>
          <div className="news-item">
            <h3>
              Ethereum Continues to Gain Institutional Traction The Ethereum
              network and its native cryptocurrency, Ether (ETH), have been at
              the center of growing institutional interest, particularly with
              the recent launch of spot Ethereum ETFs in the U.S. These new
              investment products have attracted billions in inflows, signaling
              Wall Street's increasing appetite for the asset.
            </h3>
          </div>
        </div>
      </section>

      <section className="stocks-section section-container">
        <h1>Stocks</h1>
        <div className="stocks-wrapper">
        <div className="stocks-div flex-container">
          <div className="stock-item">
            <span>VOO</span>
            <span>500</span>
            <span>+3%</span>
          </div>
          <div className="stock-item">
            <span>SPY</span>
            <span>300</span>
            <span>+5%</span>
          </div>
          <div className="stock-item">
            <span>SCHD</span>
            <span>50</span>
            <span>-2%</span>
          </div>
        </div>

        <div className="stocks-div flex-container">
          <div className="stock-item">
            <span>VOO</span>
            <span>500</span>
            <span>+3%</span>
          </div>
          <div className="stock-item">
            <span>SPY</span>
            <span>300</span>
            <span>+5%</span>
          </div>
          <div className="stock-item">
            <span>SCHD</span>
            <span>50</span>
            <span>-2%</span>
          </div>
        </div>

        <div className="stocks-div flex-container">
          <div className="stock-item">
            <span>VOO</span>
            <span>500</span>
            <span>+3%</span>
          </div>
          <div className="stock-item">
            <span>SPY</span>
            <span>300</span>
            <span>+5%</span>
          </div>
          <div className="stock-item">
            <span>SCHD</span>
            <span>50</span>
            <span>-2%</span>
          </div>
        </div>
        </div>

      </section>

      <section className="section-container section-flex-container try-section-1">
        <button className="try-section-1-btn">Give it a try. It's free!</button>
        <img
          src="/invapp-placeholder.png"
          height={500}
          width={800}
          alt="placeholder"
        />
      </section>
      <section className="section-container section-flex-container pros-section-1">
        <h1 className="pros-section-1-h1">A single tool to track your gains</h1>
        <div className="pros-section-cols">
          <div className="pros-section-div">
            <h3>Easy to use</h3>
            <p>
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
              ipsum Lorem ipsum{" "}
            </p>
          </div>
          <div className="pros-section-div">
            <h3>Easy to use</h3>
            <p>
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
              ipsum Lorem ipsum{" "}
            </p>
          </div>
          <div className="pros-section-div">
            <h3>Easy to use</h3>
            <p>
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
              ipsum Lorem ipsum{" "}
            </p>
          </div>
        </div>
      </section>
      <section className="section-container advanced-section">
        <h1>Advanced techniques</h1>
        <div className="advanced-level-1">
          <h1>Some real info</h1>
          <p>
            A lot of good stuff we were working on for years A lot of good stuff
            we were working on for years A lot of good stuff we were working on
            for years A lot of good stuff we were working on for years A lot of
            good stuff we were working on for years
          </p>
        </div>
        <div className="advanced-level-2">
          <div className="advanced-level-2-left">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
          <div className="advanced-level-2-right">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
        </div>
        <div className="advanced-level-3">
          <div className="advanced-level-3-left">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
          <div className="advanced-level-3-center">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
          <div className="advanced-level-3-right">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

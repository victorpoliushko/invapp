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

      <section className="realestate-section section-container section-flex-container">
        <h1>Real estate</h1>
        <div className="realestate-city">
          <div className="realestate-city-cols">
          <div className="realestate-city-col">
            <div className="realestate-city-item">
              <div className="realestate-city-item-top">
                <p>Lviv, Yaneva 23 50</p>
              </div>
              <div className="realestate-city-item-bottom">
                <p>1 bedroom</p>
                <p>$75k</p>
              </div>
            </div>
            <div className="realestate-city-item">
              <div className="realestate-city-item-top">
                <p>Lviv, Yaneva 23 50</p>
              </div>
              <div className="realestate-city-item-bottom">
                <p>1 bedroom</p>
                <p>$75k</p>
              </div>
            </div>
          </div>
          <div className="realestate-city-col">
            <div className="realestate-city-item">
              <div className="realestate-city-item-top">
                <p>Lviv, Yaneva 23 50</p>
              </div>
              <div className="realestate-city-item-bottom">
                <p>1 bedroom</p>
                <p>$75k</p>
              </div>
            </div>
            <div className="realestate-city-item">
              <div className="realestate-city-item-top">
                <p>Lviv, Yaneva 23 50</p>
              </div>
              <div className="realestate-city-item-bottom">
                <p>1 bedroom</p>
                <p>$75k</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>
    </>
  );
};

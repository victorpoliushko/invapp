import "../../App.css";
import { LocationPicker } from "../../components/LocationPicker";
import MarketTicker from "../../components/marketData";
import MarketNews from "../../components/marketNews";
import { PropertyCard } from "../../components/PropertyCard";

const SAMPLE_PROPERTIES = [
  {
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    ],
    address: "Lviv, Lychakivska 14, apt. 22",
    type: "Apartment",
    price: "$85,000",
    bedrooms: 2,
    area: "58 m²",
    description: "Bright 2-bedroom apartment in the historic centre. Renovated kitchen, hardwood floors, 5 min walk to the market square.",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
    ],
    address: "Lviv, Horodotska 81, apt. 5",
    type: "Apartment",
    price: "$62,000",
    bedrooms: 1,
    area: "38 m²",
    description: "Cosy studio near the IT cluster. Modern finishes, separate sleeping area, 10 min by tram to the city centre.",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
    ],
    address: "Lviv, Franka 9, apt. 3",
    type: "Apartment",
    price: "$110,000",
    bedrooms: 3,
    area: "82 m²",
    description: "Spacious 3-bedroom on the 4th floor with a view of Franko Park. Recently renovated, two bathrooms, secure parking.",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
    ],
    address: "Lviv, Sykhivska 31",
    type: "House",
    price: "$175,000",
    bedrooms: 4,
    area: "140 m²",
    description: "Detached house in a quiet residential area. Private garden, garage for two cars, solar panels installed.",
  },
];

export const MainPage = () => {
  return (
    <>
      <div className="">{/* <MarketHeatmap /> */}</div>

      <section className="stocks-section section-container">
        <h1>Market data</h1>
        <MarketTicker />
        {/* <h1>Stocks</h1>
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
        </div> */}
      </section>
      <section className="news-section section-container section-flex-container">
        {/* <h1>News</h1> */}
        <MarketNews />
        {/* <div className="news-div">
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
        </div> */}
      </section>

      <section className="realestate-section section-container">
        <h1>Real estate</h1>
        <LocationPicker />
        <div className="realestate-grid">
          {SAMPLE_PROPERTIES.map((p, i) => (
            <PropertyCard key={i} {...p} />
          ))}
        </div>
      </section>
    </>
  );
};

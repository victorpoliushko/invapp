import { useEffect, useState } from "react";
import "./App.css";
import { Header } from "./components/header/header";
import { AssetsDashboard } from "./components/assetsDashboard/AssetsDashboard";

import assetLogo from "./assets/apple_logo.png"
import assetLogoTwo from "./assets/vanguard-logo-wide.png"


const mockAsset = {
  assetType: "STOCK",
  assetLogo: assetLogo,
  name: "Apple",
  ticker: "AAPL",
  description: "Nice company, good phones",
  price: "$320",
  percents: "+2.5%"
}

const mockAssetTwo = {
  assetType: "ETF",
  assetLogo: assetLogoTwo,
  name: "S&P 500",
  ticker: "VOO",
  description: "Nice ETF",
  price: "$420",
  percents: "+1.2%"
}

function App() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetch("/api")
      .then((res) => res.text())
      .then(setGreeting);
  }, []);

  return (
    <>
    <Header />
      <div className="container">
          <AssetsDashboard asset={mockAsset} />
          <AssetsDashboard asset={mockAssetTwo} />
      </div>
    </>
  );
}

export default App;

import { useEffect, useState } from "react";
import "./App.css";
import { Header } from "./components/header/header";
import { AssetsDashboard } from "./components/assetsDashboard/AssetsDashboard";

import assetLogo from "./assets/apple_logo.png"

const mockAsset = {
  assetType: "STOCK",
  assetLogo: assetLogo,
  name: "Apple",
  ticker: "AAPL",
  description: "Nice company, good phones",
  price: "$320",
  percents: "+2.5%"
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
      </div>
    </>
  );
}

export default App;

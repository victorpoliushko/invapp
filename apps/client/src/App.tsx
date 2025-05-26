import "./App.css";
import { Header } from "./components/header/header";
import { AssetsDashboard } from "./components/assetsDashboard/AssetsDashboard";

import assetLogo from "./assets/apple_logo.png";
import assetLogoTwo from "./assets/vanguard-logo-wide.png";
import RealEstate from "./components/realEstate/RealEstate";

const mockAsset = {
  assetType: "STOCK",
  assetLogo: assetLogo,
  name: "Apple",
  ticker: "AAPL",
  description: "Nice company, good phones",
  price: "$320",
  percents: "+2.5%",
};

const mockAssetTwo = {
  assetType: "ETF",
  assetLogo: assetLogoTwo,
  name: "S&P 500",
  ticker: "VOO",
  description: "Nice ETF",
  price: "$420",
  percents: "+1.2%",
};

function App() {
  const handeGoogleLogin = () => {
    window.location.href = "http://localhost:5173/api/auth-v2/google/login";
  };

  return (
    <>
      <div className="">
        <button onClick={handeGoogleLogin}>Login with Google</button>
      </div>
      <Header />
      <div className="container">
        <AssetsDashboard asset={mockAsset} />
        <AssetsDashboard asset={mockAssetTwo} />
        <div className="real-estate">
          <RealEstate
            title="One bedroom flat, Lviv, Dodik str."
            imageSrc="../src/assets/house1.jpeg"
            info="New house with some stuff"
            price="$65000"
          />
          <RealEstate
            title="Two bedroom flat, Kyiv, Bobik str."
            imageSrc="../src/assets/house2.jpeg"
            info="Used house with some stuf"
            price="$95000"
          />
          <RealEstate
            title="Three bedroom flat, Rivne, Boobik str."
            imageSrc="../src/assets/house3.jpeg"
            info="New house with some stuff"
            price=">$235000"
          />
          <RealEstate
            title="No bedroom house, Odesa, Valik str."
            imageSrc="../src/assets/house1.jpeg"
            info="No stuff, just walls"
            price="$15000"
          />
        </div>
      </div>
    </>
  );
}

export default App;

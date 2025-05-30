import { Asset } from "./components/Asset/Asset";
import assetLogo from "../../assets/apple_logo.png";
import assetLogoTwo from "../../assets/vanguard-logo-wide.png";

const mockAssets = [
  {
    assetType: "STOCK",
    assetLogo: assetLogo,
    name: "Apple",
    ticker: "AAPL",
    description: "Nice company, good phones",
    price: "$320",
    percents: "+2.5%",
  },
  {
    assetType: "ETF",
    assetLogo: assetLogoTwo,
    name: "S&P 500",
    ticker: "VOO",
    description: "Nice ETF",
    price: "$420",
    percents: "+1.2%",
  },
  {
    assetType: "Crypto",
    name: "Cardano",
    ticker: "ADA",
    description: "Decent crypto",
    price: "$20",
    percents: "+11.2%",
  },
];

export function AssetsDashboard() {
  const assets = mockAssets.map((asset) => <Asset props={asset} />);

  return (
    <div className="stocks">
      <div className="dashboard-header">
        <h1>Investment Dashboard</h1>
      </div>
      {assets}
    </div>
  );
}

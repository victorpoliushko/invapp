import { AssetsDashboard } from "../assetsDashboard/AssetsDashboard";
import assetLogo from "../../assets/apple_logo.png";
import assetLogoTwo from "../../assets/vanguard-logo-wide.png";

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

export function Stocks() {
  return (
    <div className="stocks">
      <AssetsDashboard asset={mockAsset} />
      <AssetsDashboard asset={mockAssetTwo} />
    </div>
  );
}

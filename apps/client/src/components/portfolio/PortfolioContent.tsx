import { usePortfolio } from "../../context/PortfolioContext";
import { AssetTable } from "./AssetTable";
import "../../pages/portfolio/PortfolioPage.css";

export function PortfolioContent() {
  const { portfolio } = usePortfolio();
  if (!portfolio) return <div>Loading...</div>;

  return (
    <section className="assets-section">
      <h1>{portfolio.name}</h1>
      <div className="tab">
        <AssetTable assets={portfolio.portfolioAssets} />
      </div>
    </section>
  );
}

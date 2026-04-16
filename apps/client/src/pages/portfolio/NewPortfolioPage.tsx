import { PortfolioProvider, usePortfolio } from "../../context/PortfolioContext";
import { AssetTable } from "../../components/portfolio/AssetTable";

export default function PortfolioPage() {
  return (
    <PortfolioProvider>
      <PortfolioContent />
    </PortfolioProvider>
  );
}

export function PortfolioContent() {
  const { portfolio } = usePortfolio();
  if (!portfolio) return <div>Loading...</div>;

  return (
    <section className="assets-section">
      <h1>{portfolio.name}</h1>
      {/* Tab Radio Inputs here */}
      <div className="tab">
        <AssetTable assets={portfolio.portfolioAssets} />
      </div>
    </section>
  );
}


import { useParams } from "react-router-dom"
import { AssetsDashboard } from "./assetsDashboard/AssetsDashboard";
import RealEstate from "./realEstate/RealEstate";

export default function PortfolioPage() {
  const params = useParams<{ portfolioId: string }>();
  return (
    <section className="section-container ">
      <div className="">Portfolio page {params.portfolioId}</div>
      <div className="container">
          <AssetsDashboard />
          <RealEstate />
        </div>
    </section>
  )
}

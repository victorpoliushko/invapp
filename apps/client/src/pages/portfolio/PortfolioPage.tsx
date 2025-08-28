import { useParams } from "react-router-dom"
import { AssetsDashboard } from "../assetsDashboard/AssetsDashboard";
import RealEstate from "../realEstate/RealEstate";

export default function PortfolioPage() {
  const params = useParams<{ portfolioId: string }>();
  return (
    <section className="assets-section section-container ">
      <div className="assets">
        
      </div>
          {/* <AssetsDashboard /> */}
          {/* <RealEstate /> */}
    </section>
  )
}

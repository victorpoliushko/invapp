import "./AssetsDashboard.css";
import assetLogo from "../../assets/apple_logo.png"
import vanguardLogo from "../../assets/vanguard-logo-wide.png"

export function AssetsDashboard() {
  return (
    <div className="">
      <div className="dashboard-header">
        <h1>Investment Dashboard</h1>
      </div>
      <div className="dashboard-assets-cards">
        <div className="asset-card">
          <h3>STOCKS</h3>
          <div className="asset-card-internal">
            <div className="asset-card-internal-left">
              <img src={assetLogo} alt="asset logo" />
            </div>
            <div className="asset-card-internal-right">
              <h2>Apple - AAPL</h2>
              <h3>Some DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSomeSome DescriptionSome DescriptionSomeSome DescriptionSome DescriptionSomeSome DescriptionSome DescriptionSomeSome DescriptionSome DescriptionSomeSome DescriptionSome DescriptionSomeSome DescriptionSome DescriptionSome</h3>
              <p>$340</p>
              <p>+3.2%</p>
            </div>
          </div>
          <div className="asset-card-internal">
            <div className="asset-card-internal-left">
              <img src={vanguardLogo} alt="asset logo" />
            </div>
            <div className="asset-card-internal-right">
              <h2>S&P 500 - VOO</h2>
              <h3>Some DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome Description</h3>
              <p>$500</p>
              <p>+1.5%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

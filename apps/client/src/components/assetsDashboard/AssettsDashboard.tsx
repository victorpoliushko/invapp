import "./AssetsDashboard.css";
import assetLogo from "../../assets/apple_logo.png"

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
              <div className="asset-name">
                <h2>Apple AAPL</h2>
              </div>
              <div className="asset-price">
                <p>$340</p>
                <p>+3.2%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

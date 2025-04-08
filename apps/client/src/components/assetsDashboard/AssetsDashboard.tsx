import "./AssetsDashboard.css";
import assetLogo from "../../assets/apple_logo.png"
import vanguardLogo from "../../assets/vanguard-logo-wide.png"

// export function AssetsDashboard({ assetType, name, ticker, description, price, percents }) {
  export function AssetsDashboard({ asset }: { asset: any }) {


  
  return (
    <div className="">
      <div className="dashboard-header">
        <h1>Investment Dashboard</h1>
      </div>
      <div className="dashboard-assets-cards">
        <div className="asset-card">
          <h3>{asset.assetType}</h3>
          <div className="asset-card-internal">
            <div className="asset-card-internal-left">
              <img src={asset.assetLogo} alt="asset logo" />
            </div>
            <div className="asset-card-internal-right">
              <h2>{asset.name} - {asset.ticker}</h2>
              <h3>{asset.description}</h3>
              <p>{asset.price}</p>
              <p>{asset.percents}</p>
            </div>
          </div>
          {/* <div className="asset-card-internal">
            <div className="asset-card-internal-left">
              <img src={vanguardLogo} alt="asset logo" />
            </div>
            <div className="asset-card-internal-right">
              <h2>S&P 500 - VOO</h2>
              <h3>Some DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome DescriptionSome Description</h3>
              <p>$500</p>
              <p>+1.5%</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

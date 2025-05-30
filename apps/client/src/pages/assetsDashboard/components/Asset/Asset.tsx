import "./Asset.css";

interface AssetProps {
  assetType: string;
  name: string;
  ticker: string;
  assetLogo?: string;
  description: string;
  price: string;
  percents: string;
}

export function Asset({ props }: { props: AssetProps}) {
  return (
    <div className="">
      <div className="dashboard-assets-cards">
        <div className="asset-card">
          <h3>{props.assetType}</h3>
          <div className="asset-card-internal">
            <div className="asset-card-internal-left">
              <img src={props.assetLogo} alt="asset logo" />
            </div>
            <div className="asset-card-internal-right">
              <h2>
                {props.name} - {props.ticker}
              </h2>
              <h3>{props.description}</h3>
              <p>{props.price}</p>
              <p>{props.percents}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

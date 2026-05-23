import { Fragment, useState } from "react";
import { AssetRow } from "./AssetRow";
import { AssetTransactions } from "./AssetTransactions";
import "../../pages/portfolio/PortfolioPage.css";
import { PortfolioDto } from "../../../../api/src/portfolios/dto/portfolio.dto";
import { AddAsset } from "./AddAsset";

export const AssetTable = ({
  portfolio,
  assetType = "stock",
}: {
  portfolio: PortfolioDto;
  assetType?: "stock" | "crypto";
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const portfolioAssets = portfolio.portfolioAssets.filter((pa) =>
    assetType === "crypto"
      ? pa.asset.type === "CRYPTOCURRENCY"
      : pa.asset.type !== "CRYPTOCURRENCY",
  );

  return (
    <table className="assets-table">
      <thead>
        <tr>
          <th></th>
          <th scope="col">Asset</th>
          <th scope="col">Last transaction</th>
          <th scope="col">Quantity</th>
          <th scope="col" className="col-avg-price">Avg price</th>
          <th scope="col">Current pricePerUnit</th>
          <th scope="col">% change</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {portfolioAssets.map((portfolioAsset) => (
          <Fragment key={portfolioAsset.assetId}>
            <AssetRow
              portfolioAsset={portfolioAsset}
              isExpanded={expandedId === portfolioAsset.assetId}
              onExpand={() =>
                setExpandedId(
                  expandedId === portfolioAsset.assetId
                    ? null
                    : portfolioAsset.assetId,
                )
              }
            />
            {expandedId === portfolioAsset.assetId && (
              <AssetTransactions
                assetTicker={portfolioAsset.asset.ticker}
                portfolioAssetTransactions={portfolioAsset.transactions}
              />
            )}
          </Fragment>
        ))}
        <AddAsset assetType={assetType} />
      </tbody>
    </table>
  );
};

import { useState } from "react";
import { AssetRow } from "./AssetRow";
import { AssetTransactions } from "./AssetTransactions";
import "../../pages/portfolio/PortfolioPage.css";
import { PortfolioDto } from "../../../../api/src/portfolios/dto/portfolio.dto";

export const AssetTable = ({ portfolio }: { portfolio: PortfolioDto }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { portfolioAssets } = portfolio;

  return (
    <table className="assets-table">
      <thead>
        <tr>
          <th></th>
          <th scope="col">Asset</th>
          <th scope="col">Last transaction</th>
          <th scope="col">Quantity</th>
          <th scope="col">Avg price</th>
          <th scope="col">Current pricePerUnit</th>
          <th scope="col">% change</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {portfolioAssets.map((portfolioAsset) => (
          <>
            <AssetRow
              key={portfolioAsset.assetId}
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
                portfolioAssetTransactions={portfolioAsset.transactions}
              />
            )}
          </>
        ))}
        
      </tbody>
    </table>
  );
};

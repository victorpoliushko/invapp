import { useState } from "react";
import { AssetRow } from "./AssetRow";
import { AssetTransactions } from "./AssetTransactions";
import "../../pages/portfolio/PortfolioPage.css";

export const AssetTable = ({ assets }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
console.log(`
 table 
`);
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
        {assets.map((s: any) => (
          <>
            <AssetRow 
              key={s.assetId} 
              asset={s} 
              isExpanded={expandedId === s.assetId}
              onExpand={() => setExpandedId(expandedId === s.assetId ? null : s.assetId)}
            />
            {expandedId === s.assetId && (
              <AssetTransactions portfolioAsset={s} />
            )}
          </>
        ))}
      </tbody>
    </table>
  );
};

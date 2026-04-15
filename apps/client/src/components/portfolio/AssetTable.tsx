import { useState } from "react";
import { AssetRow } from "./AssetRow";
import { AssetTransactions } from "./AssetTransactions";

export const AssetTable = ({ assets }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <table className="assets-table">
      <thead>{/* Your Headers */}</thead>
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

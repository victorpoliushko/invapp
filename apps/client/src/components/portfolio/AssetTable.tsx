import { Fragment, useState } from "react";
import { AssetRow } from "./AssetRow";
import { AssetTransactions } from "./AssetTransactions";
import "../../pages/portfolio/PortfolioPage.css";
import { PortfolioDto } from "../../../../api/src/portfolios/dto/portfolio.dto";
import { AddAsset } from "./AddAsset";

export const AssetTable = ({ portfolio }: { portfolio: PortfolioDto }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { portfolioAssets } = portfolio;
  console.log(`
 portfolioAssets: ${JSON.stringify(portfolioAssets)} 
`);

  [
    [
      {
        portfolioId: "ac71a030-c1c5-46d2-a152-d7d1367d6290",
        assetId: "9529ca63-794a-4229-bc95-6e9b4323f149",
        quantity: 6,
        price: 363,
        asset: {
          id: "9529ca63-794a-4229-bc95-6e9b4323f149",
          ticker: "VOO",
          name: null,
          type: null,
          exchange: null,
          dataSource: null,
          updatedAt: "2026-05-14",
        },
        transactions: [
          {
            id: "2793c0a1-9c28-4f9f-a785-7f307d5bfab1",
            portfolioId: "ac71a030-c1c5-46d2-a152-d7d1367d6290",
            assetId: "9529ca63-794a-4229-bc95-6e9b4323f149",
            type: "BUY",
            quantityChange: 2,
            pricePerUnit: 200,
            date: "2026-05-15",
          },
          {
            id: "9259b828-d07c-408e-87aa-db30619a69ae",
            portfolioId: "ac71a030-c1c5-46d2-a152-d7d1367d6290",
            assetId: "9529ca63-794a-4229-bc95-6e9b4323f149",
            type: "BUY",
            quantityChange: 4,
            pricePerUnit: 444,
            date: "2026-05-14",
          },
        ],
      },
    ],
  ];
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
        <AddAsset />
      </tbody>
    </table>
  );
};

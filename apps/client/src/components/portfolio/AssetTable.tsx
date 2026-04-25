import { useState } from "react";
import { AssetRow } from "./AssetRow";
import { AssetTransactions } from "./AssetTransactions";
import "../../pages/portfolio/PortfolioPage.css";
import { PortfolioDto } from "../../../../api/src/portfolios/dto/portfolio.dto";

export const AssetTable = ({ portfolio }: { portfolio: PortfolioDto }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { portfolioAssets } = portfolio;

  console.log(`
   portfolio: ${JSON.stringify(portfolio)} 
  `);

  [
    {
      id: "140f5933-6f4b-424f-86c3-3f350a2b1293",
      name: "Katrusia super portfolio 22",
      userId: "13ee5312-1a96-4ed2-a271-da54b338b708",
      portfolioAssets: [
        {
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
          quantity: 10,
          price: 100,
          assets: {
            id: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
            ticker: "VOO",
            name: null,
            type: null,
            exchange: null,
            dataSource: null,
            updatedAt: "2025-11-24",
            transactions: [
              {
                id: "18244817-0cef-421c-891e-063c5722c44c",
                portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
                assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
                type: "BUY",
                quantityChange: 10,
                pricePerUnit: 100,
                date: "2026-04-09",
              },
            ],
          },
        },
      ],
    },
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

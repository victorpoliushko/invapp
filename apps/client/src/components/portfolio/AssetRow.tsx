import { usePortfolio } from "../../context/PortfolioContext";
import TransactionButton from "./TransactionButton";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { PortfolioAssetDto } from "../../../../api/src/portfolios/dto/PortfolioAsset.dto";

export const AssetRow = ({
  portfolioAsset,
  onExpand,
  isExpanded,
}: {
  portfolioAsset: PortfolioAssetDto;
  onExpand: any;
  isExpanded: boolean;
}) => {
  const { deleteAsset, loadingPrices } = usePortfolio();
  console.log(`
 transactions: ${JSON.stringify(portfolioAsset)} 
`);

  [
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
        updatedAt: "2025-11-24T14:18:21.556Z",
        transactions: [
          {
            id: "18244817-0cef-421c-891e-063c5722c44c",
            portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
            assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
            type: "BUY",
            quantityChange: 10,
            pricePerUnit: 100,
            date: "2026-04-09T00:00:00.000Z",
          },
        ],
      },
    },
  ];
  return (
    <tr>
      <td>
        <button onClick={onExpand}>{isExpanded ? "▼" : "►"}</button>
      </td>
      <td>{portfolioAsset.assets.ticker}</td>
      <td>
        {portfolioAsset.transactions && portfolioAsset.transactions.length
          ? portfolioAsset.transactions[portfolioAsset.transactions.length]
          : ""}
      </td>
      <td>{portfolioAsset.quantity}</td>
      <td>
        {loadingPrices[portfolioAsset.assetId] ? "..." : portfolioAsset.price}
      </td>
      <td className="actions">
        <TransactionButton assetId={portfolioAsset.assetId} />
        <button onClick={() => deleteAsset(portfolioAsset.assetId)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
};

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

  return (
    <tr>
      <td>
        <button onClick={onExpand}>{isExpanded ? "▼" : "►"}</button>
      </td>
      <td>{portfolioAsset.asset.ticker}</td>
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

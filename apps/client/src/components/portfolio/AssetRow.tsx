import { usePortfolio } from "../../context/PortfolioContext";
import TransactionButton from "./TransactionButton";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";

export const AssetRow = ({ asset, onExpand, isExpanded }: any) => {
  const { deleteAsset, loadingPrices } = usePortfolio();

  return (
    <tr>
      <td>
        <button onClick={onExpand}>{isExpanded ? "▼" : "►"}</button>
      </td>
      <td>{asset.assets.ticker}</td>
      <td>{asset.quantity}</td>
      <td>{loadingPrices[asset.assetId] ? "..." : asset.price}</td>
      <td className="actions">
        <TransactionButton assetId={asset.assetId} />
        <button onClick={() => deleteAsset(asset.assetId)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
};

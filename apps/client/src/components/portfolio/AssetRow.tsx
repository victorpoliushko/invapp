import { usePortfolio } from "../../context/PortfolioContext";
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
  const { deleteAsset, loadingPrices, currentPrices } = usePortfolio();

  const currentPrice = currentPrices[portfolioAsset.assetId];
  const avgPrice = portfolioAsset.price;
  const pctChange =
    currentPrice != null && avgPrice != null && avgPrice !== 0
      ? ((currentPrice - avgPrice) / avgPrice) * 100
      : null;

  return (
    <tr>
      <td>
        <button onClick={onExpand}>{isExpanded ? "▼" : "►"}</button>
      </td>
      <td>{portfolioAsset.asset.ticker}</td>
      <td>
        {portfolioAsset.transactions?.length
          ? new Date(portfolioAsset.transactions[0].date).toLocaleDateString()
          : "—"}
      </td>
      <td>{portfolioAsset.quantity}</td>
      <td className="col-avg-price">{portfolioAsset.price ?? "—"}</td>
      <td>
        {loadingPrices[portfolioAsset.assetId] ? "..." : (currentPrice ?? "—")}
      </td>
      <td style={{ color: pctChange == null ? undefined : pctChange >= 0 ? "#4caf50" : "#e57373" }}>
        {pctChange == null ? "—" : `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%`}
      </td>
      <td className="actions">
        <button onClick={() => deleteAsset(portfolioAsset.assetId)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
};

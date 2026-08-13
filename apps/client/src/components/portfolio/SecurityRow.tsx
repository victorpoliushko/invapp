import { usePortfolio } from "../../context/PortfolioContext";
import deleteIcon from "../../assets/crud-icons/delete.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { PositionDto } from "../../../../api/src/portfolios/dto/Position.dto";

export const SecurityRow = ({
  position,
  onExpand,
  isExpanded,
}: {
  position: PositionDto;
  onExpand: any;
  isExpanded: boolean;
}) => {
  const { deleteAsset, loadingPrices, currentPrices } = usePortfolio();

  const currentPrice = currentPrices[position.assetId];
  const avgPrice = position.price;
  const pctChange =
    currentPrice != null && avgPrice != null && avgPrice !== 0
      ? ((currentPrice - avgPrice) / avgPrice) * 100
      : null;
  const totalReturn =
    currentPrice != null && avgPrice != null
      ? (currentPrice - avgPrice) * position.quantity
      : null;
  const totalPosition = position.transactions
    .filter((t) => t.type === "BUY")
    .reduce((sum, t) => sum + t.quantityChange * t.pricePerUnit, 0);

  return (
    <tr>
      <td>
        <button onClick={onExpand}>{isExpanded ? "▼" : "►"}</button>
      </td>
      <td data-label="Asset">{position.asset.ticker}</td>
      <td data-label="Last transaction">
        {position.transactions?.length
          ? new Date(position.transactions[0].date).toLocaleDateString()
          : "—"}
      </td>
      <td data-label="Quantity">{position.quantity}</td>
      <td className="col-avg-price" data-label="Avg price">{position.price ?? "—"}</td>
      <td data-label="Current price">
        {loadingPrices[position.assetId] ? "..." : (currentPrice ?? "—")}
      </td>
      <td data-label="% change" style={{ color: pctChange == null ? undefined : pctChange >= 0 ? "#4caf50" : "#e57373" }}>
        {pctChange == null ? "—" : `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%`}
      </td>
      <td data-label="Total position">{totalPosition > 0 ? Math.round(totalPosition).toLocaleString() : "—"}</td>
      <td data-label="Total return" style={{ color: totalReturn == null ? undefined : totalReturn >= 0 ? "#4caf50" : "#e57373" }}>
        {totalReturn == null ? "—" : `${totalReturn >= 0 ? "+" : ""}${Math.round(totalReturn).toLocaleString()}`}
      </td>
      <td className="actions">
        <button className="icon-btn" onClick={() => deleteAsset(position.assetId)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
};

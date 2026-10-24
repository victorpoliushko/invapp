import { usePortfolio } from "../../context/PortfolioContext";
import { PositionDto } from "../../types/portfolio";
import { Modal } from "../Modal";
import { MaskIcon } from "../MaskIcon";
import xIcon from "../../assets/icons/x.svg";
import { formatMoney } from "../../utils/money";
import { formatQuantity } from "../../utils/formatQuantity";
import { TRANSACTION_COLORS } from "./transactionColors";

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: "numeric", day: "numeric", year: "2-digit" };

export function PositionDetailsModal({
  position,
  assetType,
  onClose,
}: {
  position: PositionDto;
  assetType: "stock" | "crypto";
  onClose: () => void;
}) {
  const { currentPrices, deleteAsset } = usePortfolio();
  const ticker = position.asset.ticker;
  const currentPrice = currentPrices[position.assetId];
  const transactions = position.transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${ticker} and all its transactions from this portfolio?`)) return;
    await deleteAsset(position.assetId);
    onClose();
  };

  return (
    <Modal labelledBy="position-details-title" onClose={onClose} className="position-details">
      <div className="modal-header">
        <div className="position-details-summary">
          <h2 id="position-details-title" className="position-details-title">{ticker} Details</h2>
          <p><span>Total q-ty</span><strong>{formatQuantity(position.quantity, assetType)}</strong></p>
          <p><span>Current price</span><strong>{currentPrice != null ? formatMoney(currentPrice, 2) : "—"}</strong></p>
          <p><span>Average price</span><strong>{position.price != null ? formatMoney(position.price, 2) : "—"}</strong></p>
        </div>
        <button className="icon-button" aria-label="Close" onClick={onClose}>
          <MaskIcon src={xIcon} size={20} />
        </button>
      </div>

      <div className="position-details-table-wrap">
        <table className="position-details-table table-plain">
          <thead>
            <tr>
              <th scope="col">Trade type</th>
              <th scope="col">Date</th>
              <th scope="col">Quantity</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td style={{ color: TRANSACTION_COLORS[t.type as "BUY" | "SELL"] }}>{t.type}</td>
                <td>{new Date(t.date).toLocaleDateString(undefined, SHORT_DATE)}</td>
                <td>{formatQuantity(t.quantityChange, assetType)}</td>
                <td>{formatMoney(t.pricePerUnit, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-danger" onClick={handleDelete}>
        Delete {ticker}
      </button>
    </Modal>
  );
}

import { usePortfolio } from "../../context/PortfolioContext";
import { PositionDto } from "../../types/portfolio";
import { Modal } from "../Modal";
import { MaskIcon } from "../MaskIcon";
import xIcon from "../../assets/icons/x.svg";
import { formatQuantity } from "../../utils/formatQuantity";
import { TRANSACTION_COLORS } from "./transactionColors";
import { useDisplayMoney } from "./DisplayCurrency";
import { ConfirmDialog } from "../ConfirmDialog";
import { useState } from "react";

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
  const { money } = useDisplayMoney();
  const { currentPrices, deleteAsset } = usePortfolio();
  const ticker = position.asset.ticker;
  const currentPrice = currentPrices[position.assetId];
  const transactions = position.transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <ConfirmDialog
        title={`Delete ${ticker}?`}
        message="The position and all its transactions will be removed from this portfolio."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteAsset(position.assetId);
          onClose();
        }}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <Modal labelledBy="position-details-title" onClose={onClose} className="position-details">
      <div className="modal-header">
        <div className="position-details-summary">
          <h2 id="position-details-title" className="position-details-title">{ticker} Details</h2>
          <p><span>Total q-ty</span><strong>{formatQuantity(position.quantity, assetType)}</strong></p>
          <p><span>{assetType === "crypto" ? "Current price/unit" : "Current price"}</span><strong>{currentPrice != null ? money(currentPrice, "USD", 2) : "—"}</strong></p>
          <p><span>Average price</span><strong>{position.price != null ? money(position.price, "USD", 2) : "—"}</strong></p>
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
                <td>{money(t.pricePerUnit, "USD", 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-danger" onClick={() => setConfirming(true)}>
        Delete {ticker}
      </button>
    </Modal>
  );
}

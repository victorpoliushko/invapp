import { useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { PositionDto } from "../../types/portfolio";
import { Modal } from "../Modal";
import { formatQuantity } from "../../utils/formatQuantity";
import { useAddPositionTransaction } from "./useAddPositionTransaction";
import { ConfirmDialog } from "../ConfirmDialog";
import { DatePicker } from "../DatePicker";

const today = () => new Date().toISOString().slice(0, 10);

export function TradeModal({
  position,
  type,
  assetType,
  onClose,
}: {
  position: PositionDto;
  type: "BUY" | "SELL";
  assetType: "stock" | "crypto";
  onClose: () => void;
}) {
  const { currentPrices, deleteAsset } = usePortfolio();
  const addTransaction = useAddPositionTransaction();
  const ticker = position.asset.ticker;
  const currentPrice = currentPrices[position.assetId];

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(currentPrice != null ? String(+currentPrice.toFixed(2)) : "");
  const [date, setDate] = useState(today());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qty = parseFloat(quantity);
  const oversell = type === "SELL" && qty > position.quantity;
  const canSubmit = qty > 0 && parseFloat(price) > 0 && date !== "" && !oversell && !submitting;

  const [confirmingSellAll, setConfirmingSellAll] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await addTransaction({
        assetName: ticker,
        date,
        quantityChange: qty,
        pricePerUnit: parseFloat(price),
        type,
      });
      onClose();
    } catch {
      setError("Couldn't save the transaction. Please try again.");
      setSubmitting(false);
    }
  };

  if (confirmingSellAll) {
    return (
      <ConfirmDialog
        title={`Sell all ${ticker}?`}
        message="The position and its trade history will be removed from this portfolio."
        confirmLabel="Sell all"
        onConfirm={async () => {
          await deleteAsset(position.assetId);
          onClose();
        }}
        onCancel={() => setConfirmingSellAll(false)}
      />
    );
  }

  return (
    <Modal labelledBy="trade-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="trade-title" className="modal-title">
          {type === "BUY" ? "Buy" : "Sell"} {ticker}
        </h2>

        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Quantity</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              aria-invalid={oversell}
              autoFocus
            />
            {type === "SELL" && (
              <span className={oversell ? "field-hint field-hint-error" : "field-hint"}>
                You hold {formatQuantity(position.quantity, assetType)}
              </span>
            )}
          </label>
          <label className="field">
            <span className="field-label">Price (USD)</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="e.g. 10"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <div className="field">
            <span className="field-label">Date</span>
            <DatePicker value={date} onChange={setDate} ariaLabel="Date" />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? "Saving…" : "Submit"}
          </button>
          {type === "SELL" && (
            <button type="button" className="btn btn-danger" onClick={() => setConfirmingSellAll(true)} disabled={submitting}>
              Sell all
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

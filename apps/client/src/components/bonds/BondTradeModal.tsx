import { useState } from "react";
import { Modal } from "../Modal";
import { Bond } from "./types";
import { useBondActions } from "./useBonds";

const today = () => new Date().toISOString().slice(0, 10);

export function BondTradeModal({
  bond,
  type,
  onClose,
}: {
  bond: Bond;
  type: "BUY" | "SELL";
  onClose: () => void;
}) {
  const { addTrade } = useBondActions();

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(today());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qty = parseFloat(quantity);
  const oversell = type === "SELL" && qty > bond.quantity;
  const canSubmit = qty > 0 && parseFloat(price) > 0 && date !== "" && !oversell && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await addTrade(bond.id, { type, quantity: qty, pricePerUnit: parseFloat(price), date });
      onClose();
    } catch {
      setError("Couldn't save the trade. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal labelledBy="bond-trade-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="bond-trade-title" className="modal-title">
          {type === "BUY" ? "Buy" : "Sell"} {bond.isin}
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
                You hold {bond.quantity}
              </span>
            )}
          </label>
          <label className="field">
            <span className="field-label">Price</span>
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
          <label className="field">
            <span className="field-label">Date</span>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? "Saving…" : "Submit"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

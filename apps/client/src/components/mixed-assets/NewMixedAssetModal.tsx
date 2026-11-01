import { useState } from "react";
import { Modal } from "../Modal";
import { useMixedAssetActions } from "./useMixedAssets";
import { DatePicker } from "../DatePicker";

const today = () => new Date().toISOString().slice(0, 10);

export function NewMixedAssetModal({ onClose }: { onClose: () => void }) {
  const { createAsset } = useMixedAssetActions();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(today());
  const [currentValue, setCurrentValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    name.trim() !== "" && parseFloat(quantity) > 0 && parseFloat(price) > 0 && date !== "" && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await createAsset({
        name: name.trim(),
        quantity: parseFloat(quantity),
        purchasePrice: parseFloat(price),
        purchaseDate: date,
        currentValue: currentValue !== "" ? parseFloat(currentValue) : null,
      });
      onClose();
    } catch {
      setError("Couldn't add the asset. Please try again.");
      setSubmitting(false);
    }
  };

  const number = (label: string, value: string, onChange: (v: string) => void) => (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="input" type="number" inputMode="decimal" min={0} step="any" placeholder="e.g. 10"
        value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );

  return (
    <Modal labelledBy="new-other-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="new-other-title" className="modal-title">New Other</h2>
        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Name</span>
            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          {number("Quantity", quantity, setQuantity)}
          {number("Buying price (USD)", price, setPrice)}
          <div className="field">
            <span className="field-label">Buying date</span>
            <DatePicker value={date} onChange={setDate} ariaLabel="Buying date" />
          </div>
          {number("Current value (USD, optional)", currentValue, setCurrentValue)}
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

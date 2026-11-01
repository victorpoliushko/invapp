import { useState } from "react";
import { Modal } from "../Modal";
import { MixedAsset } from "./types";
import { useMixedAssetActions } from "./useMixedAssets";

export function UpdateValueModal({ asset, onClose }: { asset: MixedAsset; onClose: () => void }) {
  const { updateValue } = useMixedAssetActions();
  const [value, setValue] = useState(asset.currentValue != null ? String(asset.currentValue) : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = value !== "" && parseFloat(value) >= 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateValue(asset.id, parseFloat(value));
      onClose();
    } catch {
      setError("Couldn't save. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal labelledBy="update-value-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="update-value-title" className="modal-title">Update {asset.name}</h2>
        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Current value per unit (USD)</span>
            <input className="input" type="number" inputMode="decimal" min={0} step="any" placeholder="e.g. 10"
              value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
          </label>
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

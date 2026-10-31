import { useState } from "react";
import { Modal } from "../Modal";
import { CURRENCIES } from "../../context/CurrencyContext";
import { CashEntry, useCashActions } from "./useCash";

export function CashModal({ entry, onClose }: { entry?: CashEntry; onClose: () => void }) {
  const { createCash, updateCash, deleteCash } = useCashActions();
  const [name, setName] = useState(entry?.name ?? "");
  const [currency, setCurrency] = useState(entry?.currency ?? "USD");
  const [amount, setAmount] = useState(entry ? String(entry.amount) : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = amount !== "" && parseFloat(amount) >= 0 && !submitting;

  const run = async (action: () => Promise<void>, failure: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await action();
      onClose();
    } catch {
      setError(failure);
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const input = { name: name.trim() || null, currency, amount: parseFloat(amount) };
    run(
      () => (entry ? updateCash(entry.id, input) : createCash(input)),
      "Couldn't save. Please try again.",
    );
  };

  const handleDelete = () => {
    if (!entry || !window.confirm(`Delete ${entry.name ?? `${entry.currency} cash`}?`)) return;
    run(() => deleteCash(entry.id), "Couldn't delete. Please try again.");
  };

  return (
    <Modal labelledBy="cash-modal-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="cash-modal-title" className="modal-title">{entry ? "Edit Cash" : "New Cash"}</h2>

        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Name (optional)</span>
            <input
              className="input"
              type="text"
              placeholder="e.g. Savings account"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <label className="field">
            <span className="field-label">Currency</span>
            <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Amount</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? "Saving…" : "Save"}
          </button>
          {entry && (
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
              Delete
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

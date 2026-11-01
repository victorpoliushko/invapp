import { useState } from "react";
import { Modal } from "../Modal";
import { RealEstate } from "./types";
import { useRealEstateActions } from "./useRealEstate";
import { DateRangePicker } from "../DateRangePicker";

const today = () => new Date().toISOString().slice(0, 10);

export function LendModal({ property, onClose }: { property: RealEstate; onClose: () => void }) {
  const { lend } = useRealEstateActions();
  const [monthlyRent, setMonthlyRent] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const badRange = startDate !== "" && endDate !== "" && endDate <= startDate;
  const canSubmit = parseFloat(monthlyRent) > 0 && startDate !== "" && endDate !== "" && !badRange && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await lend(property.id, { monthlyRent: parseFloat(monthlyRent), startDate, endDate });
      onClose();
    } catch {
      setError("Couldn't save. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal labelledBy="lend-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="lend-title" className="modal-title">Lend {property.name}</h2>

        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Monthly price (USD)</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="e.g. 10"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              autoFocus
            />
          </label>
          <DateRangePicker
            start={startDate}
            end={endDate}
            onChange={(from, to) => {
              setStartDate(from);
              setEndDate(to);
            }}
          />
          {badRange && <span className="field-hint field-hint-error">End date must be after start date</span>}
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

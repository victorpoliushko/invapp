import { useState } from "react";
import { Modal } from "../Modal";
import { REAL_ESTATE_TYPES, TYPE_LABELS } from "./types";
import { useRealEstateActions } from "./useRealEstate";
import { DatePicker } from "../DatePicker";

const today = () => new Date().toISOString().slice(0, 10);

export function NewRealEstateModal({ onClose }: { onClose: () => void }) {
  const { createProperty } = useRealEstateActions();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(today());
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim() !== "" && type !== "" && parseFloat(price) > 0 && date !== "" && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await createProperty({
        name: name.trim(),
        type,
        purchasePrice: parseFloat(price),
        purchaseDate: date,
        totalArea: area !== "" ? parseFloat(area) : null,
        rooms: rooms !== "" ? parseInt(rooms, 10) : null,
      });
      onClose();
    } catch {
      setError("Couldn't add the property. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal labelledBy="new-re-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="new-re-title" className="modal-title">New Real Estate</h2>

        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Name</span>
            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <label className="field">
            <span className="field-label">Type</span>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="" disabled>Select</option>
              {REAL_ESTATE_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Buying price (USD)</span>
            <input className="input" type="number" inputMode="decimal" min={0} step="any" placeholder="e.g. 10"
              value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <div className="field">
            <span className="field-label">Buying date</span>
            <DatePicker value={date} onChange={setDate} ariaLabel="Buying date" />
          </div>
          <label className="field">
            <span className="field-label">Total area, m²</span>
            <input className="input" type="number" inputMode="decimal" min={0} step="any" placeholder="e.g. 10"
              value={area} onChange={(e) => setArea(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Rooms</span>
            <input className="input" type="number" inputMode="numeric" min={0} step={1} placeholder="e.g. 10"
              value={rooms} onChange={(e) => setRooms(e.target.value)} />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

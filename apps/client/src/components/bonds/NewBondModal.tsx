import { useState } from "react";
import { Modal } from "../Modal";
import { CouponFrequency, FREQUENCY_LABEL } from "./types";
import { useBondActions } from "./useBonds";

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  isin: "",
  name: "",
  purchasePrice: "",
  faceValue: "",
  maturityDate: "",
  purchaseDate: today(),
  quantity: "",
  couponRate: "",
  couponFrequency: "" as CouponFrequency | "",
};

export function NewBondModal({ onClose }: { onClose: () => void }) {
  const { createBond } = useBondActions();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit =
    form.isin.trim() !== "" &&
    form.name.trim() !== "" &&
    parseFloat(form.purchasePrice) > 0 &&
    parseFloat(form.faceValue) > 0 &&
    form.maturityDate !== "" &&
    form.purchaseDate !== "" &&
    parseFloat(form.quantity) > 0 &&
    form.couponRate !== "" &&
    form.couponFrequency !== "" &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || form.couponFrequency === "") return;
    setSubmitting(true);
    setError(null);
    try {
      await createBond({
        isin: form.isin.trim(),
        name: form.name.trim(),
        purchasePrice: parseFloat(form.purchasePrice),
        faceValue: parseFloat(form.faceValue),
        couponRate: parseFloat(form.couponRate),
        couponFrequency: form.couponFrequency,
        quantity: parseFloat(form.quantity),
        purchaseDate: form.purchaseDate,
        maturityDate: form.maturityDate,
      });
      onClose();
    } catch {
      setError("Couldn't add the bond. Please try again.");
      setSubmitting(false);
    }
  };

  const number = (field: keyof typeof EMPTY, label: string) => (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="input"
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        placeholder="e.g. 10"
        value={form[field]}
        onChange={set(field)}
      />
    </label>
  );

  return (
    <Modal labelledBy="new-bond-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="new-bond-title" className="modal-title">New Bond</h2>

        <div className="modal-fields">
          <label className="field">
            <span className="field-label">ISIN</span>
            <input className="input" type="text" autoComplete="off" value={form.isin} onChange={set("isin")} autoFocus />
          </label>
          <label className="field">
            <span className="field-label">Name</span>
            <input className="input" type="text" placeholder="e.g. US Treasury 2027" value={form.name} onChange={set("name")} />
          </label>
          {number("purchasePrice", "Purchase price")}
          {number("faceValue", "Face value")}
          <label className="field">
            <span className="field-label">Maturity date</span>
            <input className="input" type="date" value={form.maturityDate} onChange={set("maturityDate")} />
          </label>
          <label className="field">
            <span className="field-label">Buying date</span>
            <input className="input" type="date" value={form.purchaseDate} onChange={set("purchaseDate")} />
          </label>
          {number("quantity", "Quantity")}
          {number("couponRate", "Coupon %")}
          <label className="field">
            <span className="field-label">Frequency</span>
            <select className="input" value={form.couponFrequency} onChange={set("couponFrequency")}>
              <option value="" disabled>Select</option>
              {(Object.keys(FREQUENCY_LABEL) as CouponFrequency[]).map((f) => (
                <option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>
              ))}
            </select>
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

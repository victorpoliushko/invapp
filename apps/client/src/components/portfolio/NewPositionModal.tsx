import { useState } from "react";
import { Modal } from "../Modal";
import { isCryptoSuggestion, useAssetSearch } from "../../hooks/useAssetSearch";
import { useAddPositionTransaction } from "./useAddPositionTransaction";

const today = () => new Date().toISOString().slice(0, 10);

export function NewPositionModal({
  assetType,
  onClose,
}: {
  assetType: "stock" | "crypto";
  onClose: () => void;
}) {
  const addTransaction = useAddPositionTransaction();

  const [name, setName] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [coingeckoId, setCoingeckoId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(today());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { suggestions, clearSuggestions } = useAssetSearch(name, assetType, searchEnabled);

  const canSubmit =
    name.trim() !== "" && parseFloat(quantity) > 0 && parseFloat(price) > 0 && date !== "" && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await addTransaction({
        assetName: name.trim(),
        date,
        quantityChange: parseFloat(quantity),
        pricePerUnit: parseFloat(price),
        type: "BUY",
        coingeckoId: assetType === "crypto" ? coingeckoId : null,
      });
      onClose();
    } catch {
      setError("Couldn't add the asset. Please try again.");
      setSubmitting(false);
    }
  };

  const title = assetType === "crypto" ? "New Crypto" : "New Stock";

  return (
    <Modal labelledBy="new-position-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="new-position-title" className="modal-title">{title}</h2>

        <div className="modal-fields">
          <div className="field autocomplete">
            <label className="field-label" htmlFor="new-position-name">Name</label>
            <input
              id="new-position-name"
              className="input"
              type="text"
              placeholder={assetType === "crypto" ? "e.g. BTC" : "e.g. AAPL"}
              autoComplete="off"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSearchEnabled(true);
                setCoingeckoId(null);
              }}
              autoFocus
            />
            {suggestions.length > 0 && (
              <ul className="autocomplete-list">
                {suggestions.slice(0, 5).map((s) => {
                  const symbol = isCryptoSuggestion(s) ? s.symbol : s.assetSymbol;
                  return (
                    <li key={isCryptoSuggestion(s) ? s.id : s.assetSymbol}>
                      <button
                        type="button"
                        onClick={() => {
                          setName(symbol);
                          setCoingeckoId(isCryptoSuggestion(s) ? s.id : null);
                          setSearchEnabled(false);
                          clearSuggestions();
                        }}
                      >
                        <strong>{symbol.toUpperCase()}</strong>
                        <span>{s.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <label className="field">
            <span className="field-label">Quantity</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Price/unit</span>
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

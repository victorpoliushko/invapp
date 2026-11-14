import { useState } from "react";
import { Modal } from "../../components/Modal";
import { useVault } from "../../context/VaultContext";

const MIN_LENGTH = 8;

export function ChangePassphraseModal({ onClose }: { onClose: () => void }) {
  const { changePassphrase } = useVault();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm !== "" && confirm !== next;
  const canSubmit = current !== "" && next.length >= MIN_LENGTH && confirm === next && !busy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await changePassphrase(current, next);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change the passphrase");
      setBusy(false);
    }
  };

  return (
    <Modal labelledBy="change-passphrase-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="change-passphrase-title" className="modal-title">Change passphrase</h2>
        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Current passphrase</span>
            <input className="input" type="password" autoComplete="current-password" value={current}
              onChange={(e) => setCurrent(e.target.value)} autoFocus />
          </label>
          <label className="field">
            <span className="field-label">New passphrase</span>
            <input className="input" type="password" autoComplete="new-password" value={next}
              onChange={(e) => setNext(e.target.value)} />
            <span className="field-hint">At least {MIN_LENGTH} characters. Your recovery key keeps working.</span>
          </label>
          <label className="field">
            <span className="field-label">Confirm new passphrase</span>
            <input className="input" type="password" autoComplete="new-password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch} />
            {mismatch && <span className="field-hint field-hint-error">Passphrases don't match</span>}
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

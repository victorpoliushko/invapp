import { useState } from "react";
import { Modal } from "./Modal";

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <Modal labelledBy="confirm-title" onClose={onCancel} className="confirm-dialog">
      <div className="confirm-message">
        <h2 id="confirm-title" className="modal-title">{title}</h2>
        <p>{message}</p>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="confirm-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={busy} autoFocus>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

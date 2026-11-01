import { useState } from "react";
import { Modal } from "../../components/Modal";
import { ConfirmDialog } from "../../components/ConfirmDialog";

type Props = {
  name: string;
  onSave: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
};

export function EditPortfolioModal({ name: initialName, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (confirmingDelete) {
    return (
      <ConfirmDialog
        title={`Delete ${initialName}?`}
        message="The portfolio and everything in it will be removed."
        confirmLabel="Delete"
        onConfirm={async () => {
          await onDelete();
          onClose();
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    );
  }

  const canSave = name.trim() !== "" && name.trim() !== initialName && !saving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim());
      onClose();
    } catch {
      setError("Couldn't save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <Modal labelledBy="edit-portfolio-title" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <h2 id="edit-portfolio-title" className="modal-title">Edit Portfolio</h2>
        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Portfolio name</span>
            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSave}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmingDelete(true)}>
            Delete portfolio
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

import { useState } from "react";
import { Modal } from "../../components/Modal";
import { useVault } from "../../context/VaultContext";
import { NewPassphraseFields, RecoveryKeyPanel } from "../vault/VaultScreen";
import "../vault/VaultScreen.css";

const MIN_LENGTH = 8;

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function SwitchModeModal({ onClose }: { onClose: () => void }) {
  const { mode } = useVault();
  return (
    <Modal labelledBy="switch-mode-title" onClose={onClose}>
      {mode === "PRIVATE" ? <ToStandard onClose={onClose} /> : <ToPrivate onClose={onClose} />}
    </Modal>
  );
}

function ToPrivate({ onClose }: { onClose: () => void }) {
  const { switchToPrivate } = useVault();
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ recoveryKey: string; finish: () => Promise<void> } | null>(null);

  const canSubmit = passphrase.length >= MIN_LENGTH && confirm === passphrase && !busy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await switchToPrivate(passphrase));
    } catch (err) {
      setError(errorMessage(err, "Couldn't switch to private mode"));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="modal-body">
        <h2 id="switch-mode-title" className="modal-title">Save your recovery key</h2>
        <RecoveryKeyPanel
          recoveryKey={result.recoveryKey}
          onDone={async () => {
            await result.finish();
            onClose();
          }}
        />
      </div>
    );
  }

  return (
    <form className="modal-body" onSubmit={handleSubmit}>
      <h2 id="switch-mode-title" className="modal-title">Switch to private</h2>
      <p className="vault-text">
        We'll delete our copy of your key, so only you can see your amounts. You'll enter this passphrase each time you
        open the app.
      </p>
      <p className="vault-text vault-warning">
        We can't reset this passphrase for you. If you lose it and your recovery key, your data is gone.
      </p>
      <div className="modal-fields">
        <NewPassphraseFields passphrase={passphrase} confirm={confirm} onPassphrase={setPassphrase} onConfirm={setConfirm} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="modal-actions">
        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          {busy ? "Switching…" : "Continue"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

function ToStandard({ onClose }: { onClose: () => void }) {
  const { switchToStandard } = useVault();
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || busy) return;
    setBusy(true);
    setError(null);
    try {
      await switchToStandard(passphrase);
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Couldn't switch to standard mode"));
      setBusy(false);
    }
  };

  return (
    <form className="modal-body" onSubmit={handleSubmit}>
      <h2 id="switch-mode-title" className="modal-title">Switch to standard</h2>
      <p className="vault-text">
        We'll keep a copy of your key, so you won't need a passphrase and can reset your password by email. This also
        means we can see your amounts. Your passphrase and recovery key will stop working.
      </p>
      <div className="modal-fields">
        <label className="field">
          <span className="field-label">Current passphrase</span>
          <input className="input" type="password" autoComplete="current-password" value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)} autoFocus />
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="modal-actions">
        <button type="submit" className="btn btn-primary" disabled={!passphrase || busy}>
          {busy ? "Switching…" : "Switch"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

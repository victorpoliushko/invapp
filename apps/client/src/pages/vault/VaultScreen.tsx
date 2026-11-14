import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { useVault } from "../../context/VaultContext";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import "../auth/LoginPage.css";
import "./VaultScreen.css";

const MIN_LENGTH = 8;

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function VaultScreen() {
  const { status, retry } = useVault();

  if (status === "loading" || status === "idle") {
    return <p className="vault-status">Loading…</p>;
  }
  if (status === "error") {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Something went wrong</h1>
          <p className="vault-text">We couldn't load your encryption settings.</p>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={retry}>Try again</button>
          </div>
        </div>
      </section>
    );
  }
  if (status === "setup") return <SetupForm />;
  return <UnlockForm />;
}

export function NewPassphraseFields({
  passphrase,
  confirm,
  onPassphrase,
  onConfirm,
  label = "Passphrase",
}: {
  passphrase: string;
  confirm: string;
  onPassphrase: (v: string) => void;
  onConfirm: (v: string) => void;
  label?: string;
}) {
  const mismatch = confirm !== "" && confirm !== passphrase;
  return (
    <>
      <label className="field">
        <span className="field-label">{label}</span>
        <input className="input" type="password" autoComplete="new-password" value={passphrase}
          onChange={(e) => onPassphrase(e.target.value)} />
        <span className="field-hint">At least {MIN_LENGTH} characters. Different from your login password.</span>
      </label>
      <label className="field">
        <span className="field-label">Confirm {label.toLowerCase()}</span>
        <input className="input" type="password" autoComplete="new-password" value={confirm}
          onChange={(e) => onConfirm(e.target.value)} aria-invalid={mismatch} />
        {mismatch && <span className="field-hint field-hint-error">Passphrases don't match</span>}
      </label>
    </>
  );
}

const MODES = [
  {
    value: "STANDARD",
    title: "Standard",
    text: "We store your data and keep it safe from being lost. Forgot your password? Reset it and everything is still there.",
  },
  {
    value: "PRIVATE",
    title: "Private",
    text: "Your money stays private. Even we don't know how much you have. You'll need a passphrase, and if you lose it and your recovery key, your data is gone.",
  },
] as const;

function SetupForm() {
  const { setUp, setUpStandard } = useVault();
  const { logout } = useAuth();
  const [mode, setMode] = useState<"STANDARD" | "PRIVATE">("STANDARD");
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ recoveryKey: string; finish: () => Promise<void> } | null>(null);

  const isPrivate = mode === "PRIVATE";
  const canSubmit = !busy && (!isPrivate || (passphrase.length >= MIN_LENGTH && confirm === passphrase));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      if (isPrivate) {
        setResult(await setUp(passphrase));
        setBusy(false);
      } else {
        await setUpStandard();
      }
    } catch (err) {
      setError(errorMessage(err, "Couldn't set up your account"));
      setBusy(false);
    }
  };

  if (result) return <RecoveryKeyStep recoveryKey={result.recoveryKey} onDone={result.finish} />;

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">How should we store your data?</h1>
        <p className="vault-text">You can change this later in Settings.</p>

        <div className="vault-modes" role="radiogroup" aria-label="Storage mode">
          {MODES.map((m) => (
            <label key={m.value} className={`vault-mode${mode === m.value ? " vault-mode-active" : ""}`}>
              <input
                type="radio"
                name="vault-mode"
                value={m.value}
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
              />
              <span className="vault-mode-body">
                <span className="vault-mode-title">{m.title}</span>
                <span className="vault-text">{m.text}</span>
              </span>
            </label>
          ))}
        </div>

        {isPrivate && (
          <div className="modal-fields">
            <NewPassphraseFields passphrase={passphrase} confirm={confirm} onPassphrase={setPassphrase} onConfirm={setConfirm} />
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {busy ? "Setting up…" : "Continue"}
          </button>
        </div>
        <p className="auth-switch">
          <button type="button" className="link-button" onClick={logout}>Log out</button>
        </p>
      </form>
    </section>
  );
}

function RecoveryKeyStep({ recoveryKey, onDone }: { recoveryKey: string; onDone: () => Promise<void> }) {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Save your recovery key</h1>
        <RecoveryKeyPanel recoveryKey={recoveryKey} onDone={onDone} />
      </div>
    </section>
  );
}

export function RecoveryKeyPanel({ recoveryKey, onDone }: { recoveryKey: string; onDone: () => Promise<void> }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <p className="vault-text">
        If you forget your passphrase, this key is the only way to get your data back. Store it somewhere safe,
        like a password manager. You won't see it again.
      </p>
      <code className="vault-recovery-key">{recoveryKey}</code>
      <button type="button" className="btn btn-secondary" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
      <label className="vault-check">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        I've saved my recovery key
      </label>
      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!saved || busy}
          onClick={async () => {
            setBusy(true);
            await onDone();
          }}
        >
          Continue
        </button>
      </div>
    </>
  );
}

function UnlockForm() {
  const { unlock } = useVault();
  const { logout } = useAuth();
  const [mode, setMode] = useState<"unlock" | "recover">("unlock");
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (mode === "recover") return <RecoverForm onBack={() => setMode("unlock")} />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || busy) return;
    setBusy(true);
    setError(null);
    try {
      await unlock(passphrase);
    } catch (err) {
      setError(errorMessage(err, "Couldn't unlock"));
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Unlock your data</h1>
        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Passphrase</span>
            <input className="input" type="password" autoComplete="current-password" value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)} autoFocus />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!passphrase || busy}>
            {busy ? "Unlocking…" : "Unlock"}
          </button>
        </div>
        <p className="auth-switch vault-links">
          <button type="button" className="link-button" onClick={() => setMode("recover")}>Forgot passphrase?</button>
          <button type="button" className="link-button" onClick={logout}>Log out</button>
        </p>
      </form>
    </section>
  );
}

function RecoverForm({ onBack }: { onBack: () => void }) {
  const { recover, reset } = useVault();
  const [recoveryKey, setRecoveryKey] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const canSubmit = recoveryKey.trim() !== "" && passphrase.length >= MIN_LENGTH && confirm === passphrase && !busy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await recover(recoveryKey, passphrase);
    } catch (err) {
      setError(errorMessage(err, "Couldn't recover"));
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Use recovery key</h1>
        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Recovery key</span>
            <input className="input" type="text" autoComplete="off" spellCheck={false} value={recoveryKey}
              onChange={(e) => setRecoveryKey(e.target.value)} placeholder="XXXXX-XXXXX-…" />
          </label>
          <NewPassphraseFields
            label="New passphrase"
            passphrase={passphrase}
            confirm={confirm}
            onPassphrase={setPassphrase}
            onConfirm={setConfirm}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {busy ? "Recovering…" : "Set new passphrase"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
        </div>
        <p className="auth-switch">
          <button type="button" className="link-button vault-danger" onClick={() => setConfirmingReset(true)}>
            Lost your recovery key too? Start over
          </button>
        </p>
      </form>

      {confirmingReset && (
        <ConfirmDialog
          title="Delete all your data?"
          message="Your portfolios stay, but every asset, trade and cash entry in them is deleted for good. You'll then set a new passphrase."
          confirmLabel="Delete and start over"
          onConfirm={reset}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </section>
  );
}

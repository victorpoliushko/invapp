import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { API_BASE_URL } from "../../config";
import "./LoginPage.css";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm !== "" && confirm !== password;
  const canSubmit =
    username.trim() !== "" && email.trim() !== "" && password.length >= 8 && confirm === password && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth-v2/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = data?.errors?.[0]?.errors?.[0] ?? data?.message;
        throw new Error(message ?? "Registration failed");
      }
      login(data.userId, data.accessToken, data.refreshToken);
      navigate("/main", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Create account</h1>

        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Username</span>
            <input className="input" type="text" autoComplete="username" value={username}
              onChange={(e) => setUsername(e.target.value)} autoFocus />
          </label>
          <label className="field">
            <span className="field-label">Email</span>
            <input className="input" type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input className="input" type="password" autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)} />
            <span className="field-hint">At least 8 characters</span>
          </label>
          <label className="field">
            <span className="field-label">Confirm password</span>
            <input className="input" type="password" autoComplete="new-password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch} />
            {mismatch && <span className="field-hint field-hint-error">Passwords don't match</span>}
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}

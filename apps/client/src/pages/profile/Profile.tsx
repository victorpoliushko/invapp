import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import "./Profile.css";
import { API_BASE_URL } from "../../config";
import { CurrencySelect } from "../../components/CurrencySelect";
import { useCurrency } from "../../context/CurrencyContext";
import { MaskIcon } from "../../components/MaskIcon";
import infoIcon from "../../assets/icons/info.svg";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export default function Profile() {
  const { userId, accessToken, logout } = useAuth();
  const fetchWithRedirect = useFetchWithRedirect();
  const { defaultCurrency, setDefaultCurrency } = useCurrency();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchWithRedirect(`${API_BASE_URL}/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data: UserProfile) => {
        setUser(data);
        setUsername(data.username);
        setPhoneNumber(data.phoneNumber ?? "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetchWithRedirect(`${API_BASE_URL}/users/${userId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          username,
          phoneNumber: phoneNumber || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setUser(updated);
      setIsEditing(false);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setUsername(user.username);
      setPhoneNumber(user.phoneNumber ?? "");
    }
    setSaveError(null);
    setIsEditing(false);
  };

  if (loading) return <p className="settings-status">Loading...</p>;
  if (error) return <p className="settings-status">{error}</p>;
  if (!user) return null;

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <section className="section-container settings-page">
      <h1 className="settings-title">Settings</h1>

      <div className="settings-card settings-info">
        <span className="settings-info-icon">
          <MaskIcon src={infoIcon} size={24} />
        </span>
        <div>
          <p className="settings-info-title">More asset actions on web</p>
          <p className="settings-info-text">Manage more asset actions and advanced settings in the web version.</p>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-profile-header">
          <span className="settings-avatar" aria-hidden="true">{initials}</span>
          <div className="settings-profile-names">
            <span className="settings-profile-name">{user.username}</span>
            <span className="settings-profile-role">{user.role}</span>
          </div>
          {isEditing ? (
            <div className="settings-edit-actions">
              <button className="settings-edit-btn" onClick={handleCancel} disabled={saving}>Cancel</button>
              <button className="settings-edit-btn settings-edit-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          ) : (
            <button className="settings-edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>

        <div className="settings-rows">
          <div className="settings-row">
            <span>Username</span>
            {isEditing ? (
              <input className="input settings-input" type="text" value={username}
                onChange={(e) => setUsername(e.target.value)} aria-label="Username" />
            ) : (
              <span className="settings-row-value">{user.username}</span>
            )}
          </div>
          <div className="settings-row">
            <span>Email</span>
            <span className="settings-row-value">{user.email}</span>
          </div>
          <div className="settings-row">
            <span>Phone</span>
            {isEditing ? (
              <input className="input settings-input" type="tel" value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)} aria-label="Phone" />
            ) : (
              <span className="settings-row-value">{user.phoneNumber || "—"}</span>
            )}
          </div>
        </div>
        {saveError && <p className="form-error">{saveError}</p>}
      </div>

      <div className="settings-card">
        <p className="settings-card-label">Preferences</p>
        <div className="settings-rows">
          <div className="settings-row">
            <span>Currency</span>
            <CurrencySelect
              value={defaultCurrency}
              label="Default currency"
              onChange={(c) => setDefaultCurrency(c).catch(() => alert("Failed to save currency"))}
            />
          </div>
        </div>
      </div>

      <button className="settings-logout" onClick={logout}>Log out</button>
    </section>
  );
}

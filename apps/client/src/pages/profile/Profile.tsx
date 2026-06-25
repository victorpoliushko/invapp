import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import "./Profile.css";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export default function Profile() {
  const { userId, accessToken } = useAuth();
  const fetchWithRedirect = useFetchWithRedirect();
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
    fetchWithRedirect(`http://localhost:5173/api/users/${userId}`)
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
      const res = await fetchWithRedirect(`http://localhost:5173/api/users/${userId}`, {
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

  if (loading) return <p className="profile-status">Loading...</p>;
  if (error) return <p className="profile-status">{error}</p>;
  if (!user) return null;

  return (
    <section className="section-container profile-section">
      <h2>Profile settings</h2>
      <div className="profile-card">
        <div className="profile-field">
          <span className="profile-label">Username</span>
          {isEditing ? (
            <input
              className="profile-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : (
            <span className="profile-value">{user.username}</span>
          )}
        </div>
        <div className="profile-field">
          <span className="profile-label">Email</span>
          <span className="profile-value">{user.email}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Phone</span>
          {isEditing ? (
            <input
              className="profile-input"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          ) : (
            <span className="profile-value">{user.phoneNumber ?? "—"}</span>
          )}
        </div>
        <div className="profile-field">
          <span className="profile-label">Role</span>
          <span className="profile-value">{user.role}</span>
        </div>

        {saveError && <p className="profile-error">{saveError}</p>}

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="profile-cancel-btn" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </>
          ) : (
            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

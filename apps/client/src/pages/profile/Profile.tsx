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
  const { userId } = useAuth();
  const fetchWithRedirect = useFetchWithRedirect();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchWithRedirect(`http://localhost:5173/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then(setUser)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="profile-status">Loading...</p>;
  if (error) return <p className="profile-status">{error}</p>;
  if (!user) return null;

  return (
    <section className="section-container profile-section">
      <h2>Profile settings</h2>
      <div className="profile-card">
        <div className="profile-field">
          <span className="profile-label">Username</span>
          <span className="profile-value">{user.username}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Email</span>
          <span className="profile-value">{user.email}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Phone</span>
          <span className="profile-value">{user.phoneNumber ?? "—"}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Role</span>
          <span className="profile-value">{user.role}</span>
        </div>
      </div>
    </section>
  );
}

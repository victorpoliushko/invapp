import { useNavigate } from "react-router-dom";
import invappLogo from "../../assets/invapp-logo.png";
import { useAuth } from "../../AuthContext";
import "./header.css";

export function Header() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();

  const handeGoogleLogin = () => {
    window.location.href = "http://localhost:5173/api/auth-v2/google/login";
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:5173/login";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <nav>
        <img
          className="navbar-logo"
          src={invappLogo}
          alt="invapp-logo"
          height={70}
          width={194}
        />
        {userId ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <button className="signin-button" onClick={handeGoogleLogin}>
              Sign in SSO
            </button>
            <button className="signin-button" onClick={handleLogin}>
              Sign in
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

import invappLogo from "../../assets/invapp2.png"
import "./header.css"

export function Header() {
  const handeGoogleLogin = () => {
    window.location.href = "http://localhost:5173/api/auth-v2/google/login";
  };

  return (
    <header className="header">
      <nav>
        <img className="navbar-logo" src={invappLogo} alt="invapp-logo" />
        <button onClick={handeGoogleLogin}>Login with Google</button>
      </nav>
    </header>
  );
}

import invappLogo from "../../assets/invapp-logo.png"
import "./header.css"

export function Header() {
  const handeGoogleLogin = () => {
    window.location.href = "http://localhost:5173/api/auth-v2/google/login";
  };

  return (
    <header className="header">
      <nav>
        <img className="navbar-logo" src={invappLogo} alt="invapp-logo" height={70} width={194} />
        <button className="signin-button" onClick={handeGoogleLogin}>Sign in</button>
      </nav>
    </header>
  );
}

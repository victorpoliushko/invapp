import invappLogo from "../../assets/invapp2.png"
import "./header.css"

export function Header() {
  return (
    <header className="header">
      <nav>
        <img className="navbar-logo" src={invappLogo} alt="invapp-logo" />
        <span>My investments</span>
      </nav>
    </header>
  );
}

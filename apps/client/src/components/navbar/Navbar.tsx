import invappLogo from "../../assets/invapp.png"
import "./navbar.css";

export function Navbar() {
  return (
    <header>
      <nav className="navbar">
        <img className="navbar-logo" src={invappLogo} alt="invapp logo" />
        <h1>Nav</h1>
      </nav>
    </header>
  )
}

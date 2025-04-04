import invappLogo from "../../assets/invapp2.png"
import "./navbar.css";

export function Navbar() {
  return (
    <header>
      <nav className="navbar">
        <img className="navbar-logo" src={invappLogo} alt="invapp logo" />
        <span className="profile-text">Your profile</span>
      </nav>
    </header>
  )
}

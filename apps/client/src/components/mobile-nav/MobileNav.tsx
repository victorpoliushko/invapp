import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import homeIcon from "../../assets/icons/home.svg";
import pieChartIcon from "../../assets/icons/pie-chart.svg";
import settingsIcon from "../../assets/icons/settings.svg";
import userIcon from "../../assets/icons/user.svg";
import { MaskIcon } from "../MaskIcon";
import "./mobile-nav.css";

/**
 * Phone-only top bar (≤600px) for the Main screen. Other screens render their
 * own title bar (e.g. "Portfolios" + New), as in the Figma screens.
 */
export function MobileTopBar() {
  return (
    <div className="mobile-top-bar">
      <Link to="/main" className="mobile-top-bar-title">Invapp</Link>
      <Link to="/settings" className="mobile-top-bar-profile" aria-label="Profile and settings">
        <MaskIcon src={userIcon} size={18} />
      </Link>
    </div>
  );
}

/** Phone-only bottom tab bar (≤600px), shown to signed-in users. */
export function MobileTabBar() {
  const { userId } = useAuth();
  const { pathname } = useLocation();
  // Portfolio detail pages live under /portfolios/:id, not the list route,
  // so match the whole /portfolios prefix to keep the tab highlighted there.
  const portfoliosActive = pathname.startsWith("/portfolios");

  return (
    <nav className="mobile-tab-bar" aria-label="Main navigation">
      <NavLink to="/main" className="mobile-tab">
        <MaskIcon src={homeIcon} size={20} />
        <span>Main</span>
      </NavLink>
      <NavLink
        to={`/portfolios/user/${userId}`}
        className={() => `mobile-tab${portfoliosActive ? " active" : ""}`}
      >
        <MaskIcon src={pieChartIcon} size={20} />
        <span>Portfolios</span>
      </NavLink>
      <NavLink to="/settings" className="mobile-tab">
        <MaskIcon src={settingsIcon} size={20} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}

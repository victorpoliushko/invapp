import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { MobileTabBar, MobileTopBar } from "./components/mobile-nav/MobileNav";
import { useAuth } from "./AuthContext";
import { useVault } from "./context/VaultContext";
import { VaultScreen } from "./pages/vault/VaultScreen";
import "./App.css";

const PUBLIC_PATHS = ["/", "/login", "/register", "/auth-redirect"];

export function Layout() {
  const { userId } = useAuth();
  const { pathname } = useLocation();
  const { status } = useVault();
  const locked = userId != null && status !== "unlocked" && !PUBLIC_PATHS.includes(pathname);

  return (
    <div className={userId ? "app-shell app-shell--signed-in" : "app-shell"}>
      <Header />
      {userId && !locked && pathname === "/main" && <MobileTopBar />}
      <main className="page-content">
        {locked ? <VaultScreen /> : <Outlet />}
      </main>
      <Footer />
      {userId && !locked && <MobileTabBar />}
    </div>
  );
}

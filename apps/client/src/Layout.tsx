import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { MobileTabBar, MobileTopBar } from "./components/mobile-nav/MobileNav";
import { useAuth } from "./AuthContext";
import "./App.css";

export function Layout() {
  const { userId } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className={userId ? "app-shell app-shell--signed-in" : "app-shell"}>
      <Header />
      {userId && pathname === "/main" && <MobileTopBar />}
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
      {userId && <MobileTabBar />}
    </div>
  );
}

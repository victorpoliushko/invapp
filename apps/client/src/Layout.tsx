import { Outlet } from "react-router-dom";
import { Header } from "./components/header/header";
import "./App.css";

export function Layout() {
  return (
    <>
      <Header />
      <main className="page-content">
        <Outlet />
      </main>
    </>
  );
}

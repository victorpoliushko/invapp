import { Outlet } from "react-router-dom";
import { Header } from "./components/header/header";

export function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/variables.css";
import "./styles/base.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import PortfoliosPage from "./pages/portfolios/PortfoliosPage.tsx";
import PortfolioPage from "./pages/portfolio/PortfolioPage.tsx";
import { AiSuggestions } from "./pages/aiSuggestions/AiSuggestions.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { MainPage } from "./pages/main/Main.tsx";
import { AuthProvider } from "./AuthContext.tsx";
import { Layout } from "./Layout.tsx";
import AuthCallback from "./pages/auth/AuthCallback.tsx";
import { PortfolioProvider } from "./context/PortfolioContext.tsx";
import NewPortfolioPage from "./pages/portfolio/NewPortfolioPage.tsx";
import Profile from "./pages/profile/Profile.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/main",
        element: <MainPage />,
      },
      {
        path: "/app",
        element: <App />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        element: <PortfolioProviderWrapper />,
        children: [
          {
            path: "portfolios/user/:userId",
            element: <PortfoliosPage />,
          },
          {
            path: "portfolios/:id",
            element: <NewPortfolioPage />,
          },
        ],
      },
      {
        path: "/portfolios/:portfolioId/ai-suggestions",
        element: <AiSuggestions />,
      },
      {
        path: "/settings",
        element: <Profile />,
      },
      {
        path: "/auth-redirect",
        element: <AuthCallback />,
      },
    ],
  },
]);

import { Outlet } from "react-router-dom";

function PortfolioProviderWrapper() {
  return (
    <PortfolioProvider>
      <Outlet />
    </PortfolioProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import PortfoliosPage from "./pages/portfolios/PortfoliosPage.tsx";
import PortfolioPage from "./pages/portfolio/PortfolioPage.tsx";
import { AiSuggestions } from "./pages/aiSuggestions/AiSuggestions.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import { Header } from "./components/header/header.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { MainPage } from "./pages/main/Main.tsx";
import { AuthProvider } from "./AuthContext.tsx";
import { Layout } from "./Layout.tsx";

const storedUserId = localStorage.getItem("userId");

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/main",
        element: <MainPage />
      },
      {
        path: "/app",
        element: <App />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: `/portfolios/user/${storedUserId}`,
        element: <PortfoliosPage />,
      },
      {
        path: "/portfolios/storedUserId",
        element: <PortfolioPage />,
      },
      {
        path: "/portfolios/:portfolioId/ai-suggestions",
        element: <AiSuggestions />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);

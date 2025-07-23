import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from './pages/NotFoundPage.tsx';
import PortfoliosPage from './pages/portfolios/PortfoliosPage.tsx';
import PortfolioPage from './pages/PortfolioPage.tsx';
import { AiSuggestions } from './pages/aiSuggestions/AiSuggestions.tsx';

const router = createBrowserRouter([{
  path: "/",
  element: <App />,
  errorElement: <NotFoundPage />
},
{
  path: "/login",
  element: <LoginPage />,
  errorElement: <NotFoundPage />
},
{
  path: "/portfolios",
  element: <PortfoliosPage />
},
{
  path: "/portfolios/:portfolioId",
  element: <PortfolioPage />
},
{
  path: "/portfolios/:portfolioId/ai-suggestions",
  element: <AiSuggestions />
}]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode>,
);

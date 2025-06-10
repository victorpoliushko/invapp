import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PortfoliosPage } from './pages/portfolios/PortfoliosPage.tsx';

const router = createBrowserRouter([{
  path: "/",
  element: <App />
},
{
  path: "/portfolios",
  element: <PortfoliosPage />
}]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode>,
);

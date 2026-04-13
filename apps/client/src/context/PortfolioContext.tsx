import React, { createContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchWithRedirect } from "../hooks/useApiWithRedirect";

interface PortfolioContextType {
  portfolio: any;
  loadingPrices: Record<string, boolean>;
  addTransaction: (type: string, assetId: string, data: any) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  updatePortfolioName: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<any>();
  const [loadingPrices, setLoadingPrices] = useState({});
  const fetchWithRedirect = useFetchWithRedirect();
  const token = localStorage.getItem("accessToken");

  const refreshData = async () => {
    if (!id) return;
    const res = await fetchWithRedirect(`http://localhost:5173/api/portfolios/${id}`, {
      headers: { 
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setPortfolio(data);
  }

  
};

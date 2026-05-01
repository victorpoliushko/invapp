import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchWithRedirect } from "../hooks/useApiWithRedirect";
import { PortfolioDto } from "../../../api/src/portfolios/dto/portfolio.dto";
import { useAuth } from "../AuthContext";

interface PortfolioContextType {
  portfolio: PortfolioDto | undefined;
  loadingPrices: Record<string, boolean>;
  addTransaction: (type: string, assetId: string, data: any) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  updatePortfolioName: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  createPortolio: (name: string, userId: string) => Promise<void>
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined,
);

export const PortfolioProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioDto | undefined>();
  const [loadingPrices, setLoadingPrices] = useState({});
  const fetchWithRedirect = useFetchWithRedirect();
  const token = localStorage.getItem("accessToken");
  const { accessToken, userId } = useAuth();

  const updatePortfolioName = async (newName: string) => {
    if (!newName.trim() || newName === portfolio?.name) return;

    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`/api/portfolios/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        const updated = await res.json();
        setPortfolio(updated);
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const refreshData = async () => {
    if (!id) return;
    const res = await fetchWithRedirect(
      `http://localhost:5173/api/portfolios/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();
    setPortfolio(data);
  };

  const deleteAsset = async (assetId: string) => {
    await fetch(`api/portfolios/${id}/assets`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assetId }),
    });

    await refreshData();
  };

  useEffect(() => {
    refreshData();
  }, [id]);

  const createPortolio = async (name: string, userId: string) => {
    const res = await fetch(`api/portfolios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: name,
        userId: userId,
      }),
    });
    await res.json();
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        loadingPrices,
        deleteAsset,
        refreshData,
        addTransaction: async () => {},
        updatePortfolioName: async () => {},
        createPortolio
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context)
    throw new Error("usePortfolio must be used within PortfolioProvider");
  return context;
};

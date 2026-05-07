import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchWithRedirect } from "../hooks/useApiWithRedirect";
import { PortfolioDto } from "../../../api/src/portfolios/dto/portfolio.dto";
import { useAuth } from "../AuthContext";

interface PortfolioContextType {
  portfolio: PortfolioDto | undefined;
  portfolios: PortfolioDto[] | [];
  loadingPrices: Record<string, boolean>;
  addTransaction: (type: string, assetId: string, data: any) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  updatePortfolioName: (id: string) => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  createPortolio: (name: string, userId: string) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
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
  const [portfolios, setPortfolios] = useState<PortfolioDto[]>([]);
  console.log(`
   portfolios: ${JSON.stringify(portfolios)} 
  `);
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

  const refreshPortfolio = async (id?: string) => {
    if (!id) return;
    const res = await fetchWithRedirect(
      `http://localhost:5173/api/portfolios/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();
    setPortfolio(data);
  };

  const refreshUserPortfolios = async () => {
    // if (!id) return;
    const res = await fetchWithRedirect(
      `http://localhost:5173/api/portfolios/user/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const text = await res.text();

    if (!text) {
      console.warn("API returned empty response");
      setPortfolios([]);
      return;
    }

    if (res.ok) {
      try {
        const data = JSON.parse(text);
        setPortfolios(data);
      } catch (e) {
        console.error("Failed to parse JSON string:", e);
      }
    }
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

    await refreshPortfolio(id);
  };

  const deletePortfolio = async (id: string) => {
    console.log(`
     deleting portfoli
    `);
    const res = await fetch(`http://localhost:5173/api/portfolios/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`
     res: ${JSON.stringify(res)} 
    `);
    if (res.ok) {
      await refreshUserPortfolios();
    } else {
      console.error("Failed to delete portfolio");
    }
  };

  useEffect(() => {
    refreshPortfolio(id);
  }, [id]);

  const createPortolio = async (name: string, userId: string) => {
    const res = await fetch(`http://localhost:5173/api/portfolios`, {
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
    if (!res.ok) throw new Error("Create failed");
    console.log(`
     in create portfolio} 
    `);
    await refreshUserPortfolios();
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        portfolios,
        loadingPrices,
        deleteAsset,
        refreshPortfolio,
        addTransaction: async () => {},
        updatePortfolioName: async () => {},
        createPortolio,
        deletePortfolio,
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

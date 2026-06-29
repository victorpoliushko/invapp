import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchWithRedirect } from "../hooks/useApiWithRedirect";
import { PortfolioDto } from "../../../api/src/portfolios/dto/portfolio.dto";
import { useAuth } from "../AuthContext";

interface PortfolioContextType {
  portfolio: PortfolioDto | undefined;
  portfolios: PortfolioDto[] | [];
  loadingPrices: Record<string, boolean>;
  currentPrices: Record<string, number>;
  loadingPortfolios: boolean;
  addTransaction: (type: string, assetId: string, data: any) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  updatePortfolioName: (name: string) => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  createPortolio: (name: string, userId: string, goal?: number) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  refreshUserPortfolios: () => Promise<void>;
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
  const [loadingPrices, setLoadingPrices] = useState<Record<string, boolean>>({});
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const fetchWithRedirect = useFetchWithRedirect();
  const token = localStorage.getItem("accessToken");
  const { accessToken, userId } = useAuth();

  const updatePortfolioName = async (newName: string) => {
    if (!newName.trim() || newName === portfolio?.name) return;

    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`http://localhost:5173/api/portfolios/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, id }),
      });

      if (res.ok) {
        const updated = await res.json();
        setPortfolio(updated);
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const fetchCurrentPrices = async (assets: { assetId: string; ticker: string }[]) => {
    assets.forEach(({ assetId, ticker }) => {
      setLoadingPrices((prev) => ({ ...prev, [assetId]: true }));
      fetchWithRedirect(`http://localhost:5173/api/assets/price?asset=${ticker}`)
        .then((res) => res.json())
        .then(({ price }) => {
          setCurrentPrices((prev) => ({ ...prev, [assetId]: price }));
        })
        .finally(() => {
          setLoadingPrices((prev) => ({ ...prev, [assetId]: false }));
        });
    });
  };

  const refreshPortfolio = async () => {
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

    if (data?.portfolioAssets?.length) {
      fetchCurrentPrices(
        data.portfolioAssets.map((pa: any) => ({ assetId: pa.assetId, ticker: pa.asset.ticker }))
      );
    }
  };

  const refreshUserPortfolios = useCallback(async () => {
  setLoadingPortfolios(true);
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
      } finally {
        setLoadingPortfolios(false);
      }
    }
  }, [userId, token, fetchWithRedirect]);

  const deleteAsset = async (assetId: string) => {
    await fetch(`http://localhost:5173/api/portfolios/${id}/assets`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assetId }),
    });

    await refreshPortfolio();
  };

  const deletePortfolio = async (id: string) => {
    const res = await fetch(`http://localhost:5173/api/portfolios/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      await refreshUserPortfolios();
    } else {
      console.error("Failed to delete portfolio");
    }
  };

  useEffect(() => {
    refreshPortfolio();
  }, [id]);

  const createPortolio = async (name: string, userId: string, goal?: number) => {
    const res = await fetch(`http://localhost:5173/api/portfolios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name,
        userId,
        ...(goal !== undefined && { goal }),
      }),
    });
    if (!res.ok) throw new Error("Create failed");
    await refreshUserPortfolios();
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        portfolios,
        loadingPrices,
        currentPrices,
        loadingPortfolios,
        deleteAsset,
        refreshPortfolio,
        addTransaction: async () => {},
        updatePortfolioName,
        createPortolio,
        deletePortfolio,
        refreshUserPortfolios
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

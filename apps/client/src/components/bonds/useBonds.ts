import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { API_BASE_URL } from "../../config";
import { Bond, CouponFrequency } from "./types";

export type NewBondInput = {
  isin: string;
  name: string;
  purchasePrice: number;
  faceValue: number;
  couponRate: number;
  couponFrequency: CouponFrequency;
  quantity: number;
  purchaseDate: string;
  maturityDate: string;
};

export type BondTradeInput = {
  type: "BUY" | "SELL";
  quantity: number;
  pricePerUnit: number;
  date: string;
};

export function useBonds() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { portfolio, refreshPortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();
  const [bonds, setBonds] = useState<Bond[]>([]);

  useEffect(() => {
    if (!portfolioId) return;
    const token = localStorage.getItem("accessToken");
    fetchWithRedirect(`${API_BASE_URL}/bonds/${portfolioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setBonds)
      .catch(() => setBonds([]));
  }, [portfolioId, portfolio, fetchWithRedirect]);

  return { bonds, reload: refreshPortfolio };
}

export function useBondActions() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { refreshPortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();

  const send = async (path: string, method: string, body?: unknown) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetchWithRedirect(`${API_BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${method} ${path} failed`);
    await refreshPortfolio();
  };

  return {
    createBond: (input: NewBondInput) =>
      send("/bonds", "POST", {
        ...input,
        portfolioId,
        purchaseDate: new Date(input.purchaseDate).toISOString(),
        maturityDate: new Date(input.maturityDate).toISOString(),
      }),
    addTrade: (bondId: string, input: BondTradeInput) =>
      send(`/bonds/${bondId}/transactions`, "POST", {
        ...input,
        date: new Date(input.date).toISOString(),
      }),
    deleteBond: (bondId: string) => send(`/bonds/${bondId}`, "DELETE"),
  };
}

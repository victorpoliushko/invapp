import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { API_BASE_URL } from "../../config";

export type CashEntry = {
  id: string;
  name: string;
  currency: string;
  amount: number;
};

export type CashInput = Omit<CashEntry, "id">;

export function useCash() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { portfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();
  const [entries, setEntries] = useState<CashEntry[]>([]);

  useEffect(() => {
    if (!portfolioId) return;
    const token = localStorage.getItem("accessToken");
    fetchWithRedirect(`${API_BASE_URL}/cash/${portfolioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [portfolioId, portfolio, fetchWithRedirect]);

  return entries;
}

export function useCashActions() {
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
    createCash: (input: CashInput) => send("/cash", "POST", { ...input, portfolioId }),
    updateCash: (id: string, input: CashInput) => send(`/cash/${id}`, "PATCH", input),
    deleteCash: (id: string) => send(`/cash/${id}`, "DELETE"),
  };
}

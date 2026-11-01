import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { API_BASE_URL } from "../../config";
import { MixedAsset } from "./types";

export type NewMixedAssetInput = {
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number | null;
};

export function useMixedAssets() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { portfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();
  const [assets, setAssets] = useState<MixedAsset[]>([]);

  useEffect(() => {
    if (!portfolioId) return;
    const token = localStorage.getItem("accessToken");
    fetchWithRedirect(`${API_BASE_URL}/mixed-assets/${portfolioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setAssets)
      .catch(() => setAssets([]));
  }, [portfolioId, portfolio, fetchWithRedirect]);

  return assets;
}

export function useMixedAssetActions() {
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
    createAsset: (input: NewMixedAssetInput) =>
      send("/mixed-assets", "POST", {
        portfolioId,
        name: input.name,
        quantity: input.quantity,
        purchasePrice: input.purchasePrice,
        purchaseDate: new Date(input.purchaseDate).toISOString(),
        ...(input.currentValue != null && { currentValue: input.currentValue }),
      }),
    updateValue: (id: string, currentValue: number) => send(`/mixed-assets/${id}`, "PATCH", { currentValue }),
    deleteAsset: (id: string) => send(`/mixed-assets/${id}`, "DELETE"),
  };
}

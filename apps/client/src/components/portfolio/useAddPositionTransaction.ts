import { useParams } from "react-router-dom";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { usePortfolio } from "../../context/PortfolioContext";
import { API_BASE_URL } from "../../config";

export type PositionTransactionInput = {
  assetName: string;
  date: string;
  quantityChange: number;
  pricePerUnit: number;
  type: "BUY" | "SELL";
  coingeckoId?: string | null;
};

export function useAddPositionTransaction() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { refreshPortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();

  return async (input: PositionTransactionInput): Promise<void> => {
    if (!portfolioId) throw new Error("No portfolio selected");
    const token = localStorage.getItem("accessToken");

    const body: Record<string, unknown> = {
      assetName: input.assetName,
      date: new Date(input.date).toISOString(),
      quantityChange: input.quantityChange,
      pricePerUnit: input.pricePerUnit,
      type: input.type,
    };
    if (input.coingeckoId) body.coingeckoId = input.coingeckoId;

    const res = await fetchWithRedirect(`${API_BASE_URL}/portfolios/${portfolioId}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to add asset");

    await refreshPortfolio();
  };
}

import { useParams } from "react-router-dom";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { usePortfolio } from "../../context/PortfolioContext";
import { PortfolioDto, PositionDto } from "../../types/portfolio";
import { positionFromTrades } from "../../finance/positions";
import { cashCredit } from "../../finance/cash";
import { unitPrice } from "../../finance/valuation";

export type PositionTransactionInput = {
  assetName: string;
  date: string;
  quantityChange: number;
  pricePerUnit: number;
  type: "BUY" | "SELL";
  coingeckoId?: string | null;
};

function findPosition(portfolio: PortfolioDto | undefined, match: (p: PositionDto) => boolean) {
  const stock = portfolio?.stockPositions.find(match);
  if (stock) return { position: stock, isCrypto: false };
  const crypto = portfolio?.cryptoPositions.find(match);
  if (crypto) return { position: crypto, isCrypto: true };
  return null;
}

export function useSellAllPosition() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { portfolio, currentPrices, refreshPortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();

  return async (assetId: string): Promise<void> => {
    const found = findPosition(portfolio, (p) => p.assetId === assetId);
    if (!found) throw new Error("Position not found");
    const { position, isCrypto } = found;

    const price = unitPrice(currentPrices[assetId] ?? position.asset.currentPrice, position.price);
    const cash = cashCredit(portfolio?.cash, isCrypto ? "CRYPTO" : "STOCK", "USD", price * position.quantity);

    const res = await fetchWithRedirect(`/portfolios/${portfolioId}/assets/${assetId}/sell-all`, {
      method: "POST",
      body: JSON.stringify({ cash }),
    });
    if (!res.ok) throw new Error("Failed to sell");
    await refreshPortfolio();
  };
}

export function useAddPositionTransaction() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { portfolio, refreshPortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();

  return async (input: PositionTransactionInput): Promise<void> => {
    if (!portfolioId) throw new Error("No portfolio selected");

    const ticker = input.assetName.trim().toUpperCase();
    const found = findPosition(portfolio, (p) => p.asset.ticker.toUpperCase() === ticker);
    const isCrypto = found?.isCrypto ?? Boolean(input.coingeckoId);
    const date = new Date(input.date).toISOString();

    const trade = { type: input.type, quantityChange: input.quantityChange, pricePerUnit: input.pricePerUnit, date };
    const trades = [...(found?.position.transactions ?? []), trade];
    const held = (found?.position.quantity ?? 0);
    if (input.type === "SELL" && input.quantityChange > held + 1e-9) throw new Error("Cannot sell more than you hold");

    const position = positionFromTrades(trades);
    const cash =
      input.type === "SELL"
        ? cashCredit(portfolio?.cash, isCrypto ? "CRYPTO" : "STOCK", "USD", input.quantityChange * input.pricePerUnit)
        : undefined;

    const body: Record<string, unknown> = {
      ...(found ? { assetId: found.position.assetId } : { assetName: input.assetName }),
      date,
      quantityChange: input.quantityChange,
      pricePerUnit: input.pricePerUnit,
      type: input.type,
      position: { quantity: position.quantity, price: position.price },
      cash,
    };
    if (input.coingeckoId) body.coingeckoId = input.coingeckoId;

    const res = await fetchWithRedirect(`/portfolios/${portfolioId}/assets`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to add asset");

    await refreshPortfolio();
  };
}

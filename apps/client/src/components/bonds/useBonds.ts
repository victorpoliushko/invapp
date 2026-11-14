import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { API_BASE_URL } from "../../config";
import { Bond, CouponFrequency } from "./types";
import { bondHoldingFromTrades } from "../../finance/positions";
import { cashCredit } from "../../finance/cash";

export type NewBondInput = {
  isin: string;
  name: string;
  purchasePrice: number;
  faceValue: number;
  couponRate: number;
  couponFrequency: CouponFrequency;
  currency: string;
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
  const { portfolio, refreshPortfolio } = usePortfolio();
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

  const findBond = (bondId: string) => {
    const bond = portfolio?.bonds.find((b) => b.id === bondId);
    if (!bond) throw new Error("Bond not found");
    return bond;
  };

  const addTrade = (bondId: string, input: BondTradeInput) => {
    const bond = findBond(bondId);
    const date = new Date(input.date).toISOString();
    if (input.type === "SELL" && input.quantity > bond.quantity + 1e-9) {
      return Promise.reject(new Error("Cannot sell more bonds than are held"));
    }
    const holding = bondHoldingFromTrades([...(bond.transactions ?? []), { ...input, date }]);
    const cash =
      input.type === "SELL"
        ? cashCredit(portfolio?.cash, "GENERAL", bond.currency, input.quantity * input.pricePerUnit)
        : undefined;
    return send(`/bonds/${bondId}/transactions`, "POST", {
      ...input,
      date,
      bond: holding,
      soldOut: input.type === "SELL" && holding.quantity <= 1e-9,
      cash,
    });
  };

  const sellAllBond = (bondId: string) => {
    const bond = findBond(bondId);
    const proceeds = (bond.currentValue ?? bond.purchasePrice) * bond.quantity;
    return send(`/bonds/${bondId}/sell-all`, "POST", { cash: cashCredit(portfolio?.cash, "GENERAL", bond.currency, proceeds) });
  };

  return {
    createBond: (input: NewBondInput) =>
      send("/bonds", "POST", {
        ...input,
        portfolioId,
        purchaseDate: new Date(input.purchaseDate).toISOString(),
        maturityDate: new Date(input.maturityDate).toISOString(),
        ...(input.quantity > 0 && { transaction: { quantity: input.quantity, pricePerUnit: input.purchasePrice } }),
      }),
    addTrade,
    deleteBond: (bondId: string) => send(`/bonds/${bondId}`, "DELETE"),
    sellAllBond,
  };
}

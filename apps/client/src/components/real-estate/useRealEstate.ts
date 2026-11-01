import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { API_BASE_URL } from "../../config";
import { RealEstate, RealEstateTransaction } from "./types";

export type NewRealEstateInput = {
  name: string;
  type: string;
  purchasePrice: number;
  purchaseDate: string;
  totalArea: number | null;
  rooms: number | null;
};

export type LeaseInput = { monthlyRent: number; startDate: string; endDate: string };

export function useRealEstate() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { portfolio, refreshPortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();
  const [properties, setProperties] = useState<RealEstate[]>([]);

  useEffect(() => {
    if (!portfolioId) return;
    const token = localStorage.getItem("accessToken");
    fetchWithRedirect(`${API_BASE_URL}/real-estate/${portfolioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setProperties)
      .catch(() => setProperties([]));
  }, [portfolioId, portfolio, fetchWithRedirect]);

  return { properties, reload: refreshPortfolio };
}

export function useRealEstateActions() {
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

  const iso = (date: string) => new Date(date).toISOString();

  return {
    createProperty: (input: NewRealEstateInput) =>
      send("/real-estate", "POST", {
        ...input,
        portfolioId,
        purchaseDate: iso(input.purchaseDate),
        totalArea: input.totalArea ?? undefined,
        rooms: input.rooms ?? undefined,
      }),
    deleteProperty: (id: string) => send(`/real-estate/${id}`, "DELETE"),
    lend: (realEstateId: string, input: LeaseInput) =>
      send("/real-estate/transaction", "POST", {
        realEstateId,
        monthlyRent: input.monthlyRent,
        startDate: iso(input.startDate),
        endDate: iso(input.endDate),
      }),
    terminate: (lease: RealEstateTransaction) =>
      send(`/real-estate/transaction/${lease.id}`, "PATCH", {
        startDate: lease.startDate,
        endDate: new Date().toISOString(),
        monthlyRent: lease.monthlyRent,
      }),
  };
}

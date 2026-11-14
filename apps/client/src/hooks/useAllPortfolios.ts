import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { PortfolioDto } from "../types/portfolio";
import { useFetchWithRedirect } from "./useApiWithRedirect";

export function useAllPortfolios(): PortfolioDto[] | null {
  const { userId } = useAuth();
  const fetchWithRedirect = useFetchWithRedirect();
  const [portfolios, setPortfolios] = useState<PortfolioDto[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchWithRedirect(`/portfolios/user/${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setPortfolios(data);
      })
      .catch(() => {
        if (!cancelled) setPortfolios(null);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, fetchWithRedirect]);

  return portfolios;
}

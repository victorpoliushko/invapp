import { useEffect, useState } from "react";
import { useFetchWithRedirect } from "./useApiWithRedirect";
import { API_BASE_URL } from "../config";

export type StockSuggestion = { assetSymbol: string; name: string };
export type CryptoSuggestion = { id: string; symbol: string; name: string };
export type AssetSuggestion = StockSuggestion | CryptoSuggestion;

export function isCryptoSuggestion(s: AssetSuggestion): s is CryptoSuggestion {
  return "id" in s;
}

export function useAssetSearch(searchTerm: string, assetType: "stock" | "crypto", enabled: boolean) {
  const fetchWithRedirect = useFetchWithRedirect();
  const [suggestions, setSuggestions] = useState<AssetSuggestion[]>([]);

  useEffect(() => {
    if (!enabled || !searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const token = localStorage.getItem("accessToken");
    const endpoint =
      assetType === "crypto"
        ? `${API_BASE_URL}/assets/search-crypto?q=${searchTerm}`
        : `${API_BASE_URL}/assets/search?q=${searchTerm}`;

    const timer = setTimeout(async () => {
      try {
        const response = await fetchWithRedirect(endpoint, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch suggestions");
        setSuggestions(await response.json());
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, assetType, enabled, fetchWithRedirect]);

  return { suggestions, clearSuggestions: () => setSuggestions([]) };
}

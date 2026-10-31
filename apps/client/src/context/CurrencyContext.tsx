import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { API_BASE_URL } from "../config";

export const CURRENCIES = ["USD", "EUR", "UAH"] as const;
export type Currency = (typeof CURRENCIES)[number];

type Rates = Record<string, number>;

type CurrencyContextType = {
  defaultCurrency: Currency;
  setDefaultCurrency: (currency: Currency) => Promise<void>;
  ratesDate: string | null;
  fromUsd: (amountUsd: number, to: string) => number;
  convert: (amount: number, from: string, to: string) => number;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${localStorage.getItem("accessToken")}` };
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [defaultCurrency, setDefault] = useState<Currency>("USD");
  const [rates, setRates] = useState<Rates | null>(null);
  const [ratesDate, setRatesDate] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/fx/rates`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setRates(data.rates);
        setRatesDate(data.date);
      })
      .catch(() => setRates(null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/users/${userId}`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user?.defaultCurrency) setDefault(user.defaultCurrency);
      })
      .catch(() => {});
  }, [userId]);

  const setDefaultCurrency = useCallback(
    async (currency: Currency) => {
      if (!userId) return;
      const previous = defaultCurrency;
      setDefault(currency);
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ defaultCurrency: currency }),
      });
      if (!res.ok) {
        setDefault(previous);
        throw new Error("Failed to save default currency");
      }
    },
    [userId, defaultCurrency],
  );

  const convert = useCallback(
    (amount: number, from: string, to: string) => {
      if (from === to || !rates) return amount;
      const fromRate = rates[from];
      const toRate = rates[to];
      if (!fromRate || !toRate) return amount;
      return (amount / fromRate) * toRate;
    },
    [rates],
  );

  const fromUsd = useCallback((amountUsd: number, to: string) => convert(amountUsd, "USD", to), [convert]);

  return (
    <CurrencyContext.Provider value={{ defaultCurrency, setDefaultCurrency, ratesDate, fromUsd, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}

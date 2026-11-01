import { useEffect, useState } from "react";
import { useFetchWithRedirect } from "../hooks/useApiWithRedirect";
import { useCurrency } from "../context/CurrencyContext";
import { API_BASE_URL } from "../config";
import { formatCurrency, gainColor, signedCurrency, signedPct } from "../utils/money";
import "./marketData.css";

type MarketQuote = {
  symbol: string;
  title: string;
  price: number;
  change: number;
  changePct: number;
};

const REFRESH_MS = 60 * 1000;

export default function MarketTicker() {
  const fetchWithRedirect = useFetchWithRedirect();
  const { defaultCurrency, fromUsd } = useCurrency();
  const [quotes, setQuotes] = useState<MarketQuote[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      const token = localStorage.getItem("accessToken");
      fetchWithRedirect(`${API_BASE_URL}/assets/market-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data) setQuotes(data);
        })
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [fetchWithRedirect]);

  if (quotes === null) return <p className="market-status">Loading market data…</p>;
  if (quotes.length === 0) return <p className="market-status">Market data is unavailable right now.</p>;

  return (
    <div className="market-quotes">
      {quotes.map((q) => (
        <div key={q.symbol} className="market-quote">
          <div className="market-quote-header">
            <span className="market-quote-title">{q.title}</span>
            <span className="market-quote-symbol">{q.symbol}</span>
          </div>
          <span className="market-quote-price">
            {formatCurrency(fromUsd(q.price, defaultCurrency), defaultCurrency, 2)}
          </span>
          <span className="market-quote-change" style={{ color: gainColor(q.changePct) }}>
            {signedPct(q.changePct, 2)}
            <span className="market-quote-change-abs">
              {signedCurrency(fromUsd(q.change, defaultCurrency), defaultCurrency, 2)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

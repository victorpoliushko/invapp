import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { usePortfolio } from "../../context/PortfolioContext";
import { TRANSACTION_COLORS } from "./transactionColors";

type StockSuggestion = { assetSymbol: string; name: string };
type CryptoSuggestion = { id: string; symbol: string; name: string };
type Suggestion = StockSuggestion | CryptoSuggestion;

function isCrypto(s: Suggestion): s is CryptoSuggestion {
  return "id" in s;
}

export function AddAsset({ assetType = "stock" }: { assetType?: "stock" | "crypto" }) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { refreshPortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const [selectedCoingeckoId, setSelectedCoingeckoId] = useState<string | null>(null);

  const [transactionType, setTransactionType] = useState<"BUY" | "SELL">("BUY");
  const [newAsset, setNewAsset] = useState({
    assetName: "",
    dueDate: "",
    quantityChange: "",
    pricePerUnit: "",
  });

  useEffect(() => {
    if (!autocompleteEnabled || !searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const token = localStorage.getItem("accessToken");
    const endpoint =
      assetType === "crypto"
        ? `http://localhost:5173/api/assets/search-crypto?q=${searchTerm}`
        : `http://localhost:5173/api/assets/search?q=${searchTerm}`;

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
  }, [searchTerm, assetType]);

  const handleAddAsset = async () => {
    const { assetName, dueDate, quantityChange, pricePerUnit } = newAsset;
    if (!portfolioId || !assetName || !dueDate || !quantityChange || !pricePerUnit) return;

    const token = localStorage.getItem("accessToken");

    try {
      const body: Record<string, unknown> = {
        assetName,
        date: new Date(dueDate).toISOString(),
        quantityChange: Number(quantityChange),
        pricePerUnit: Number(pricePerUnit),
        type: transactionType,
      };
      if (assetType === "crypto" && selectedCoingeckoId) {
        body.coingeckoId = selectedCoingeckoId;
      }

      const res = await fetchWithRedirect(
        `http://localhost:5173/api/portfolios/${portfolioId}/assets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) throw new Error("Failed to add asset");

      setNewAsset({ assetName: "", dueDate: "", quantityChange: "", pricePerUnit: "" });
      setSearchTerm("");
      setSuggestions([]);
      setSelectedCoingeckoId(null);
      setAutocompleteEnabled(true);
      await refreshPortfolio();
    } catch (err) {
      console.error("Add asset error:", err);
    }
  };

  return (
    <tr>
      <td>
        <div style={{ display: "flex", gap: 2 }}>
          {(["BUY", "SELL"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTransactionType(t)}
              style={{
                color: TRANSACTION_COLORS[t],
                fontWeight: transactionType === t ? "bold" : "normal",
                opacity: transactionType === t ? 1 : 0.4,
                padding: "2px 6px",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </td>
      <td>
        <div className="asset-autocomplete">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setAutocompleteEnabled(true);
              setSearchTerm(e.target.value);
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddAsset(); }}
            placeholder={assetType === "crypto" ? "Search crypto" : "Asset"}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.slice(0, 5).map((s) =>
                isCrypto(s) ? (
                  <li
                    key={s.id}
                    title={s.name}
                    onClick={() => {
                      setSearchTerm(s.symbol);
                      setNewAsset({ ...newAsset, assetName: s.symbol });
                      setSelectedCoingeckoId(s.id);
                      setSuggestions([]);
                      setAutocompleteEnabled(false);
                    }}
                  >
                    {s.symbol} — {s.name}
                  </li>
                ) : (
                  <li
                    key={s.assetSymbol}
                    title={s.name}
                    onClick={() => {
                      setSearchTerm(s.assetSymbol);
                      setNewAsset({ ...newAsset, assetName: s.assetSymbol });
                      setSuggestions([]);
                      setAutocompleteEnabled(false);
                    }}
                  >
                    {s.assetSymbol} — {s.name}
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </td>
      <td>
        <input
          type="date"
          value={newAsset.dueDate}
          onChange={(e) => setNewAsset({ ...newAsset, dueDate: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") handleAddAsset(); }}
        />
      </td>
      <td>
        <input
          type="number"
          value={newAsset.quantityChange}
          onChange={(e) => setNewAsset({ ...newAsset, quantityChange: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") handleAddAsset(); }}
          placeholder="Quantity"
        />
      </td>
      <td>
        <input
          type="number"
          value={newAsset.pricePerUnit}
          onChange={(e) => setNewAsset({ ...newAsset, pricePerUnit: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") handleAddAsset(); }}
          placeholder="Price"
        />
      </td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>
        <button onClick={handleAddAsset}>Add</button>
      </td>
    </tr>
  );
}

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { usePortfolio } from "../../context/PortfolioContext";
import { TRANSACTION_COLORS } from "./transactionColors";
import { alertMissingFields } from "../../utils/formValidation";

type StockSuggestion = { assetSymbol: string; name: string };
type CryptoSuggestion = { id: string; symbol: string; name: string };
type Suggestion = StockSuggestion | CryptoSuggestion;

function isCrypto(s: Suggestion): s is CryptoSuggestion {
  return "id" in s;
}

export function AddAsset({
  assetType = "stock",
  totalPositionSum,
}: {
  assetType?: "stock" | "crypto";
  totalPositionSum: number;
}) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { refreshPortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const [selectedCoingeckoId, setSelectedCoingeckoId] = useState<string | null>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (suggestions.length === 0) {
      setDropdownRect(null);
      return;
    }

    const updateRect = () => {
      const el = autocompleteRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width });
    };

    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [suggestions]);

  const handleAddAsset = async () => {
    if (!portfolioId) return;
    const { assetName, dueDate, quantityChange, pricePerUnit } = newAsset;
    if (alertMissingFields({
      Asset: assetName,
      Date: dueDate,
      Quantity: quantityChange,
      Price: pricePerUnit,
    })) return;

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
      alert("Failed to add asset");
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
        <div className="asset-autocomplete" ref={autocompleteRef}>
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
          {suggestions.length > 0 && dropdownRect && createPortal(
            <ul
              className="suggestions-list"
              style={{
                position: "fixed",
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
              }}
            >
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
            </ul>,
            document.body,
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
      <td data-label="Total position" style={{ fontWeight: 600, textAlign: "right" }}>
        {totalPositionSum > 0 ? Math.round(totalPositionSum).toLocaleString() : "—"}
      </td>
      <td></td>
      <td>
        <button onClick={handleAddAsset}>Add</button>
      </td>
    </tr>
  );
}

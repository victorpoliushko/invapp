import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AssetType } from "../../pages/portfolio/PortfolioPage";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { usePortfolio } from "../../context/PortfolioContext";

export function AddAsset() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const { refreshPortfolio } = usePortfolio();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<AssetType[]>([]);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const fetchWithRedirect = useFetchWithRedirect();
  const [newAsset, setNewAsset] = useState({
    assetName: "",
    dueDate: "",
    quantityChange: "",
    pricePerUnit: "",
  });

  useEffect(() => {
    if (!autocompleteEnabled) return;
    const token = localStorage.getItem("accessToken");

    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetchWithRedirect(
          `http://localhost:5173/api/assets/search?q=${searchTerm}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch asset suggestions");
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAddAsset = async () => {
    const { assetName, dueDate, quantityChange, pricePerUnit } = newAsset;
    if (!portfolioId || !assetName || !dueDate || !quantityChange || !pricePerUnit) return;

    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetchWithRedirect(
        `http://localhost:5173/api/portfolios/${portfolioId}/assets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assetName,
            date: new Date(dueDate).toISOString(),
            quantityChange: Number(quantityChange),
            pricePerUnit: Number(pricePerUnit),
            type: "BUY",
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to add asset");

      setNewAsset({ assetName: "", dueDate: "", quantityChange: "", pricePerUnit: "" });
      setSearchTerm("");
      setSuggestions([]);
      setAutocompleteEnabled(true);
      await refreshPortfolio();
    } catch (err) {
      console.error("Add asset error:", err);
    }
  };

  return (
    <tr>
      <td></td>
      <td>
        <div className="asset-autocomplete">
          <input
            type="text"
            name="asset"
            value={searchTerm}
            onChange={(e) => {
              setAutocompleteEnabled(true);
              setSearchTerm(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddAsset();
            }}
            required
            placeholder="Asset"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.slice(0, 5).map((s) => (
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
              ))}
            </ul>
          )}
        </div>
      </td>
      <td>
        <input
          type="date"
          name="dueDate"
          value={newAsset.dueDate}
          onChange={(e) => setNewAsset({ ...newAsset, dueDate: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddAsset();
          }}
          required
        />
      </td>
      <td>
        <input
          type="number"
          name="quantityChange"
          value={newAsset.quantityChange}
          onChange={(e) => setNewAsset({ ...newAsset, quantityChange: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddAsset();
          }}
          required
          placeholder="Quantity"
        />
      </td>
      <td>
        <input
          type="number"
          name="pricePerUnit"
          value={newAsset.pricePerUnit}
          onChange={(e) => setNewAsset({ ...newAsset, pricePerUnit: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddAsset();
          }}
          required
          placeholder="Price"
        />
      </td>
      <td></td>
      <td></td>
      <td>
        <button onClick={handleAddAsset}>Add</button>
      </td>
    </tr>
  );
}

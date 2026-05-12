import { useEffect, useState } from "react";
import { AssetType } from "../../pages/portfolio/PortfolioPage";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";

export function AddAsset() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<AssetType[]>([]);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const fetchWithRedirect = useFetchWithRedirect();
    const [newAsset, setNewAsset] = useState<{
      assetName: string;
      dueDate: string;
      quantityChange: string;
      // period: string;
      pricePerUnit: number;
    }>({
      assetName: "",
      dueDate: "",
      quantityChange: "",
      // period: "",
      pricePerUnit: 0,
    });

  // set suggestions on search
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

  return (
    <tr>
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
              // if (e.key === "Enter") handleAddAsset();
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
                    setNewAsset({
                      ...newAsset,
                      assetName: s.assetSymbol,
                    });
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
          value={"mock bonds data"}
          // onChange={handleChange}
          onKeyDown={(e) => {
            // if (e.key === "Enter") handleAddAsset();
          }}
          required
        />
      </td>
      <td>
        <input
          type="number"
          name="quantityChange"
          value={"mock bonds data"}
          // onChange={handleChange}
          onKeyDown={(e) => {
            // if (e.key === "Enter") handleAddAsset();
          }}
          required
          placeholder="Quantity"
        />
      </td>
      <td>
        <input
          type="text"
          name="pricePerUnit"
          value={"mock bonds data"}
          // onChange={handleChange}
          onKeyDown={(e) => {
            // if (e.key === "Enter") handleAddAsset();
          }}
          required
          placeholder="Period"
        />
      </td>
    </tr>
  );
}

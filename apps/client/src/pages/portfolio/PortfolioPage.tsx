import { useParams } from "react-router-dom";
import "../../App.css";
import "./PortfolioPage.css";
import React, { useEffect, useState } from "react";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import type { PortfolioDto } from "../../../../api/src/portfolios/dto/portfolio.dto";
import { fetchPortfolio, fetchPortfolioPrices } from "../../api";

// export type AssetType = {
//   name: string;
//   assetSymbol: string;
//   exchange: string;
//   type: string;
//   pricePerUnit: number;
// };

// export type PortfolioType = {
//   id: string;
//   name: string;
//   userId: string;
//   assets: Array<{
//     portfolioId: string;
//     assetId: string;
//     quantityChange: number;
//     pricePerUnit: number;
//     avgBuyPrice: number;
//     assets: {
//       id: string;
//       name: string;
//       asset: string;
//       exchange: string;
//       type: string;
//       dataSource: string;
//       updatedAt: string;
//     };
//   }>;
// };

export enum TransactionType {
  BUY = "BUY",
  SELL = "SELL",
}

export default function PortfolioPage() {
  const params = useParams<{ id: string }>();
  const fetchWithRedirect = useFetchWithRedirect();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<AssetType[]>([]);

  const [selectedTab, setSelectedTab] = useState("tab-stocks");
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
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  // get portfolio info
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const fetchPortfolio = async () => {
      const response = await fetchWithRedirect(
        `http://localhost:5173/api/portfolios/${params.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const portfolio = await response.json();
      console.log(`
       portfolio: ${JSON.stringify(portfolio)} 
      `);
      setPortfolio(portfolio);
    };

    if (params.id) {
      fetchPortfolio();
    }
  }, [params.id]);

  const [portfolio, setPortfolio] = useState<PortfolioDto>();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const fetchPrice = async () => {
      portfolio &&
        portfolio.assets.forEach(async (s) => {
          const response = await fetchWithRedirect(
            `http://localhost:5173/api/assets/pricePerUnit?asset=${s.assets.asset}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          s.price = data.pricePerUnit;
        });
    };
    fetchPrice();
  }, []);

  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);

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
          }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAsset((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTransaction = async (
    portfolioId: string,
    type: TransactionType,
    assetId?: string
  ) => {
    const { assetName, dueDate, quantityChange, pricePerUnit } = newAsset;

    const newTransaction = {
      pricePerUnit: Number(pricePerUnit),
      quantityChange: Number(quantityChange),
      date: new Date(dueDate).toISOString(),
      type,
      portfolioId,
      assetName: assetName || undefined,
      assetId: assetId || undefined,
    };
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`/api/transactions`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTransaction),
      });
      console.log(await res.json());
    } catch (error) {}
  };

  const onDeleteAsset = async (index: any) => {
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`/api/portfolios/${params.id}/assets`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assetId: index }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        console.error("Error response:", errorBody);
        throw new Error("Failed to delete stock");
      }

      const updatedPortfolio = await res.json();
      setPortfolio(updatedPortfolio);

      alert("Asset removed successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting a stock");
    }
  };

  const onUpdatePortfolio = async (portfolioId: any, updatedName: string) => {
    if (!updatedName.trim() || updatedName === portfolio?.name) {
      setIsEditing(false);
      return;
    }
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`/api/portfolios/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: portfolioId, name: updatedName }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        console.error("Error response:", errorBody);
        throw new Error("Failed to update portfolio");
      }

      const updatedPortfolio = await res.json();
      setPortfolio(updatedPortfolio);
      setNewName(updatedPortfolio.name);
      setIsEditing(false);

      alert("Portfolio updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error update portfolio");
    }
  };

  const onDeletePortfolio = async (portfolioId?: string) => {
    const token = localStorage.getItem("accessToken");

    if (portfolioId) {
      try {
        const res = await fetchWithRedirect(`/api/portfolios/${portfolioId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          console.error("Error response:", errorBody);
          throw new Error("Failed to delete portfolio");
        }

        alert("Portfolio deleted successfully!");
      } catch (err) {
        console.error(err);
        alert("Error update portfolio");
      }
    }
    alert("Portfolio not found");
  };

  const loadPortfolioData = async () => {
    const portfolioData = await fetchPortfolio(portfolio?.id);
    setPortfolio(portfolioData);
    const priceData = await fetchPortfolioPrices(portfolio?.id);
    setPortfolio((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        assets: prev.assets.map((asset) => {
          const match = priceData.find((p) => p.assetId === asset.assetId);
          return {
            ...asset,
            currentPrice: match ? match.actualPrice : undefined,
          };
        }),
      };
    });
  };

  const [expandedAssetId, setExpandedAssetId] = useState(null);

  const toggleExpand = (assetId: string) => {
    setExpandedAssetId(assetId === expandedAssetId ? null : assetId);
  };
  const COLUMN_COUNT = 7;

  const clearInputs = () => {
    setSearchTerm("");
    setSuggestions([]);
    setAutocompleteEnabled(false);

    setNewAsset({
      assetName: "",
      dueDate: "",
      quantityChange: "",
      // period: "",
      pricePerUnit: 0,
    });
  };

  // console.log(`
  //  portfolio: ${JSON.stringify(portfolio)}
  // `);

  if (!portfolio) {
    return null;
  }

  return (
    <>
      <section className="assets-section section-container">
        {isEditing ? (
          <>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && portfolio?.id) {
                  onUpdatePortfolio(portfolio.id, newName);
                }
              }}
              className="assets-h1-input"
              autoFocus
            />
            {portfolio?.id && (
              <button
                onClick={() => onUpdatePortfolio(portfolio.id, newName)}
                title="Save changes"
              >
                Save
              </button>
            )}
            {portfolio?.id && (
              <button
                onClick={() => {
                  setNewName(portfolio.name || "");
                  setIsEditing(false);
                }}
                title="Cancel editing"
              >
                Cancel
              </button>
            )}
          </>
        ) : (
          <h1 className="assets-h1">{portfolio?.name}</h1>
        )}
        {portfolio?.id && (
          <button
            onClick={() => {
              if (isEditing) {
                onUpdatePortfolio(portfolio.id, newName);
              } else {
                setNewName(portfolio.name || "");
                setIsEditing(true);
              }
            }}
            title={isEditing ? "Save changes" : "Edit portfolio name"}
          >
            <img
              className="edit-icon"
              src={editIcon}
              alt={isEditing ? "Save icon" : "Edit icon"}
              height={30}
              width={30}
            />
          </button>
        )}
        <button
          onClick={() => onDeletePortfolio(portfolio?.id)}
          title={`Remove portfolio`}
        >
          <img
            className="delete-icon"
            src={deleteIcon}
            alt="delete-icon"
            height={30}
            width={30}
          />
        </button>

        <div className="assets">
          <input
            type="radio"
            name="tabs"
            id="tab-stocks"
            checked={selectedTab === "tab-stocks"}
            onChange={() => setSelectedTab("tab-stocks")}
          />
          <label htmlFor="tab-stocks">Stocks</label>

          <div className="tab">
            <table className="assets-table">
              <thead>
                <tr>
                  <th></th>
                  <th scope="col">Asset</th>
                  <th scope="col">Date</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Avg pricePerUnit</th>
                  <th scope="col">Current pricePerUnit</th>
                  <th scope="col">% change</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio &&
                  portfolio.assets.map((s) => (
                    <React.Fragment key={s.assetId}>
                      <tr>
                        {/* 1A. EXPAND/COLLAPSE COLUMN */}
                        <td data-label="expand">
                          <button
                            onClick={() => toggleExpand(s.assetId)}
                            title={
                              expandedAssetId === s.assetId
                                ? "Collapse Details"
                                : "Expand Details"
                            }
                            style={{ marginRight: "10px" }} // Added a small style for spacing
                          >
                            {expandedAssetId === s.assetId ? "▼" : "►"}
                          </button>
                        </td>
                        {/* Original Columns (Shifted by 1 due to new expand column) */}
                        <td data-label="asset">{s.assets.asset}</td>
                        <td data-label="date">{s.assets.updatedAt}</td>
                        <td data-label="quantityChange">{s.quantity}</td>
                        <td data-label="current-pricePerUnit">{s.price}</td>
                        <td data-label="pricePerUnit">{}</td>
                        <td data-label="asset">test name</td>
                        <td data-label="actions">
                          <button
                            onClick={() => onDeleteAsset(s.assetId)}
                            title={`Remove ${s.assets.asset}`}
                          >
                            <img
                              className="delete-icon"
                              src={deleteIcon}
                              alt="delete-icon"
                              height={30}
                              width={30}
                            />
                          </button>
                        </td>
                      </tr>
                      {expandedAssetId === s.assetId && (
                        <tr className="detail-row">
                          <td colSpan={COLUMN_COUNT + 1}>
                            <div>
                              <table>
                                <thead>
                                  <tr>
                                    {/* <th></th> */}
                                    <th scope="col">Transactions</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Asset</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Quantity</th>
                                    <th scope="col">Price change</th>
                                    <th scope="col">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {s.assets.transactions?.map((t) => (
                                    <React.Fragment key={s.assetId}>
                                      <tr>
                                        <td data-label="actions">
                                          <button
                                            onClick={() =>
                                              onDeleteAsset(s.assetId)
                                            }
                                            title={`Remove ${s.assets.asset}`}
                                          >
                                            <img
                                              className="edit-icon"
                                              src={editIcon}
                                              alt="edit-icon"
                                              height={30}
                                              width={30}
                                            />
                                          </button>
                                        </td>
                                        <td>{t.type}</td>
                                        <td>{s.assets.asset}</td>
                                        <td>{t.date}</td>
                                        <td>{t.quantityChange}</td>
                                        <td>{t.pricePerUnit}</td>
                                        <td data-label="actions">
                                          <button
                                            onClick={() =>
                                              onDeleteAsset(s.assetId)
                                            }
                                            title={`Remove ${s.assets.asset}`}
                                          >
                                            <img
                                              className="delete-icon"
                                              src={deleteIcon}
                                              alt="delete-icon"
                                              height={30}
                                              width={30}
                                            />
                                          </button>
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  ))}

                                  {/* <tr>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="edit-icon"
                                          src={editIcon}
                                          alt="edit-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                    <td>VOO</td>
                                    <td>2025-11-24</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="delete-icon"
                                          src={deleteIcon}
                                          alt="delete-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="edit-icon"
                                          src={editIcon}
                                          alt="edit-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                    <td>VOO</td>
                                    <td>2025-11-24</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="delete-icon"
                                          src={deleteIcon}
                                          alt="delete-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="edit-icon"
                                          src={editIcon}
                                          alt="edit-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                    <td>VOO</td>
                                    <td>2025-11-24</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="delete-icon"
                                          src={deleteIcon}
                                          alt="delete-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                  </tr> */}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
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
                          if (e.key === "Enter") {
                            // handleAddAsset();
                            handleAddTransaction(
                              portfolio?.id,
                              TransactionType.BUY
                            );
                          }
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
                      value={newAsset.dueDate}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          // handleAddAsset();
                          handleAddTransaction(
                            portfolio?.id,
                            TransactionType.BUY
                          );
                      }}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="quantityChange"
                      value={newAsset.quantityChange}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          // handleAddAsset();
                          handleAddTransaction(
                            portfolio?.id,
                            TransactionType.BUY
                          );
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
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          // handleAddAsset();
                          handleAddTransaction(
                            portfolio?.id,
                            TransactionType.BUY
                          );
                      }}
                      required
                      placeholder="Price bought"
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td>
                    <button onClick={clearInputs} title={`Clear`}>
                      <img
                        className="delete-icon"
                        src={deleteIcon}
                        alt="delete-icon"
                        height={30}
                        width={30}
                      />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <input
            type="radio"
            name="tabs"
            id="tab-bonds"
            onChange={() => setSelectedTab("tab-bonds")}
            checked={selectedTab === "tab-bonds"}
          />
          <label htmlFor="tab-bonds">Bonds</label>
          <div className="tab">
            <table>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Account">Bond - 3412</td>
                  <td data-label="Due Date">04/01/2016</td>
                  <td data-label="Quantity">$1,190</td>
                  <td data-label="Period">03/01/2016 - 03/31/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">
                    Bond - 6076
                  </td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Quantity">$2,443</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
                </tr>
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
                      value={newAsset.dueDate}
                      onChange={handleChange}
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
                      value={newAsset.quantityChange}
                      onChange={handleChange}
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
                      value={newAsset.pricePerUnit}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        // if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                      placeholder="Period"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <input
            type="radio"
            name="tabs"
            id="tab-realestate"
            onChange={() => setSelectedTab("tab-realestate")}
            checked={selectedTab === "tab-realestate"}
          />
          <label htmlFor="tab-realestate">Real estate</label>
          <div className="tab">
            <table>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Account">Real estate - 3412</td>
                  <td data-label="Due Date">04/01/2016</td>
                  <td data-label="Quantity">$1,190</td>
                  <td data-label="Period">03/01/2016 - 03/31/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">
                    Real estate - 6076
                  </td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Quantity">$2,443</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
                </tr>
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
                      value={newAsset.dueDate}
                      onChange={handleChange}
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
                      value={newAsset.quantityChange}
                      onChange={handleChange}
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
                      value={newAsset.pricePerUnit}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        // if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                      placeholder="Period"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <input
            type="radio"
            name="tabs"
            id="tab-crypto"
            onChange={() => setSelectedTab("tab-crypto")}
            checked={selectedTab === "tab-crypto"}
          />
          <label htmlFor="tab-crypto">Crypto</label>
          <div className="tab">
            <table>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Account">Crypto - 3412</td>
                  <td data-label="Due Date">04/01/2016</td>
                  <td data-label="Quantity">$1,190</td>
                  <td data-label="Period">03/01/2016 - 03/31/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">
                    Crypto - 6076
                  </td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Quantity">$2,443</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
                </tr>
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
                      value={newAsset.dueDate}
                      onChange={handleChange}
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
                      value={newAsset.quantityChange}
                      onChange={handleChange}
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
                      value={newAsset.pricePerUnit}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        // if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                      placeholder="Period"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="gains-section section-container"></section>
    </>
  );
}

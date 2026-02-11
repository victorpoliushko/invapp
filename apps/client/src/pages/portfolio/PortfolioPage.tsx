import { useParams } from "react-router-dom";
import "../../App.css";
import "./PortfolioPage.css";
import React, { useEffect, useState } from "react";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import type { PortfolioDto } from "../../../../api/src/portfolios/dto/portfolio.dto";
import { fetchPortfolio } from "../../api";

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

      setPortfolio(portfolio);
      loadPortfolioData(params.id);
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
        portfolio.portfolioAssets.forEach(async (s) => {
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

  const loadPortfolioData = async (portfolioId?: string) => {
    if (!portfolioId) return;

    const portfolioData = await fetchPortfolio(portfolioId);
    setPortfolio(portfolioData);

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (const asset of portfolioData.portfolioAssets) {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetchWithRedirect(
          `http://localhost:5173/api/assets/pricePerUnit?asset=${asset.assets.asset}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        const livePrice = data.pricePerUnit;

        setPortfolio((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            assets: prev.portfolioAssets.map((a) =>
              a.assetId === asset.assetId
                ? { ...a, currentPrice: livePrice }
                : a
            ),
          };
        });

        await delay(12500);
      } catch (err) {
        console.error(`Failed to fetch price for ${asset.assets.ticker}`, err);
      }
    }
  };

  // console.log(`
  //   portfolio: ${JSON.stringify(portfolio)}
  // `);

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

  console.log(`
   portfolio: ${JSON.stringify(portfolio)}
  `);

  [
    {
      id: "140f5933-6f4b-424f-86c3-3f350a2b1293",
      name: "Katrusia super portfolio 22",
      userId: "13ee5312-1a96-4ed2-a271-da54b338b708",
      assets: [
        {
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "6c4220af-c081-406f-bfee-8f1d866d09e7",
          quantity: 5,
          price: 200,
          assets: {
            id: "6c4220af-c081-406f-bfee-8f1d866d09e7",
            asset: "GOOG",
            name: null,
            type: null,
            exchange: null,
            dataSource: null,
            updatedAt: "2025-12-06T09:12:40.521Z",
            transactions: [],
          },
        },
        {
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "52601abc-a44e-4a3c-b3a1-a095d88daa0a",
          quantity: 1,
          price: 30,
          assets: {
            id: "52601abc-a44e-4a3c-b3a1-a095d88daa0a",
            asset: "CCLAF",
            name: null,
            type: null,
            exchange: null,
            dataSource: null,
            updatedAt: "2025-12-09T10:19:12.777Z",
            transactions: [],
          },
        },
        {
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9d86eeaa-f619-41e7-9f95-9f7f1b6ec517",
          quantity: 3,
          price: 3,
          assets: {
            id: "9d86eeaa-f619-41e7-9f95-9f7f1b6ec517",
            asset: "VV5.FRK",
            name: null,
            type: null,
            exchange: null,
            dataSource: null,
            updatedAt: "2025-12-09T10:20:28.431Z",
            transactions: [],
          },
        },
        {
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "6d9632f0-f807-4aee-963c-2b62636353ed",
          quantity: 2,
          price: 56,
          assets: {
            id: "6d9632f0-f807-4aee-963c-2b62636353ed",
            asset: "J0C.FRK",
            name: null,
            type: null,
            exchange: null,
            dataSource: null,
            updatedAt: "2025-12-09T10:22:41.168Z",
            transactions: [],
          },
        },
        {
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "cbc443a6-a316-4616-baf5-ed3aad386dee",
          quantity: 4,
          price: 67,
          assets: {
            id: "cbc443a6-a316-4616-baf5-ed3aad386dee",
            asset: "N09.FRK",
            name: null,
            type: null,
            exchange: null,
            dataSource: null,
            updatedAt: "2025-12-17T15:26:59.159Z",
            transactions: [],
          },
        },
        {
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
          quantity: 8,
          price: 7,
          assets: {
            id: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
            asset: "VOO",
            name: null,
            type: null,
            exchange: null,
            dataSource: null,
            updatedAt: "2025-11-24T14:18:21.556Z",
            transactions: [
              {
                id: "754042a1-b593-485f-94c4-975258aba67c",
                portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
                assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
                type: "BUY",
                quantityChange: 2,
                pricePerUnit: 2,
                date: "2026-01-25T00:00:00.000Z",
              },
              {
                id: "a9d72498-c0cd-4bea-a40a-491c835f23d1",
                portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
                assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
                type: "BUY",
                quantityChange: 6,
                pricePerUnit: 8,
                date: "2026-01-24T00:00:00.000Z",
              },
              {
                id: "efe73b76-270e-4aec-a20d-2c99bd9301c0",
                portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
                assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
                type: "BUY",
                quantityChange: 6,
                pricePerUnit: 8,
                date: "2026-01-24T00:00:00.000Z",
              },
              {
                id: "7a26565e-48a4-4f0e-a935-fee2c34c5d69",
                portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
                assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
                type: "BUY",
                quantityChange: 25,
                pricePerUnit: 33,
                date: "2026-01-16T00:00:00.000Z",
              },
              {
                id: "37c198e8-76d7-43a1-a549-81b559620fe4",
                portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
                assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
                type: "BUY",
                quantityChange: 22,
                pricePerUnit: 23,
                date: "2026-01-08T00:00:00.000Z",
              },
            ],
          },
        },
      ],
      transactions: [
        {
          id: "37c198e8-76d7-43a1-a549-81b559620fe4",
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
          type: "BUY",
          quantityChange: 22,
          pricePerUnit: 23,
          date: "2026-01-08T00:00:00.000Z",
        },
        {
          id: "7a26565e-48a4-4f0e-a935-fee2c34c5d69",
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
          type: "BUY",
          quantityChange: 25,
          pricePerUnit: 33,
          date: "2026-01-16T00:00:00.000Z",
        },
        {
          id: "a9d72498-c0cd-4bea-a40a-491c835f23d1",
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
          type: "BUY",
          quantityChange: 6,
          pricePerUnit: 8,
          date: "2026-01-24T00:00:00.000Z",
        },
        {
          id: "efe73b76-270e-4aec-a20d-2c99bd9301c0",
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
          type: "BUY",
          quantityChange: 6,
          pricePerUnit: 8,
          date: "2026-01-24T00:00:00.000Z",
        },
        {
          id: "754042a1-b593-485f-94c4-975258aba67c",
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
          type: "BUY",
          quantityChange: 2,
          pricePerUnit: 2,
          date: "2026-01-25T00:00:00.000Z",
        },
      ],
    },
  ];

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
                        <td data-label="pricePerUnit">{s.currentPrice}</td>
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

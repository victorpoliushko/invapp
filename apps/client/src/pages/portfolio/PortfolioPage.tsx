import { useParams } from "react-router-dom";
import "../../App.css";
import "./PortfolioPage.css";
import { useEffect, useState } from "react";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";

type AssetType = {
  name: string;
  assetSymbol: string;
  exchange: string;
  type: string;
  price: number;
};

type PortfolioType = {
  id: string;
  name: string;
  userId: string;
  assets: Array<{
    portfolioId: string;
    assetId: string;
    quantity: number;
    price: number;
    avgBuyPrice: number;
    assets: {
      id: string;
      name: string;
      asset: string;
      exchange: string;
      type: string;
      dataSource: string;
      updatedAt: string;
    };
  }>;
};

export default function PortfolioPage() {
  const params = useParams<{ id: string }>();
  const fetchWithRedirect = useFetchWithRedirect();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<AssetType[]>([]);

  const [selectedTab, setSelectedTab] = useState("tab-stocks");
  const [newAsset, setNewAsset] = useState<{
    assetName: string;
    dueDate: string;
    quantity: string;
    period: string;
    price: number;
  }>({
    assetName: "",
    dueDate: "",
    quantity: "",
    period: "",
    price: 0,
  });

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
    };

    if (params.id) {
      fetchPortfolio();
    }
  }, [params.id]);

  const [portfolio, setPortfolio] = useState<PortfolioType>();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const fetchPrice = async () => {
      portfolio &&
        portfolio.assets.forEach(async (s) => {
          const response = await fetchWithRedirect(
            `http://localhost:5173/api/assets/price?asset=${s.assets.asset}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          s.price = data.price;
        });
    };
    fetchPrice();
  }, []);

  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);

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
    setNewAsset({ ...newAsset, [e.target.name]: e.target.value });
  };

  const handleAddAsset = async () => {
    const { assetName, dueDate, quantity, price } = newAsset;

    if (!assetName || !dueDate || !quantity || !price) {
      alert("Please fill in all fields before adding the asset.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`/api/portfolios/${params.id}/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAsset),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        console.error("Error response:", errorBody);
        throw new Error("Failed to add stock");
      }

      const updatedPortfolio = await res.json();

      // console.log(`
      //  res: ${JSON.stringify(await res.json())} 
      // `);

      // set updated portfolio
      setPortfolio(updatedPortfolio);

      // {"portfolioId":"140f5933-6f4b-424f-86c3-3f350a2b1293","assetId":"ab2ee9b6-3363-48bb-bb90-9492c148b270","quantity":2,"price":3}

      alert("Asset added successfully!");
      setNewAsset({
        assetName: "",
        dueDate: "",
        quantity: "",
        period: "",
        price: 0,
      });
    } catch (err) {
      console.error(err);
      alert("Error adding stock");
    }
  };

  return (
    <>
      <section className="assets-section section-container">
        <h1 className="assets-h1">{portfolio?.name}</h1>
        <img
          className="edit-icon"
          src={editIcon}
          alt="edit-icon"
          height={30}
          width={30}
        />
        <img
          className="delete-icon"
          src={deleteIcon}
          alt="delete-icon"
          height={30}
          width={30}
        />
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
                  <th scope="col">Asset</th>
                  <th scope="col">Date</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                {portfolio &&
                  portfolio.assets.map((s) => (
                    <>
                      <tr>
                        <td data-label="asset">{s.assets.asset}</td>
                        <td data-label="date">{s.assets.updatedAt}</td>
                        <td data-label="quantity">{s.quantity}</td>
                        <td data-label="price">{s.price}</td>
                      </tr>
                    </>
                  ))}
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
                        if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      value={newAsset.quantity}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                      placeholder="Quantity"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="price"
                      value={newAsset.price}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAsset();
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
                        if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      value={newAsset.quantity}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                      placeholder="Quantity"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="price"
                      value={newAsset.price}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAsset();
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
                        if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      value={newAsset.quantity}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                      placeholder="Quantity"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="price"
                      value={newAsset.price}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAsset();
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
                        if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      value={newAsset.quantity}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAsset();
                      }}
                      required
                      placeholder="Quantity"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="price"
                      value={newAsset.price}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAsset();
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

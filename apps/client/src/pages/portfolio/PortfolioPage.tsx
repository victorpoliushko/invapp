import { useParams } from "react-router-dom";
import "../../App.css";
import "./PortfolioPage.css";
import { useEffect, useState } from "react";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";

type SymbolType = {
  name: string,
  symbol: string,
  exchange: string,
  type: string;
  price: number;
}

type PortfolioType = {
  id: string;
  name: string;
  userId: string;
  symbols: Array<{
    portfolioId: string;
    symbolId: string;
    quantity: number;
    price: number;
    avgBuyPrice: number;
    symbols: {
      id:string;
      name: string;
      symbol: string;
      exchange: string;
      type: string;
      dataSource: string;
      updatedAt: string;
    }
  }>
}

export default function PortfolioPage() {
const params = useParams<{ id: string }>();
const fetchWithRedirect = useFetchWithRedirect();

const [searchTerm, setSearchTerm] = useState("");
const [suggestions, setSuggestions] = useState<SymbolType[]>([]);

  const [selectedTab, setSelectedTab] = useState("tab-stocks");
  const [newAsset, setNewAsset] = useState({
    symbol: "",
    dueDate: "",
    amount: "",
    period: "",
    price: 0
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
      portfolio && portfolio.symbols.forEach(async s => {
        const response = await fetchWithRedirect(
          `http://localhost:5173/api/symbols/price?symbol=${s.symbols.symbol}`,
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
      })
        
    };
    fetchPrice();
  }, []);

  useEffect(() => {
  const token = localStorage.getItem("accessToken");

  if (!searchTerm.trim()) {
    setSuggestions([]);
    return;
  }

  const delayDebounceFn = setTimeout(async () => {
    try {
      const response = await fetchWithRedirect(
        `http://localhost:5173/api/symbols/search?q=${searchTerm}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch symbol suggestions");
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
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetchWithRedirect(
        `http://localhost:5173/api/portfolios/${params.id}/symbols`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newAsset),
        }
      );

      if (!res.ok) throw new Error("Failed to add stock");

      alert("Asset added successfully!");
      setNewAsset({ symbol: "", dueDate: "", amount: "", period: "", price: 0 });
    } catch (err) {
      console.error(err);
      alert("Error adding stock");
    }
  };

  return (
    <>
     
      <section className="assets-section section-container">
        <h1 className="assets-h1">{portfolio?.name}</h1>
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
                  <th scope="col">Symbol</th>
                  <th scope="col">Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                {portfolio && portfolio.symbols.map((s) => (
                  <>
                    <tr>
                      <td data-label="symbol">{s.symbols.symbol}</td>
                      <td data-label="date">{s.symbols.updatedAt}</td>
                      <td data-label="amount">{s.quantity}</td>
                      <td data-label="price">{s.price}</td>
                    </tr>
                  </>
                ))}
                <tr>
                  <td>
                    <div className="symbol-autocomplete">
                      <input
                        type="text"
                        name="symbol"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Symbol"
                        autoComplete="off"
                      />
                      {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {suggestions.slice(0, 5).map((s) => (
                            <li
                              key={s.symbol}
                              title={s.name}
                              onClick={() => {
                                setSearchTerm(s.symbol);
                                setNewAsset({ ...newAsset, symbol: s.symbol });
                                setSuggestions([]);
                              }}
                            >
                              {s.symbol} — {s.name}
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
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="amount"
                      value={newAsset.amount}
                      onChange={handleChange}
                      placeholder="Amount"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="price"
                      value={newAsset.price}
                      onChange={handleChange}
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
                  <th scope="col">Amount</th>
                  <th scope="col">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Account">Bond - 3412</td>
                  <td data-label="Due Date">04/01/2016</td>
                  <td data-label="Amount">$1,190</td>
                  <td data-label="Period">03/01/2016 - 03/31/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">
                    Bond - 6076
                  </td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Amount">$2,443</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
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
                  <th scope="col">Amount</th>
                  <th scope="col">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Account">Real estate - 3412</td>
                  <td data-label="Due Date">04/01/2016</td>
                  <td data-label="Amount">$1,190</td>
                  <td data-label="Period">03/01/2016 - 03/31/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">
                    Real estate - 6076
                  </td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Amount">$2,443</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
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
                  <th scope="col">Amount</th>
                  <th scope="col">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Account">Crypto - 3412</td>
                  <td data-label="Due Date">04/01/2016</td>
                  <td data-label="Amount">$1,190</td>
                  <td data-label="Period">03/01/2016 - 03/31/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">
                    Crypto - 6076
                  </td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Amount">$2,443</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
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

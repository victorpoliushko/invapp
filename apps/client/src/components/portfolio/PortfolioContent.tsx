import { usePortfolio } from "../../context/PortfolioContext";
import { AssetTable } from "./AssetTable";
import "../../pages/portfolio/PortfolioPage.css";
import { useEffect, useState } from "react";
import editIcon from "../../assets/pencil-svgrepo-com.svg";

export function PortfolioContent() {
  const { portfolio, updatePortfolioName } = usePortfolio();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedTab, setSelectedTab] = useState("tab-stocks");

  useEffect(() => {
    if (portfolio) setNewName(portfolio.name);
  }, [portfolio]);

  console.log(`
   portfolio: ${JSON.stringify(portfolio)} 
  `);

  [
    {
      id: "140f5933-6f4b-424f-86c3-3f350a2b1293",
      name: "Katrusia super portfolio 22",
      userId: "13ee5312-1a96-4ed2-a271-da54b338b708",
      portfolioAssets: [
        {
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
          quantity: 10,
          price: 100,
          assets: {
            id: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
            ticker: "VOO",
            name: null,
            type: null,
            exchange: null,
            dataSource: null,
            updatedAt: "2025-11-24",
            transactions: [
              {
                id: "18244817-0cef-421c-891e-063c5722c44c",
                portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
                assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
                type: "BUY",
                quantityChange: 10,
                pricePerUnit: 100,
                date: "2026-04-09",
              },
            ],
          },
        },
      ],
      transactions: [
        {
          id: "67df6742-0fcf-4b10-b0e7-a8278ae3c01b",
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "6c4220af-c081-406f-bfee-8f1d866d09e7",
          type: "BUY",
          quantityChange: 4,
          pricePerUnit: 320,
          date: "2026-02-14",
        },
        {
          id: "18244817-0cef-421c-891e-063c5722c44c",
          portfolioId: "140f5933-6f4b-424f-86c3-3f350a2b1293",
          assetId: "9a4d67b9-1c7f-4379-8ee8-9d2f327d8418",
          type: "BUY",
          quantityChange: 10,
          pricePerUnit: 100,
          date: "2026-04-09",
        },
      ],
    },
  ];

  if (!portfolio) return <div>Loading...</div>;

  const handleSave = async () => {
    await updatePortfolioName(newName);
    setIsEditing(false);
  };

  return (
    <section className="assets-section section-container">
      {isEditing ? (
        <>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="assets-h1-input"
            autoFocus
          />
          <button onClick={handleSave}>Save</button>
          <button
            onClick={() => {
              setIsEditing(false);
              setNewName(portfolio.name);
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <div className="row-container">
          <h1 className="assets-h1">{portfolio.name}</h1>
          <div className="title-button-stack">
            <button onClick={() => setIsEditing(true)}>
              <img src={editIcon} alt="Edit" height={30} width={30} />
            </button>
            {/* `<button onClick={() => deletePortfolio(portfolio.id)}>
              <img src={deleteIcon} alt="Delete" height={30} width={30} />
            </button>` */}
          </div>
        </div>
      )}
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
          <AssetTable portfolio={portfolio} />
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
                  {/* <div className="asset-autocomplete">
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
                  </div> */}
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
                    {/* <input
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
                    /> */}
                  </div>
                </td>
                <td>
                  <input
                    type="date"
                    name="dueDate"
                    value={"mock real estate data"}
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
                    value={"mock real estate data"}
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
                    value={"mock real estate data"}
                    // onChange={handleChange}
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
                    {/* <input
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
                    /> */}
                  </div>
                </td>
                <td>
                  <input
                    type="date"
                    name="dueDate"
                    value={"mock crypto data"}
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
                    value={"mock crypto data"}
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
                    value={"mock crypto data"}
                    // onChange={handleChange}
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
  );
}

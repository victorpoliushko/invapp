import { usePortfolio } from "../../context/PortfolioContext";
import { AssetTable } from "./AssetTable";
import { RealEstateTable } from "../real-estate/RealEstateTable";
import { BondTable } from "../bonds/BondTable";
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
          <BondTable />
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
          <RealEstateTable />
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
          <AssetTable portfolio={portfolio} assetType="crypto" />
        </div>
      </div>
    </section>
  );
}

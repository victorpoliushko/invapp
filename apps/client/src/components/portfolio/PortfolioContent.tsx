import { usePortfolio } from "../../context/PortfolioContext";
import { AssetTable } from "./AssetTable";
import "../../pages/portfolio/PortfolioPage.css";
import { useEffect, useState } from "react";
import editIcon from "../../assets/pencil-svgrepo-com.svg"

export function PortfolioContent() {
  const { portfolio, updatePortfolioName } = usePortfolio();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  if (!portfolio) return <div>Loading...</div>;

  useEffect(() => {
    if (portfolio) setNewName(portfolio.name);
  }, [portfolio]);

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
          <button onClick={() => { setIsEditing(false); setNewName(portfolio.name); }}>
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
            {/* <button onClick={() => deletePortfolio(portfolio.id)}>
              <img src={deleteIcon} alt="Delete" height={30} width={30} />
            </button> */}
          </div>
        </div>
      )}
      <div className="tab">
        <AssetTable assets={portfolio.portfolioAssets} />
      </div>
    </section>
  );
}

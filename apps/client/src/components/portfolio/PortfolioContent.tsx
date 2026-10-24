import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { useAuth } from "../../AuthContext";
import { StockPositions } from "../stocks/StockPositions";
import { NewStockModal } from "../stocks/NewStockModal";
import { CryptoPositions } from "../crypto/CryptoPositions";
import { NewCryptoModal } from "../crypto/NewCryptoModal";
import { AssetTab, NewAssetMenu } from "./NewAssetMenu";
import { RealEstateTable } from "../real-estate/RealEstateTable";
import { BondTable } from "../bonds/BondTable";
import { MixedAssetTable } from "../mixed-assets/MixedAssetTable";
import { MaskIcon } from "../MaskIcon";
import chevronIcon from "../../assets/icons/chevron-right.svg";
import editIcon from "../../assets/icons/edit.svg";
import { formatMoney } from "../../utils/money";
import { API_BASE_URL } from "../../config";
import "../../pages/portfolio/PortfolioPage.css";

const TABS: { id: AssetTab; label: string }[] = [
  { id: "stocks", label: "Stocks" },
  { id: "bonds", label: "Bonds" },
  { id: "realestate", label: "Real estate" },
  { id: "crypto", label: "Crypto" },
  { id: "other", label: "Other" },
];

export function PortfolioContent() {
  const { portfolio, updatePortfolioName } = usePortfolio();
  const { userId } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedTab, setSelectedTab] = useState<AssetTab>("stocks");
  const [newAssetModal, setNewAssetModal] = useState<"stock" | "crypto" | null>(null);
  const [netWorth, setNetWorth] = useState<number | null>(null);

  useEffect(() => {
    if (portfolio) setNewName(portfolio.name);
  }, [portfolio]);

  useEffect(() => {
    if (!portfolio) return;
    const token = localStorage.getItem("accessToken");
    fetch(`${API_BASE_URL}/portfolios/${portfolio.id}/net-worth`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setNetWorth(data?.total ?? null))
      .catch(() => setNetWorth(null));
  }, [portfolio]);

  if (!portfolio) return <p className="portfolio-detail-status">Loading...</p>;

  const handleSave = async () => {
    await updatePortfolioName(newName);
    setIsEditing(false);
  };

  const handleNewAsset = (tab: AssetTab) => {
    setSelectedTab(tab);
    if (tab === "stocks") setNewAssetModal("stock");
    if (tab === "crypto") setNewAssetModal("crypto");
  };

  const renderTab = () => {
    switch (selectedTab) {
      case "stocks":
        return <StockPositions portfolio={portfolio} />;
      case "crypto":
        return <CryptoPositions portfolio={portfolio} />;
      case "bonds":
        return <BondTable />;
      case "realestate":
        return <RealEstateTable />;
      case "other":
        return <MixedAssetTable />;
    }
  };

  return (
    <section className="portfolio-detail section-container">
      <div className="detail-top-bar">
        <Link to={`/portfolios/user/${userId}`} className="detail-back" aria-label="Back to portfolios">
          <MaskIcon src={chevronIcon} size={16} />
        </Link>
        {isEditing ? (
          <form
            className="detail-rename"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <input
              className="input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              aria-label="Portfolio name"
              autoFocus
            />
            <button type="submit" className="btn-pill">Save</button>
            <button
              type="button"
              className="detail-rename-cancel"
              onClick={() => {
                setIsEditing(false);
                setNewName(portfolio.name);
              }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <h1 className="detail-title">{portfolio.name}</h1>
            <button className="icon-button" aria-label="Rename portfolio" onClick={() => setIsEditing(true)}>
              <MaskIcon src={editIcon} size={20} />
            </button>
          </>
        )}
      </div>

      <div className="detail-header">
        <div className="detail-networth">
          <span className="detail-networth-label">Net worth</span>
          <span className="detail-networth-total">{netWorth != null ? formatMoney(netWorth) : "—"}</span>
        </div>
        <NewAssetMenu current={selectedTab} onSelect={handleNewAsset} />
      </div>

      <div className="chip-tabs detail-tabs" role="tablist" aria-label="Asset type">
        {TABS.map((t) => (
          <button
            key={t.id}
            className="chip-tab"
            role="tab"
            aria-selected={selectedTab === t.id}
            onClick={() => setSelectedTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="detail-tab-panel" role="tabpanel">
        {renderTab()}
      </div>

      {newAssetModal === "stock" && <NewStockModal onClose={() => setNewAssetModal(null)} />}
      {newAssetModal === "crypto" && <NewCryptoModal onClose={() => setNewAssetModal(null)} />}
    </section>
  );
}

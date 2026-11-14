import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { useAuth } from "../../AuthContext";
import { StockPositions } from "../stocks/StockPositions";
import { NewStockModal } from "../stocks/NewStockModal";
import { CryptoPositions } from "../crypto/CryptoPositions";
import { NewCryptoModal } from "../crypto/NewCryptoModal";
import { AssetTab, NewAssetMenu } from "./NewAssetMenu";
import { RealEstatePositions } from "../real-estate/RealEstatePositions";
import { NewRealEstateModal } from "../real-estate/NewRealEstateModal";
import { BondPositions } from "../bonds/BondPositions";
import { NewBondModal } from "../bonds/NewBondModal";
import { MixedAssetPositions } from "../mixed-assets/MixedAssetPositions";
import { NewMixedAssetModal } from "../mixed-assets/NewMixedAssetModal";
import { CashPositions } from "../cash/CashPositions";
import { CashModal } from "../cash/CashModal";
import { CurrencySelect } from "../CurrencySelect";
import { DisplayCurrencyProvider } from "./DisplayCurrency";
import { AllAssets } from "./AllAssets";
import { Currency, useCurrency } from "../../context/CurrencyContext";
import { MaskIcon } from "../MaskIcon";
import chevronIcon from "../../assets/icons/chevron-right.svg";
import editIcon from "../../assets/icons/edit.svg";
import { formatCurrency } from "../../utils/money";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { netWorthByType, totalNetWorth } from "../../finance/valuation";
import "../../pages/portfolio/PortfolioPage.css";

const TABS: { id: AssetTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "stocks", label: "Stocks" },
  { id: "bonds", label: "Bonds" },
  { id: "realestate", label: "Real estate" },
  { id: "crypto", label: "Crypto" },
  { id: "cash", label: "Cash" },
  { id: "other", label: "Other" },
];

export function PortfolioContent() {
  const { portfolio, updatePortfolioName, refreshPortfolio } = usePortfolio();
  const { defaultCurrency, fromUsd, toUsd } = useCurrency();
  const { userId } = useAuth();
  const fetchWithRedirect = useFetchWithRedirect();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedTab, setSelectedTab] = useState<AssetTab>("all");
  const [newAssetModal, setNewAssetModal] = useState<"stock" | "crypto" | "bond" | "cash" | "realestate" | "other" | null>(null);

  useEffect(() => {
    if (portfolio) setNewName(portfolio.name);
  }, [portfolio]);

  const netWorth = useMemo(
    () => (portfolio ? totalNetWorth(netWorthByType(portfolio, toUsd)) : null),
    [portfolio, toUsd],
  );

  if (!portfolio) return <p className="portfolio-detail-status">Loading...</p>;

  const displayCurrency = portfolio.displayCurrency ?? defaultCurrency;

  const handleCurrencyChange = async (currency: Currency) => {
    const res = await fetchWithRedirect(`/portfolios/${portfolio.id}`, {
      method: "PATCH",
      body: JSON.stringify({ id: portfolio.id, displayCurrency: currency }),
    });
    if (!res.ok) {
      alert("Failed to save currency");
      return;
    }
    await refreshPortfolio();
  };

  const handleSave = async () => {
    await updatePortfolioName(newName);
    setIsEditing(false);
  };

  const handleNewAsset = (tab: AssetTab) => {
    setSelectedTab(tab);
    if (tab === "stocks") setNewAssetModal("stock");
    if (tab === "crypto") setNewAssetModal("crypto");
    if (tab === "bonds") setNewAssetModal("bond");
    if (tab === "cash") setNewAssetModal("cash");
    if (tab === "realestate") setNewAssetModal("realestate");
    if (tab === "other") setNewAssetModal("other");
  };

  const renderTab = () => {
    switch (selectedTab) {
      case "all":
        return <AllAssets portfolio={portfolio} />;
      case "stocks":
        return <StockPositions portfolio={portfolio} />;
      case "crypto":
        return <CryptoPositions portfolio={portfolio} />;
      case "bonds":
        return <BondPositions />;
      case "realestate":
        return <RealEstatePositions />;
      case "cash":
        return <CashPositions displayCurrency={displayCurrency} />;
      case "other":
        return <MixedAssetPositions />;
    }
  };

  return (
    <DisplayCurrencyProvider value={displayCurrency}>
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
          <span className="detail-networth-total">
            {netWorth != null ? formatCurrency(fromUsd(netWorth, displayCurrency), displayCurrency) : "—"}
          </span>
        </div>
        <div className="detail-header-actions">
          <CurrencySelect value={displayCurrency} onChange={handleCurrencyChange} />
          <NewAssetMenu current={selectedTab} onSelect={handleNewAsset} />
        </div>
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
      {newAssetModal === "bond" && <NewBondModal onClose={() => setNewAssetModal(null)} />}
      {newAssetModal === "cash" && <CashModal onClose={() => setNewAssetModal(null)} />}
      {newAssetModal === "realestate" && <NewRealEstateModal onClose={() => setNewAssetModal(null)} />}
      {newAssetModal === "other" && <NewMixedAssetModal onClose={() => setNewAssetModal(null)} />}
    </section>
    </DisplayCurrencyProvider>
  );
}

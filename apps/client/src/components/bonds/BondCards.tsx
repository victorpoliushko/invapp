import { useState } from "react";
import { MaskIcon } from "../MaskIcon";
import searchIcon from "../../assets/icons/search.svg";
import eyeIcon from "../../assets/icons/eye.svg";
import { formatCurrency } from "../../utils/money";
import { Bond, FREQUENCY_LABEL } from "./types";
import { BondDetailsModal } from "./BondDetailsModal";
import { BondTradeModal } from "./BondTradeModal";

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: "numeric", day: "numeric", year: "2-digit" };

export function BondCards({ bonds }: { bonds: Bond[] }) {
  const [query, setQuery] = useState("");
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [trade, setTrade] = useState<{ bondId: string; type: "BUY" | "SELL" } | null>(null);

  const q = query.trim().toLowerCase();
  const visible = bonds
    .filter((b) => !q || b.isin.toLowerCase().includes(q) || b.name.toLowerCase().includes(q))
    .sort((a, b) => b.purchasePrice * b.quantity - a.purchasePrice * a.quantity);

  const detailsBond = bonds.find((b) => b.id === detailsId);
  const tradeBond = trade ? bonds.find((b) => b.id === trade.bondId) : undefined;

  return (
    <div className="position-cards">
      <label className="search-input">
        <MaskIcon src={searchIcon} size={24} />
        <input
          className="input"
          type="search"
          placeholder="Search"
          aria-label="Search bonds"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {visible.map((b) => (
        <BondCard
          key={b.id}
          bond={b}
          onDetails={() => setDetailsId(b.id)}
          onTrade={(type) => setTrade({ bondId: b.id, type })}
        />
      ))}

      {visible.length === 0 && (
        <p className="position-cards-empty">{q ? "No matches" : "No bonds yet — add one with New Asset."}</p>
      )}

      {detailsBond && <BondDetailsModal bond={detailsBond} onClose={() => setDetailsId(null)} />}
      {trade && tradeBond && (
        <BondTradeModal bond={tradeBond} type={trade.type} onClose={() => setTrade(null)} />
      )}
    </div>
  );
}

function BondCard({
  bond,
  onDetails,
  onTrade,
}: {
  bond: Bond;
  onDetails: () => void;
  onTrade: (type: "BUY" | "SELL") => void;
}) {
  const totalPosition = bond.purchasePrice * bond.quantity;
  const annualIncome = bond.faceValue * (bond.couponRate / 100) * bond.quantity;

  return (
    <article className="position-card">
      <div className="position-card-header">
        <div className="bond-card-title">
          <h3 className="position-card-ticker">{bond.isin}</h3>
          <span className="badge">{FREQUENCY_LABEL[bond.couponFrequency]}</span>
        </div>
        <button className="icon-button" aria-label={`${bond.isin} details`} onClick={onDetails}>
          <MaskIcon src={eyeIcon} size={20} />
        </button>
      </div>

      <dl className="position-card-metrics bond-card-metrics">
        <div>
          <dt>Total position</dt>
          <dd>{totalPosition > 0 ? formatCurrency(totalPosition, bond.currency) : "—"}</dd>
        </div>
        <div className="position-card-metric-end">
          <dt>Coupon</dt>
          <dd className="text-success">{bond.couponRate}%</dd>
        </div>
        <div>
          <dt>Maturity date</dt>
          <dd>{bond.maturityDate ? new Date(bond.maturityDate).toLocaleDateString(undefined, SHORT_DATE) : "—"}</dd>
        </div>
        <div className="position-card-metric-end">
          <dt>Annual income</dt>
          <dd className="text-success">{annualIncome > 0 ? formatCurrency(annualIncome, bond.currency) : "—"}</dd>
        </div>
      </dl>

      <div className="position-card-actions">
        <button className="btn btn-primary" onClick={() => onTrade("BUY")}>Buy</button>
        <button className="btn btn-secondary" onClick={() => onTrade("SELL")} disabled={bond.quantity <= 0}>
          Sell
        </button>
      </div>
    </article>
  );
}

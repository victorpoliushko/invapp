import { useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { PortfolioDto, PositionDto } from "../../types/portfolio";
import { MaskIcon } from "../MaskIcon";
import searchIcon from "../../assets/icons/search.svg";
import eyeIcon from "../../assets/icons/eye.svg";
import { formatMoney, gainColor, signedMoney, signedPct } from "../../utils/money";
import { lastTradeDate, pctChange, totalPosition, totalReturn } from "./positionMetrics";
import { PositionDetailsModal } from "./PositionDetailsModal";
import { TradeModal } from "./TradeModal";

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: "numeric", day: "numeric", year: "2-digit" };

export function PositionCards({
  portfolio,
  assetType,
}: {
  portfolio: PortfolioDto;
  assetType: "stock" | "crypto";
}) {
  const { currentPrices } = usePortfolio();
  const [query, setQuery] = useState("");
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [trade, setTrade] = useState<{ assetId: string; type: "BUY" | "SELL" } | null>(null);

  const all = assetType === "crypto" ? portfolio.cryptoPositions : portfolio.stockPositions;
  const q = query.trim().toLowerCase();
  const positions = all
    .filter((p) => !q || p.asset.ticker.toLowerCase().includes(q) || p.asset.name?.toLowerCase().includes(q))
    .sort((a, b) => totalPosition(b) - totalPosition(a));

  const byId = (id: string | null) => all.find((p) => p.assetId === id);
  const detailsPosition = byId(detailsId);
  const tradePosition = trade ? byId(trade.assetId) : undefined;

  return (
    <div className="position-cards">
      <label className="search-input">
        <MaskIcon src={searchIcon} size={24} />
        <input
          className="input"
          type="search"
          placeholder="Search"
          aria-label={`Search ${assetType === "crypto" ? "crypto" : "stocks"}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {positions.map((p) => (
        <PositionCard
          key={p.assetId}
          position={p}
          currentPrice={currentPrices[p.assetId]}
          onDetails={() => setDetailsId(p.assetId)}
          onTrade={(type) => setTrade({ assetId: p.assetId, type })}
        />
      ))}

      {positions.length === 0 && (
        <p className="position-cards-empty">
          {q ? "No matches" : `No ${assetType === "crypto" ? "crypto" : "stocks"} yet — add one with New Asset.`}
        </p>
      )}

      {detailsPosition && (
        <PositionDetailsModal
          position={detailsPosition}
          assetType={assetType}
          onClose={() => setDetailsId(null)}
        />
      )}
      {trade && tradePosition && (
        <TradeModal
          position={tradePosition}
          type={trade.type}
          assetType={assetType}
          onClose={() => setTrade(null)}
        />
      )}
    </div>
  );
}

function PositionCard({
  position,
  currentPrice,
  onDetails,
  onTrade,
}: {
  position: PositionDto;
  currentPrice: number | undefined;
  onDetails: () => void;
  onTrade: (type: "BUY" | "SELL") => void;
}) {
  const ticker = position.asset.ticker;
  const lastTrade = lastTradeDate(position);
  const change = pctChange(position, currentPrice);
  const ret = totalReturn(position, currentPrice);
  const total = totalPosition(position);

  return (
    <article className="position-card">
      <div className="position-card-header">
        <div>
          <h3 className="position-card-ticker">{ticker}</h3>
          {lastTrade && (
            <p className="position-card-subtitle">Last trade {lastTrade.toLocaleDateString(undefined, SHORT_DATE)}</p>
          )}
        </div>
        <button className="icon-button" aria-label={`${ticker} details`} onClick={onDetails}>
          <MaskIcon src={eyeIcon} size={20} />
        </button>
      </div>

      <dl className="position-card-metrics">
        <div>
          <dt>Avg price</dt>
          <dd>{position.price != null ? formatMoney(position.price, 2) : "—"}</dd>
        </div>
        <div>
          <dt>Total position</dt>
          <dd>{total > 0 ? formatMoney(total) : "—"}</dd>
        </div>
        <div className="position-card-metric-end">
          <dt>Change</dt>
          <dd style={change != null ? { color: gainColor(change) } : undefined}>
            {change != null ? signedPct(change, 2) : "—"}
          </dd>
        </div>
        <div className="position-card-metric-end">
          <dt>Total return</dt>
          <dd style={ret != null ? { color: gainColor(ret) } : undefined}>
            {ret != null ? signedMoney(ret) : "—"}
          </dd>
        </div>
      </dl>

      <div className="position-card-actions">
        <button className="btn btn-primary" onClick={() => onTrade("BUY")}>Buy</button>
        <button className="btn btn-secondary" onClick={() => onTrade("SELL")} disabled={position.quantity <= 0}>
          Sell
        </button>
      </div>
    </article>
  );
}

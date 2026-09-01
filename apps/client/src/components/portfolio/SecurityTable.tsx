import { Fragment, useState } from "react";
import { SecurityRow } from "./SecurityRow";
import { SecurityTransactions } from "./SecurityTransactions";
import "../../pages/portfolio/PortfolioPage.css";
import { PortfolioDto } from "../../types/portfolio";
import { AddSecurity } from "./AddSecurity";
import { usePortfolio } from "../../context/PortfolioContext";

type SortCol = "pctChange" | "totalPosition" | "totalReturn";
type SortDir = "asc" | "desc";

type Position = PortfolioDto["stockPositions"][number];

function totalPosition(pa: Position): number {
  return pa.transactions
    .filter((t) => t.type === "BUY")
    .reduce((sum, t) => sum + t.quantityChange * t.pricePerUnit, 0);
}

function pctChange(pa: Position, prices: Record<string, number>): number {
  const cur = prices[pa.assetId];
  const avg = pa.price;
  return cur != null && avg != null && avg !== 0
    ? ((cur - avg) / avg) * 100
    : -Infinity;
}

function totalReturn(pa: Position, prices: Record<string, number>): number {
  const cur = prices[pa.assetId];
  const avg = pa.price;
  return cur != null && avg != null
    ? (cur - avg) * pa.quantity
    : -Infinity;
}

export const SecurityTable = ({
  portfolio,
  assetType = "stock",
}: {
  portfolio: PortfolioDto;
  assetType?: "stock" | "crypto";
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<SortCol>("totalPosition");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { currentPrices } = usePortfolio();

  const handleSort = (col: SortCol) => {
    if (col === sortCol) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortCol(col); setSortDir("desc"); }
  };

  const sortValue = (pa: Position) => {
    if (sortCol === "pctChange") return pctChange(pa, currentPrices);
    if (sortCol === "totalReturn") return totalReturn(pa, currentPrices);
    return totalPosition(pa);
  };

  const indicator = (col: SortCol) =>
    sortCol === col ? (sortDir === "desc" ? "▼" : "▲") : "↕";

  const positions = (assetType === "crypto" ? portfolio.cryptoPositions : portfolio.stockPositions)
    .slice()
    .sort((a, b) => {
      const diff = sortValue(b) - sortValue(a);
      return sortDir === "desc" ? diff : -diff;
    });

  const totalPositionSum = positions.reduce((sum, pa) => sum + totalPosition(pa), 0);

  return (
    <div className="table-scroll">
    <table className="assets-table">
      <thead>
        <tr>
          <th></th>
          <th scope="col">Asset</th>
          <th scope="col">Last transaction</th>
          <th scope="col">Quantity</th>
          <th scope="col" className="col-avg-price">Avg price</th>
          <th scope="col">Current pricePerUnit</th>
          <th scope="col" className="th-sortable" onClick={() => handleSort("pctChange")}>
            <span className="th-sortable-inner">% change <span>{indicator("pctChange")}</span></span>
          </th>
          <th scope="col" className="th-sortable" onClick={() => handleSort("totalPosition")}>
            <span className="th-sortable-inner">Total position <span>{indicator("totalPosition")}</span></span>
          </th>
          <th scope="col" className="th-sortable" onClick={() => handleSort("totalReturn")}>
            <span className="th-sortable-inner">Total return <span>{indicator("totalReturn")}</span></span>
          </th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((position) => (
          <Fragment key={position.assetId}>
            <SecurityRow
              position={position}
              assetType={assetType}
              isExpanded={expandedIds.has(position.assetId)}
              onExpand={() =>
                setExpandedIds((prev) => {
                  const next = new Set(prev);
                  next.has(position.assetId) ? next.delete(position.assetId) : next.add(position.assetId);
                  return next;
                })
              }
            />
            {expandedIds.has(position.assetId) && (
              <SecurityTransactions
                assetTicker={position.asset.ticker}
                assetType={assetType}
                transactions={position.transactions}
              />
            )}
          </Fragment>
        ))}
        <AddSecurity assetType={assetType} totalPositionSum={totalPositionSum} />
      </tbody>
    </table>
    </div>
  );
};

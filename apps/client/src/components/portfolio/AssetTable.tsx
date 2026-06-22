import { Fragment, useState } from "react";
import { AssetRow } from "./AssetRow";
import { AssetTransactions } from "./AssetTransactions";
import "../../pages/portfolio/PortfolioPage.css";
import { PortfolioDto } from "../../../../api/src/portfolios/dto/portfolio.dto";
import { AddAsset } from "./AddAsset";
import { usePortfolio } from "../../context/PortfolioContext";

type SortCol = "pctChange" | "totalPosition" | "totalReturn";
type SortDir = "asc" | "desc";

type PA = PortfolioDto["portfolioAssets"][number];

function totalPosition(pa: PA): number {
  return pa.transactions
    .filter((t) => t.type === "BUY")
    .reduce((sum, t) => sum + t.quantityChange * t.pricePerUnit, 0);
}

function pctChange(pa: PA, prices: Record<string, number>): number {
  const cur = prices[pa.assetId];
  const avg = pa.price;
  return cur != null && avg != null && avg !== 0
    ? ((cur - avg) / avg) * 100
    : -Infinity;
}

function totalReturn(pa: PA, prices: Record<string, number>): number {
  const cur = prices[pa.assetId];
  const avg = pa.price;
  return cur != null && avg != null
    ? (cur - avg) * pa.quantity
    : -Infinity;
}

export const AssetTable = ({
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

  const sortValue = (pa: PA) => {
    if (sortCol === "pctChange") return pctChange(pa, currentPrices);
    if (sortCol === "totalReturn") return totalReturn(pa, currentPrices);
    return totalPosition(pa);
  };

  const indicator = (col: SortCol) =>
    sortCol === col ? (sortDir === "desc" ? "▼" : "▲") : "↕";

  const portfolioAssets = portfolio.portfolioAssets
    .filter((pa) =>
      assetType === "crypto"
        ? pa.asset.type === "CRYPTOCURRENCY"
        : pa.asset.type !== "CRYPTOCURRENCY",
    )
    .slice()
    .sort((a, b) => {
      const diff = sortValue(b) - sortValue(a);
      return sortDir === "desc" ? diff : -diff;
    });

  const totalPositionSum = portfolioAssets.reduce((sum, pa) => sum + totalPosition(pa), 0);
  const totalReturnSum = portfolioAssets.reduce((sum, pa) => {
    const cur = currentPrices[pa.assetId];
    const avg = pa.price;
    return cur != null && avg != null ? sum + (cur - avg) * pa.quantity : sum;
  }, 0);

  return (
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
        <tr className="th-total-row">
          <th colSpan={7}></th>
          <th>{totalPositionSum > 0 ? Math.round(totalPositionSum).toLocaleString() : "—"}</th>
          <th style={{ color: totalReturnSum >= 0 ? "#4caf50" : "#e57373" }}>
            {totalReturnSum !== 0 ? `${totalReturnSum >= 0 ? "+" : ""}${Math.round(totalReturnSum).toLocaleString()}` : "—"}
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {portfolioAssets.map((portfolioAsset) => (
          <Fragment key={portfolioAsset.assetId}>
            <AssetRow
              portfolioAsset={portfolioAsset}
              isExpanded={expandedIds.has(portfolioAsset.assetId)}
              onExpand={() =>
                setExpandedIds((prev) => {
                  const next = new Set(prev);
                  next.has(portfolioAsset.assetId) ? next.delete(portfolioAsset.assetId) : next.add(portfolioAsset.assetId);
                  return next;
                })
              }
            />
            {expandedIds.has(portfolioAsset.assetId) && (
              <AssetTransactions
                assetTicker={portfolioAsset.asset.ticker}
                portfolioAssetTransactions={portfolioAsset.transactions}
              />
            )}
          </Fragment>
        ))}
        <AddAsset assetType={assetType} />
      </tbody>
    </table>
  );
};

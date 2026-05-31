import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { Bond } from "./types";

const FREQUENCY_LABEL: Record<string, string> = {
  ANNUAL: "Annual",
  SEMI_ANNUAL: "Semi-annual",
  QUARTERLY: "Quarterly",
  MONTHLY: "Monthly",
};

function calcStats(bond: Bond) {
  const buys = bond.transactions.filter((t) => t.type === "BUY");
  const sells = bond.transactions.filter((t) => t.type === "SELL");
  const quantity =
    buys.reduce((s, t) => s + t.quantity, 0) -
    sells.reduce((s, t) => s + t.quantity, 0);
  const totalCost = buys.reduce((s, t) => s + t.quantity * t.pricePerUnit, 0);
  const totalBuyQty = buys.reduce((s, t) => s + t.quantity, 0);
  const avgPrice = totalBuyQty > 0 ? totalCost / totalBuyQty : 0;
  const totalPosition = totalCost;
  const annualIncome = quantity > 0 ? bond.faceValue * (bond.couponRate / 100) * quantity : 0;
  return { quantity, avgPrice, totalPosition, annualIncome };
}

export function BondRow({
  bond,
  isExpanded,
  onExpand,
  onDelete,
}: {
  bond: Bond;
  isExpanded: boolean;
  onExpand: () => void;
  onDelete: (id: string) => void;
}) {
  const { quantity, avgPrice, totalPosition, annualIncome } = calcStats(bond);

  return (
    <tr>
      <td>
        <button onClick={onExpand}>{isExpanded ? "▼" : "►"}</button>
      </td>
      <td>{bond.isin}</td>
      <td>{bond.name}</td>
      <td>{bond.transactions.length ? new Date(bond.transactions[bond.transactions.length - 1].date).toLocaleDateString() : "—"}</td>
      <td>{quantity}</td>
      <td>{avgPrice > 0 ? avgPrice.toFixed(2) : "—"}</td>
      <td>{bond.faceValue.toLocaleString()}</td>
      <td>{bond.couponRate}%</td>
      <td>{FREQUENCY_LABEL[bond.couponFrequency]}</td>
      <td>{annualIncome > 0 ? Math.round(annualIncome).toLocaleString() : "—"}</td>
      <td>{totalPosition > 0 ? Math.round(totalPosition).toLocaleString() : "—"}</td>
      <td className="actions">
        <button onClick={() => onDelete(bond.id)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
}

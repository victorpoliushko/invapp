import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { Bond } from "./types";

const FREQUENCY_LABEL: Record<string, string> = {
  ANNUAL: "Annual",
  SEMI_ANNUAL: "Semi-annual",
  QUARTERLY: "Quarterly",
  MONTHLY: "Monthly",
};

export function BondRow({ bond, onDelete }: { bond: Bond; onDelete: (id: string) => void }) {
  const annualIncome = bond.faceValue * (bond.couponRate / 100) * bond.quantity;
  const totalPosition = bond.purchasePrice * bond.quantity;

  return (
    <tr>
      <td data-label="ISIN">{bond.isin}</td>
      <td data-label="Name">{bond.name}</td>
      <td data-label="Date bought">{new Date(bond.purchaseDate).toLocaleDateString()}</td>
      <td data-label="Quantity">{bond.quantity}</td>
      <td data-label="Purchase price">{bond.purchasePrice}</td>
      <td data-label="Face value">{bond.faceValue.toLocaleString()}</td>
      <td data-label="Coupon %">{bond.couponRate}%</td>
      <td data-label="Frequency">{FREQUENCY_LABEL[bond.couponFrequency]}</td>
      <td data-label="Annual income">{annualIncome > 0 ? Math.round(annualIncome).toLocaleString() : "—"}</td>
      <td data-label="Total position">{totalPosition > 0 ? Math.round(totalPosition).toLocaleString() : "—"}</td>
      <td className="actions">
        <button onClick={() => onDelete(bond.id)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
}

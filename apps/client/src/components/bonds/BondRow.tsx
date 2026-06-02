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
      <td>{bond.isin}</td>
      <td>{bond.name}</td>
      <td>{new Date(bond.purchaseDate).toLocaleDateString()}</td>
      <td>{bond.quantity}</td>
      <td>{bond.purchasePrice}</td>
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

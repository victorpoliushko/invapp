import { useState } from "react";
import deleteIcon from "../../assets/crud-icons/delete.svg";
import editIcon from "../../assets/crud-icons/update.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { Bond } from "./types";

const FREQUENCY_LABEL: Record<string, string> = {
  ANNUAL: "Annual",
  SEMI_ANNUAL: "Semi-annual",
  QUARTERLY: "Quarterly",
  MONTHLY: "Monthly",
};

type Props = { bond: Bond; onDelete: (id: string) => void; onUpdated: () => void };

export function BondRow({ bond, onDelete, onUpdated }: Props) {
  const annualIncome = bond.faceValue * (bond.couponRate / 100) * bond.quantity;
  const totalPosition = bond.purchasePrice * bond.quantity;
  const capitalGain = bond.currentValue != null ? (bond.currentValue - bond.purchasePrice) * bond.quantity : null;

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [currentValueInput, setCurrentValueInput] = useState(
    bond.currentValue != null ? String(bond.currentValue) : "",
  );

  const startEditingValue = () => {
    setCurrentValueInput(bond.currentValue != null ? String(bond.currentValue) : "");
    setIsEditingValue(true);
  };

  const saveCurrentValue = async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/bonds/${bond.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        currentValue: currentValueInput === "" ? null : Number(currentValueInput),
      }),
    });

    if (!res.ok) { alert("Failed to update current value"); return; }
    setIsEditingValue(false);
    onUpdated();
  };

  return (
    <tr>
      <td data-label="ISIN">{bond.isin}</td>
      <td data-label="Name">{bond.name}</td>
      <td data-label="Date bought">{new Date(bond.purchaseDate).toLocaleDateString()}</td>
      <td data-label="Maturity date">{bond.maturityDate ? new Date(bond.maturityDate).toLocaleDateString() : "—"}</td>
      <td data-label="Quantity">{bond.quantity}</td>
      <td data-label="Purchase price">{bond.purchasePrice}</td>
      <td data-label="Current value">
        {isEditingValue ? (
          <div style={{ display: "flex", gap: 4 }}>
            <input
              type="number"
              value={currentValueInput}
              onChange={(e) => setCurrentValueInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveCurrentValue()}
              placeholder="Per unit"
              autoFocus
            />
            <button onClick={saveCurrentValue}>Save</button>
            <button onClick={() => setIsEditingValue(false)}>Cancel</button>
          </div>
        ) : (
          <span onClick={startEditingValue} style={{ cursor: "pointer" }} title="Click to edit">
            {bond.currentValue != null ? bond.currentValue.toLocaleString() : "—"}
          </span>
        )}
      </td>
      <td data-label="Face value">{bond.faceValue.toLocaleString()}</td>
      <td data-label="Coupon %">{bond.couponRate}%</td>
      <td data-label="Frequency">{FREQUENCY_LABEL[bond.couponFrequency]}</td>
      <td data-label="Annual income">{annualIncome > 0 ? Math.round(annualIncome).toLocaleString() : "—"}</td>
      <td data-label="Total position">{totalPosition > 0 ? Math.round(totalPosition).toLocaleString() : "—"}</td>
      <td
        data-label="Capital gain"
        style={{ color: capitalGain == null ? undefined : capitalGain >= 0 ? "#4caf50" : "#e57373" }}
      >
        {capitalGain == null ? "—" : `${capitalGain >= 0 ? "+" : ""}${Math.round(capitalGain).toLocaleString()}`}
      </td>
      <td className="actions">
        <button className="icon-btn" onClick={startEditingValue}>
          <img src={editIcon} height={24} width={24} alt="edit" />
        </button>
        <button className="icon-btn" onClick={() => onDelete(bond.id)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
}

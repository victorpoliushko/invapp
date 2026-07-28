import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { RealEstate } from "./types";

type Props = {
  property: RealEstate;
  isExpanded: boolean;
  onExpand: () => void;
  onDelete: (id: string) => void;
};

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  COMMERCIAL: "Commercial",
};

function calcStats(property: RealEstate) {
  const purchaseMs = new Date(property.purchaseDate).getTime();
  const nowMs = Date.now();
  const totalDays = (nowMs - purchaseMs) / (1000 * 60 * 60 * 24);

  let occupiedDays = 0;
  let totalRentEarned = 0;

  for (const t of property.transactions) {
    const start = new Date(t.startDate).getTime();
    const end = new Date(t.endDate).getTime();
    const days = (end - start) / (1000 * 60 * 60 * 24);
    occupiedDays += days;
    totalRentEarned += (days / 30.4375) * t.monthlyRent;
  }

  const occupancyPct = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;
  const yearsSincePurchase = totalDays / 365.25;
  const annualNet = yearsSincePurchase > 0 ? totalRentEarned / yearsSincePurchase : 0;
  const annualNetPct = property.purchasePrice > 0 ? (annualNet / property.purchasePrice) * 100 : 0;

  return { occupancyPct, annualNet, annualNetPct, totalReturn: totalRentEarned };
}

export function RealEstateRow({ property, isExpanded, onExpand, onDelete }: Props) {
  const { occupancyPct, annualNet, annualNetPct, totalReturn } = calcStats(property);
  const gain = (v: number) => ({ color: v >= 0 ? "#4caf50" : "#e57373" });

  return (
    <tr>
      <td>
        <button onClick={onExpand}>{isExpanded ? "▼" : "►"}</button>
      </td>
      <td data-label="Code">{property.code}</td>
      <td data-label="Name">{property.name}</td>
      <td data-label="Type">{TYPE_LABELS[property.type] ?? property.type}</td>
      <td data-label="Purchase date">{new Date(property.purchaseDate).toLocaleDateString()}</td>
      <td data-label="Purchase price">{property.purchasePrice.toLocaleString()}</td>
      <td data-label="Rooms">{property.rooms ?? "—"}</td>
      <td data-label="Total area, m²">{property.totalArea != null ? property.totalArea.toLocaleString() : "—"}</td>
      <td data-label="Occupancy %">{occupancyPct.toFixed(1)}%</td>
      <td data-label="Annual net income" style={gain(annualNet)}>{Math.round(annualNet).toLocaleString()}</td>
      <td data-label="Annual net income %" style={gain(annualNetPct)}>{annualNetPct.toFixed(2)}%</td>
      <td data-label="Total return" style={gain(totalReturn)}>
        {totalReturn >= 0 ? "+" : ""}
        {Math.round(totalReturn).toLocaleString()}
      </td>
      <td className="actions">
        <button onClick={() => onDelete(property.id)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
}

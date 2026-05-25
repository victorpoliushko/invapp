import deleteIcon from "../../assets/delete-svgrepo-com.svg";

type RealEstate = {
  id: string;
  name: string;
  type: string;
  purchaseDate: string;
  purchasePrice: number;
  monthlyRent: number;
  occupancyPct: number;
};

type Props = { property: RealEstate; onDelete: (id: string) => void };

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  COMMERCIAL: "Commercial",
};

export function RealEstateRow({ property, onDelete }: Props) {
  const annualNet = property.monthlyRent * 12 * (property.occupancyPct / 100);
  const annualNetPct =
    property.purchasePrice > 0 ? (annualNet / property.purchasePrice) * 100 : 0;

  const yearsSincePurchase =
    (Date.now() - new Date(property.purchaseDate).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000);
  const totalReturn = annualNet * yearsSincePurchase;

  const gainColor = (v: number) => (v >= 0 ? "#4caf50" : "#e57373");

  return (
    <tr>
      <td>{property.name}</td>
      <td>{TYPE_LABELS[property.type] ?? property.type}</td>
      <td>{new Date(property.purchaseDate).toLocaleDateString()}</td>
      <td>{property.purchasePrice.toLocaleString()}</td>
      <td>{property.monthlyRent.toLocaleString()}</td>
      <td>{property.occupancyPct}%</td>
      <td style={{ color: gainColor(annualNet) }}>{Math.round(annualNet).toLocaleString()}</td>
      <td style={{ color: gainColor(annualNetPct) }}>{annualNetPct.toFixed(2)}%</td>
      <td style={{ color: gainColor(totalReturn) }}>
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

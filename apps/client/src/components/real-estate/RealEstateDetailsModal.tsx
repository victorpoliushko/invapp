import { Modal } from "../Modal";
import { MaskIcon } from "../MaskIcon";
import xIcon from "../../assets/icons/x.svg";
import { useDisplayMoney } from "../portfolio/DisplayCurrency";
import { RealEstate } from "./types";
import { calcRealEstateStats } from "./realEstateMetrics";

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: "numeric", day: "numeric", year: "2-digit" };
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, SHORT_DATE);

export function RealEstateDetailsModal({ property, onClose }: { property: RealEstate; onClose: () => void }) {
  const { money, signedMoney } = useDisplayMoney();
  const { occupancyPct, totalReturn } = calcRealEstateStats(property);

  const rows = [
    { key: "buy", type: "BUY", date: property.purchaseDate, price: money(property.purchasePrice), income: "-" },
    ...property.transactions
      .slice()
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map((t) => ({
        key: t.id,
        type: "LEND",
        date: t.startDate,
        price: `until ${fmtDate(t.endDate)}`,
        income: money(t.monthlyRent),
      })),
  ];

  return (
    <Modal labelledBy="re-details-title" onClose={onClose} className="position-details">
      <div className="modal-header">
        <div className="position-details-summary">
          <h2 id="re-details-title" className="position-details-title">{property.name} Details</h2>
          <p><span>Rooms</span><strong>{property.rooms ?? "—"}</strong></p>
          <p><span>Total area, m²</span><strong>{property.totalArea ?? "—"}</strong></p>
          <p><span>Occupancy, %</span><strong>{occupancyPct.toFixed(1)}</strong></p>
          <p>
            <span>Total return</span>
            <strong style={{ color: totalReturn >= 0 ? "var(--text-success)" : "var(--text-danger)" }}>{signedMoney(totalReturn)}</strong>
          </p>
        </div>
        <button className="icon-button" aria-label="Close" onClick={onClose}>
          <MaskIcon src={xIcon} size={20} />
        </button>
      </div>

      <div className="position-details-table-wrap">
        <table className="position-details-table table-plain">
          <thead>
            <tr>
              <th scope="col">Trade type</th>
              <th scope="col">Date</th>
              <th scope="col">Price</th>
              <th scope="col">Mon income</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td style={{ color: r.type === "BUY" ? "var(--text-success)" : "var(--decorative-orange)" }}>{r.type}</td>
                <td>{fmtDate(r.date)}</td>
                <td>{r.price}</td>
                <td>{r.income}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

import { Modal } from "../Modal";
import { MaskIcon } from "../MaskIcon";
import xIcon from "../../assets/icons/x.svg";
import { formatCurrency } from "../../utils/money";
import { TRANSACTION_COLORS } from "../portfolio/transactionColors";
import { Bond } from "./types";
import { useBondActions } from "./useBonds";

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: "numeric", day: "numeric", year: "2-digit" };

export function BondDetailsModal({ bond, onClose }: { bond: Bond; onClose: () => void }) {
  const { deleteBond } = useBondActions();
  const transactions = bond.transactions ?? [];

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${bond.isin} and all its trades from this portfolio?`)) return;
    try {
      await deleteBond(bond.id);
      onClose();
    } catch {
      alert("Failed to delete bond");
    }
  };

  return (
    <Modal labelledBy="bond-details-title" onClose={onClose} className="position-details">
      <div className="modal-header">
        <div className="position-details-summary">
          <h2 id="bond-details-title" className="position-details-title">{bond.isin} Details</h2>
          <p><span>Total q-ty</span><strong>{bond.quantity}</strong></p>
          <p><span>Face value</span><strong>{formatCurrency(bond.faceValue, bond.currency, 2)}</strong></p>
          <p><span>Purchase price</span><strong>{formatCurrency(bond.purchasePrice, bond.currency, 2)}</strong></p>
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
              <th scope="col">Quantity</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td style={{ color: TRANSACTION_COLORS[t.type] }}>{t.type}</td>
                <td>{new Date(t.date).toLocaleDateString(undefined, SHORT_DATE)}</td>
                <td>{t.quantity}</td>
                <td>{formatCurrency(t.pricePerUnit, bond.currency, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-danger" onClick={handleDelete}>
        Delete {bond.isin}
      </button>
    </Modal>
  );
}

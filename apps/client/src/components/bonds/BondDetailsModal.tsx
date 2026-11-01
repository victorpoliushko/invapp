import { Modal } from "../Modal";
import { MaskIcon } from "../MaskIcon";
import xIcon from "../../assets/icons/x.svg";
import { TRANSACTION_COLORS } from "../portfolio/transactionColors";
import { Bond } from "./types";
import { useBondActions } from "./useBonds";
import { useDisplayMoney } from "../portfolio/DisplayCurrency";
import { ConfirmDialog } from "../ConfirmDialog";
import { useState } from "react";

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: "numeric", day: "numeric", year: "2-digit" };

export function BondDetailsModal({ bond, onClose }: { bond: Bond; onClose: () => void }) {
  const { money } = useDisplayMoney();
  const { deleteBond } = useBondActions();
  const transactions = bond.transactions ?? [];

  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <ConfirmDialog
        title={`Delete ${bond.isin}?`}
        message="The bond and all its trades will be removed from this portfolio."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteBond(bond.id);
          onClose();
        }}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <Modal labelledBy="bond-details-title" onClose={onClose} className="position-details">
      <div className="modal-header">
        <div className="position-details-summary">
          <h2 id="bond-details-title" className="position-details-title">{bond.isin} Details</h2>
          <p><span>Total q-ty</span><strong>{bond.quantity}</strong></p>
          <p><span>Face value</span><strong>{money(bond.faceValue, bond.currency, 2)}</strong></p>
          <p><span>Purchase price</span><strong>{money(bond.purchasePrice, bond.currency, 2)}</strong></p>
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
                <td>{money(t.pricePerUnit, bond.currency, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-danger" onClick={() => setConfirming(true)}>
        Delete {bond.isin}
      </button>
    </Modal>
  );
}

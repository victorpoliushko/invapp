import { useState } from "react";
import { MaskIcon } from "../MaskIcon";
import editIcon from "../../assets/icons/edit.svg";
import { useDisplayMoney } from "../portfolio/DisplayCurrency";
import { useCash } from "./useCash";
import { CashModal } from "./CashModal";
import { CashEntry } from "./useCash";

export function DigitalCashCard({ category, ids }: { category: "STOCK" | "CRYPTO"; ids?: string[] }) {
  const entries = useCash().filter((e) => e.category === category && (!ids || ids.includes(e.id)));
  const { money } = useDisplayMoney();
  const [editing, setEditing] = useState<CashEntry | null>(null);

  if (entries.length === 0) return null;

  return (
    <>
      {entries.map((e) => (
        <article key={e.id} className="position-card digital-cash-card">
          <div className="position-card-header">
            <div>
              <h3 className="position-card-ticker">Digital cash</h3>
              <p className="position-card-subtitle">From sales · {e.currency}</p>
            </div>
            <div className="digital-cash-amount">
              <span>{money(e.amount, e.currency, 2)}</span>
              <button className="icon-button" aria-label="Edit digital cash" onClick={() => setEditing(e)}>
                <MaskIcon src={editIcon} size={20} />
              </button>
            </div>
          </div>
        </article>
      ))}
      {editing && <CashModal entry={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

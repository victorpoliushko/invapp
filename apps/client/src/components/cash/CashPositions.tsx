import { useState } from "react";
import { MaskIcon } from "../MaskIcon";
import editIcon from "../../assets/icons/edit.svg";
import { useCurrency } from "../../context/CurrencyContext";
import { formatCurrency } from "../../utils/money";
import { CashEntry, useCash } from "./useCash";
import { CashModal } from "./CashModal";

export function CashPositions({ displayCurrency }: { displayCurrency: string }) {
  const entries = useCash();
  const { convert } = useCurrency();
  const [editing, setEditing] = useState<CashEntry | null>(null);

  const total = entries.reduce((sum, e) => sum + convert(e.amount, e.currency, displayCurrency), 0);

  return (
    <div className="position-cards">
      {entries.length > 0 && (
        <div className="cash-total">
          <span>Total cash</span>
          <strong>{formatCurrency(total, displayCurrency, 2)}</strong>
        </div>
      )}

      {entries.map((e) => (
        <article key={e.id} className="position-card cash-card">
          <div className="position-card-header">
            <div>
              <h3 className="position-card-ticker">{e.name ?? e.currency}</h3>
              {e.name && <p className="position-card-subtitle">{e.currency}</p>}
            </div>
            <button className="icon-button" aria-label={`Edit ${e.name ?? `${e.currency} cash`}`} onClick={() => setEditing(e)}>
              <MaskIcon src={editIcon} size={20} />
            </button>
          </div>
          <div className="cash-card-amounts">
            <span className="cash-card-amount">{formatCurrency(e.amount, e.currency, 2)}</span>
            {e.currency !== displayCurrency && (
              <span className="cash-card-converted">
                ≈ {formatCurrency(convert(e.amount, e.currency, displayCurrency), displayCurrency, 2)}
              </span>
            )}
          </div>
        </article>
      ))}

      {entries.length === 0 && <p className="position-cards-empty">No cash yet — add some with New Asset.</p>}

      {editing && <CashModal entry={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

import { useState } from "react";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import { BondTransaction } from "./types";
import { TRANSACTION_COLORS } from "../portfolio/transactionColors";

type EditState = { type: "BUY" | "SELL"; quantity: string; pricePerUnit: string; date: string };

type Props = {
  bondId: string;
  transactions: BondTransaction[];
  onChanged: () => void;
};

function toInputDate(iso: string) {
  return iso.split("T")[0];
}

export function BondTransactions({ bondId: _bondId, transactions, onChanged }: Props) {
  const token = () => localStorage.getItem("accessToken");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  const startEdit = (t: BondTransaction) => {
    setEditingId(t.id);
    setEditState({
      type: t.type,
      quantity: String(t.quantity),
      pricePerUnit: String(t.pricePerUnit),
      date: toInputDate(t.date),
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditState(null); };

  const saveEdit = async (id: string) => {
    if (!editState) return;
    const res = await fetch(`/api/bonds/transaction/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        type: editState.type,
        quantity: Number(editState.quantity),
        pricePerUnit: Number(editState.pricePerUnit),
        date: new Date(editState.date).toISOString(),
      }),
    });
    if (!res.ok) { alert("Failed to update transaction"); return; }
    cancelEdit();
    onChanged();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/bonds/transaction/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) onChanged();
    else alert("Failed to delete transaction");
  };

  return (
    <tr className="detail-row">
      <td colSpan={12}>
        <div className="transactions-container">
          <table className="transactions-subtable">
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Date</th>
                <th scope="col">Quantity</th>
                <th scope="col">Price per unit</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) =>
                editingId === t.id && editState ? (
                  <tr key={t.id}>
                    <td>
                      <select
                        value={editState.type}
                        onChange={(e) => setEditState({ ...editState, type: e.target.value as "BUY" | "SELL" })}
                        style={{ color: TRANSACTION_COLORS[editState.type] }}
                      >
                        <option value="BUY" style={{ color: TRANSACTION_COLORS.BUY }}>BUY</option>
                        <option value="SELL" style={{ color: TRANSACTION_COLORS.SELL }}>SELL</option>
                      </select>
                    </td>
                    <td>
                      <input type="date" value={editState.date}
                        onChange={(e) => setEditState({ ...editState, date: e.target.value })} />
                    </td>
                    <td>
                      <input type="number" value={editState.quantity}
                        onChange={(e) => setEditState({ ...editState, quantity: e.target.value })} />
                    </td>
                    <td>
                      <input type="number" value={editState.pricePerUnit}
                        onChange={(e) => setEditState({ ...editState, pricePerUnit: e.target.value })} />
                    </td>
                    <td className="actions">
                      <button onClick={() => saveEdit(t.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id}>
                    <td style={{ color: TRANSACTION_COLORS[t.type] }}>{t.type}</td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{t.quantity}</td>
                    <td>{t.pricePerUnit}</td>
                    <td className="actions">
                      <button onClick={() => startEdit(t)}>
                        <img src={editIcon} height={20} width={20} alt="edit" />
                      </button>
                      <button onClick={() => handleDelete(t.id)}>
                        <img src={deleteIcon} height={20} width={20} alt="delete" />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

import { useState } from "react";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import { RealEstateTransaction } from "./types";

type Props = {
  realEstateId: string;
  transactions: RealEstateTransaction[];
  onChanged: () => void;
};

type EditState = { startDate: string; endDate: string; monthlyRent: string };

function toInputDate(iso: string) {
  return iso.split("T")[0];
}

export function RealEstateTransactions({ realEstateId: _realEstateId, transactions, onChanged }: Props) {
  const token = () => localStorage.getItem("accessToken");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  const startEdit = (t: RealEstateTransaction) => {
    setEditingId(t.id);
    setEditState({
      startDate: toInputDate(t.startDate),
      endDate: toInputDate(t.endDate),
      monthlyRent: String(t.monthlyRent),
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditState(null); };

  const saveEdit = async (id: string) => {
    if (!editState) return;
    const res = await fetch(`/api/real-estate/transaction/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        startDate: new Date(editState.startDate).toISOString(),
        endDate: new Date(editState.endDate).toISOString(),
        monthlyRent: Number(editState.monthlyRent),
      }),
    });
    if (!res.ok) { alert("Failed to update transaction"); return; }
    cancelEdit();
    onChanged();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/real-estate/transaction/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) onChanged();
    else alert("Failed to delete transaction");
  };

  return (
    <tr className="detail-row">
      <td colSpan={11}>
        <div className="transactions-container">
          <table className="transactions-subtable">
            <thead>
              <tr>
                <th scope="col">Start date</th>
                <th scope="col">End date</th>
                <th scope="col">Monthly rent</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) =>
                editingId === t.id && editState ? (
                  <tr key={t.id}>
                    <td>
                      <input
                        type="date"
                        value={editState.startDate}
                        onChange={(e) => setEditState({ ...editState, startDate: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={editState.endDate}
                        onChange={(e) => setEditState({ ...editState, endDate: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editState.monthlyRent}
                        onChange={(e) => setEditState({ ...editState, monthlyRent: e.target.value })}
                      />
                    </td>
                    <td className="actions">
                      <button onClick={() => saveEdit(t.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id}>
                    <td>{new Date(t.startDate).toLocaleDateString()}</td>
                    <td>{new Date(t.endDate).toLocaleDateString()}</td>
                    <td>{t.monthlyRent.toLocaleString()}</td>
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

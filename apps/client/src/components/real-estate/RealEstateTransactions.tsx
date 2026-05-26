import { useState } from "react";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import { RealEstateTransaction } from "./types";

type Props = {
  realEstateId: string;
  transactions: RealEstateTransaction[];
  onChanged: () => void;
};

export function RealEstateTransactions({ realEstateId, transactions, onChanged }: Props) {
  const token = () => localStorage.getItem("accessToken");
  const [form, setForm] = useState({ startDate: "", endDate: "", monthlyRent: "" });

  const handleAdd = async () => {
    const { startDate, endDate, monthlyRent } = form;
    if (!startDate || !endDate || !monthlyRent) return;
    const res = await fetch("/api/real-estate/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        realEstateId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        monthlyRent: Number(monthlyRent),
      }),
    });
    if (!res.ok) { alert("Failed to add transaction"); return; }
    setForm({ startDate: "", endDate: "", monthlyRent: "" });
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
      <td colSpan={10}>
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
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.startDate).toLocaleDateString()}</td>
                  <td>{new Date(t.endDate).toLocaleDateString()}</td>
                  <td>{t.monthlyRent.toLocaleString()}</td>
                  <td className="actions">
                    <button onClick={() => handleDelete(t.id)}>
                      <img src={deleteIcon} height={20} width={20} alt="delete" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={form.monthlyRent}
                    onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
                    placeholder="Rent"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                </td>
                <td>
                  <button onClick={handleAdd}>Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

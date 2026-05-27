import { useState } from "react";
import { useParams } from "react-router-dom";

type Props = { onAdded: () => void };

export function AddRealEstateTransaction({ onAdded }: Props) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [form, setForm] = useState({ code: "", startDate: "", endDate: "", monthlyRent: "" });
  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleAdd = async () => {
    const { code, startDate, endDate, monthlyRent } = form;
    if (!portfolioId || !code || !startDate || !endDate || !monthlyRent) return;

    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/real-estate/transaction/by-code", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        portfolioId,
        code,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        monthlyRent: Number(monthlyRent),
      }),
    });

    if (!res.ok) { alert("Failed to add transaction"); return; }
    setForm({ code: "", startDate: "", endDate: "", monthlyRent: "" });
    onAdded();
  };

  // columns: expand | Code | Name | Type | Purchase date | Purchase price | Occupancy % | Annual net | Annual net % | Total return | Actions
  return (
    <tr>
      <td></td>
      <td>
        <input
          type="text"
          value={form.code}
          onChange={(e) => set("code", e.target.value)}
          placeholder="Code"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
      </td>
      <td>
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => set("startDate", e.target.value)}
          title="Occupation start"
        />
      </td>
      <td>
        <input
          type="date"
          value={form.endDate}
          onChange={(e) => set("endDate", e.target.value)}
          title="Occupation end"
        />
      </td>
      <td>
        <input
          type="number"
          value={form.monthlyRent}
          onChange={(e) => set("monthlyRent", e.target.value)}
          placeholder="Monthly rent"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
      </td>
      <td colSpan={5}></td>
      <td>
        <button onClick={handleAdd}>Add</button>
      </td>
    </tr>
  );
}

import { useState } from "react";
import { useParams } from "react-router-dom";

type Props = { onAdded: () => void };

export function AddRealEstate({ onAdded }: Props) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: "",
    type: "APARTMENT",
    purchaseDate: "",
    purchasePrice: "",
    monthlyRent: "",
    occupancyPct: "100",
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleAdd = async () => {
    const { name, type, purchaseDate, purchasePrice, monthlyRent, occupancyPct } = form;
    if (!portfolioId || !name || !purchaseDate || !purchasePrice || !monthlyRent) return;

    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/real-estate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name,
        type,
        purchaseDate: new Date(purchaseDate).toISOString(),
        purchasePrice: Number(purchasePrice),
        monthlyRent: Number(monthlyRent),
        occupancyPct: Number(occupancyPct),
        portfolioId,
      }),
    });

    if (!res.ok) { alert("Failed to add property"); return; }

    setForm({ name: "", type: "APARTMENT", purchaseDate: "", purchasePrice: "", monthlyRent: "", occupancyPct: "100" });
    onAdded();
  };

  return (
    <tr>
      <td>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Name"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
      </td>
      <td>
        <select value={form.type} onChange={(e) => set("type", e.target.value)}>
          <option value="APARTMENT">Apartment</option>
          <option value="HOUSE">House</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
      </td>
      <td>
        <input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} />
      </td>
      <td>
        <input type="number" value={form.purchasePrice} onChange={(e) => set("purchasePrice", e.target.value)} placeholder="Price" />
      </td>
      <td>
        <input type="number" value={form.monthlyRent} onChange={(e) => set("monthlyRent", e.target.value)} placeholder="Rent" />
      </td>
      <td>
        <input type="number" value={form.occupancyPct} onChange={(e) => set("occupancyPct", e.target.value)} min="0" max="100" />
      </td>
      <td>—</td>
      <td>—</td>
      <td>—</td>
      <td>
        <button onClick={handleAdd}>Add</button>
      </td>
    </tr>
  );
}

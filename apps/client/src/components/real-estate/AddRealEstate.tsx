import { useState } from "react";
import { useParams } from "react-router-dom";

type Props = { onAdded: () => void };

export function AddRealEstate({ onAdded }: Props) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "APARTMENT",
    purchaseDate: "",
    purchasePrice: "",
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleAdd = async () => {
    const { code, name, type, purchaseDate, purchasePrice } = form;
    if (!portfolioId || !code || !name || !purchaseDate || !purchasePrice) return;

    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/real-estate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        code,
        name,
        type,
        purchaseDate: new Date(purchaseDate).toISOString(),
        purchasePrice: Number(purchasePrice),
        portfolioId,
      }),
    });

    if (!res.ok) { alert("Failed to add property"); return; }
    setForm({ code: "", name: "", type: "APARTMENT", purchaseDate: "", purchasePrice: "" });
    onAdded();
  };

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
      <td colSpan={4}></td>
      <td>
        <button onClick={handleAdd}>Add</button>
      </td>
    </tr>
  );
}

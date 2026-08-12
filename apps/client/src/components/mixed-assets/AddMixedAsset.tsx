import { useState } from "react";
import { useParams } from "react-router-dom";
import { alertMissingFields } from "../../utils/formValidation";

type Props = { onAdded: () => void };

export function AddMixedAsset({ onAdded }: Props) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: "", purchaseDate: "", quantity: "", purchasePrice: "", currentValue: "",
  });
  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleAdd = async () => {
    if (!portfolioId) return;
    const { name, purchaseDate, quantity, purchasePrice, currentValue } = form;
    if (alertMissingFields({
      Name: name,
      "Purchase date": purchaseDate,
      Quantity: quantity,
      "Purchase price": purchasePrice,
    })) return;

    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/mixed-assets", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        portfolioId, name,
        purchaseDate: new Date(purchaseDate).toISOString(),
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        ...(currentValue && { currentValue: Number(currentValue) }),
      }),
    });

    if (!res.ok) { alert("Failed to add asset"); return; }
    setForm({ name: "", purchaseDate: "", quantity: "", purchasePrice: "", currentValue: "" });
    onAdded();
  };

  // 8 cols: Name | Date bought | Qty | Purchase price | Current value | (empty) | (empty) | Add
  return (
    <tr>
      <td><input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} /></td>
      <td><input type="number" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="Qty" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="number" value={form.purchasePrice} onChange={(e) => set("purchasePrice", e.target.value)} placeholder="Price" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="number" value={form.currentValue} onChange={(e) => set("currentValue", e.target.value)} placeholder="Current value" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td></td>
      <td></td>
      <td><button onClick={handleAdd}>Add</button></td>
    </tr>
  );
}

import { useState } from "react";
import { useParams } from "react-router-dom";

type Props = { onAdded: () => void };

export function AddBondTransaction({ onAdded }: Props) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    isin: "", name: "", faceValue: "", couponRate: "",
    couponFrequency: "ANNUAL", quantity: "", pricePerUnit: "", date: "",
  });
  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleAdd = async () => {
    const { isin, name, faceValue, couponRate, couponFrequency, quantity, pricePerUnit, date } = form;
    if (!portfolioId || !isin || !name || !faceValue || !couponRate || !quantity || !pricePerUnit || !date) return;

    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/bonds/transaction/by-isin", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        portfolioId, isin, name,
        faceValue: Number(faceValue),
        couponRate: Number(couponRate),
        couponFrequency,
        maturityDate: new Date("2099-01-01").toISOString(),
        type: "BUY",
        quantity: Number(quantity),
        pricePerUnit: Number(pricePerUnit),
        date: new Date(date).toISOString(),
      }),
    });

    if (!res.ok) { alert("Failed to add bond transaction"); return; }
    setForm({ isin: "", name: "", faceValue: "", couponRate: "", couponFrequency: "ANNUAL", quantity: "", pricePerUnit: "", date: "" });
    onAdded();
  };

  // 12 cols: (empty) | ISIN | Name | Date bought | Qty | Price | Face val | Coupon% | Frequency | (empty) | (empty) | Add
  return (
    <tr>
      <td></td>
      <td><input type="text" value={form.isin} onChange={(e) => set("isin", e.target.value)} placeholder="ISIN" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} title="Date bought" /></td>
      <td><input type="number" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="Qty" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="number" value={form.pricePerUnit} onChange={(e) => set("pricePerUnit", e.target.value)} placeholder="Price" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="number" value={form.faceValue} onChange={(e) => set("faceValue", e.target.value)} placeholder="Face val." onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="number" value={form.couponRate} onChange={(e) => set("couponRate", e.target.value)} placeholder="Coupon %" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td>
        <select value={form.couponFrequency} onChange={(e) => set("couponFrequency", e.target.value)}>
          <option value="ANNUAL">Annual</option>
          <option value="SEMI_ANNUAL">Semi-annual</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
      </td>
      <td></td>
      <td></td>
      <td><button onClick={handleAdd}>Add</button></td>
    </tr>
  );
}

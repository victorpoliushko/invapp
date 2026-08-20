import { useState } from "react";
import { useParams } from "react-router-dom";
import { alertMissingFields } from "../../utils/formValidation";

type Props = { onAdded: () => void };

export function AddBondTransaction({ onAdded }: Props) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    isin: "", name: "", purchaseDate: "", maturityDate: "", quantity: "", purchasePrice: "",
    faceValue: "", couponRate: "", couponFrequency: "ANNUAL",
  });
  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleAdd = async () => {
    if (!portfolioId) return;
    const { isin, name, purchaseDate, maturityDate, quantity, purchasePrice, faceValue, couponRate, couponFrequency } = form;
    if (alertMissingFields({
      ISIN: isin,
      Name: name,
      "Purchase date": purchaseDate,
      "Maturity date": maturityDate,
      Quantity: quantity,
      "Purchase price": purchasePrice,
      "Face value": faceValue,
      "Coupon %": couponRate,
    })) return;

    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/bonds", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        portfolioId, isin, name, couponFrequency,
        purchaseDate: new Date(purchaseDate).toISOString(),
        maturityDate: new Date(maturityDate).toISOString(),
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        faceValue: Number(faceValue),
        couponRate: Number(couponRate),
      }),
    });

    if (!res.ok) { alert("Failed to add bond"); return; }
    setForm({ isin: "", name: "", purchaseDate: "", maturityDate: "", quantity: "", purchasePrice: "", faceValue: "", couponRate: "", couponFrequency: "ANNUAL" });
    onAdded();
  };

  // 14 cols: ISIN | Name | Date bought | Maturity date | Qty | Price | (empty: current value) | Face val | Coupon% | Frequency | (empty) x3 (income/position/gain) | Add
  return (
    <tr>
      <td><input type="text" value={form.isin} onChange={(e) => set("isin", e.target.value)} placeholder="ISIN" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} /></td>
      <td><input type="date" value={form.maturityDate} onChange={(e) => set("maturityDate", e.target.value)} /></td>
      <td><input type="number" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="Qty" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td><input type="number" value={form.purchasePrice} onChange={(e) => set("purchasePrice", e.target.value)} placeholder="Price" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></td>
      <td></td>
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
      <td></td>
      <td><button onClick={handleAdd}>Add</button></td>
    </tr>
  );
}

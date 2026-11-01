import { useState } from "react";
import deleteIcon from "../../assets/crud-icons/delete.svg";
import editIcon from "../../assets/crud-icons/update.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { RealEstate, TYPE_LABELS } from "./types";
import { calcRealEstateStats as calcStats } from "./realEstateMetrics";
import { API_BASE_URL } from "../../config";
import { useDisplayMoney } from "../portfolio/DisplayCurrency";

type Props = {
  property: RealEstate;
  isExpanded: boolean;
  onExpand: () => void;
  onDelete: (id: string) => void;
  onUpdated: () => void;
};

function toDateInputValue(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function RealEstateRow({ property, isExpanded, onExpand, onDelete, onUpdated }: Props) {
  const { money, signedMoney } = useDisplayMoney();
  const { occupancyPct, annualNet, annualNetPct, totalReturn } = calcStats(property);
  const gain = (v: number) => ({ color: v >= 0 ? "var(--text-success)" : "var(--text-danger)" });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    code: property.code ?? "",
    name: property.name,
    type: property.type,
    purchaseDate: toDateInputValue(property.purchaseDate),
    purchasePrice: String(property.purchasePrice),
    currentValue: property.currentValue != null ? String(property.currentValue) : "",
    rooms: property.rooms != null ? String(property.rooms) : "",
    totalArea: property.totalArea != null ? String(property.totalArea) : "",
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const startEditing = () => {
    setForm({
      code: property.code ?? "",
      name: property.name,
      type: property.type,
      purchaseDate: toDateInputValue(property.purchaseDate),
      purchasePrice: String(property.purchasePrice),
      currentValue: property.currentValue != null ? String(property.currentValue) : "",
      rooms: property.rooms != null ? String(property.rooms) : "",
      totalArea: property.totalArea != null ? String(property.totalArea) : "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const { code, name, type, purchaseDate, purchasePrice, currentValue, rooms, totalArea } = form;
    if (!code || !name || !purchaseDate || !purchasePrice || !rooms || !totalArea) return;

    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE_URL}/real-estate/${property.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        code,
        name,
        type,
        purchaseDate: new Date(purchaseDate).toISOString(),
        purchasePrice: Number(purchasePrice),
        ...(currentValue !== "" && { currentValue: Number(currentValue) }),
        rooms: Number(rooms),
        totalArea: Number(totalArea),
      }),
    });

    if (!res.ok) { alert("Failed to update property"); return; }
    setIsEditing(false);
    onUpdated();
  };

  if (isEditing) {
    return (
      <tr>
        <td></td>
        <td>
          <input type="text" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="Code" />
        </td>
        <td>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" />
        </td>
        <td>
          <select value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="PARKING_LOT">Parking lot</option>
            <option value="OTHER">Other</option>
          </select>
        </td>
        <td>
          <input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} />
        </td>
        <td>
          <input type="number" value={form.purchasePrice} onChange={(e) => set("purchasePrice", e.target.value)} placeholder="Price" />
        </td>
        <td>
          <input type="number" value={form.currentValue} onChange={(e) => set("currentValue", e.target.value)} placeholder="Current value" />
        </td>
        <td>
          <input type="number" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} placeholder="Rooms" min={0} />
        </td>
        <td>
          <input type="number" value={form.totalArea} onChange={(e) => set("totalArea", e.target.value)} placeholder="Area, m²" min={0} />
        </td>
        <td colSpan={4}></td>
        <td className="actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        <button onClick={onExpand}>{isExpanded ? "▼" : "►"}</button>
      </td>
      <td data-label="Code">{property.code}</td>
      <td data-label="Name">{property.name}</td>
      <td data-label="Type">{TYPE_LABELS[property.type] ?? property.type}</td>
      <td data-label="Purchase date">{new Date(property.purchaseDate).toLocaleDateString()}</td>
      <td data-label="Purchase price">{money(property.purchasePrice)}</td>
      <td data-label="Current value">{property.currentValue != null ? money(property.currentValue) : "—"}</td>
      <td data-label="Rooms">{property.rooms ?? "—"}</td>
      <td data-label="Total area, m²">{property.totalArea != null ? property.totalArea.toLocaleString() : "—"}</td>
      <td data-label="Occupancy %">{occupancyPct.toFixed(1)}%</td>
      <td data-label="Annual net income" style={gain(annualNet)}>{money(annualNet)}</td>
      <td data-label="Annual net income %" style={gain(annualNetPct)}>{annualNetPct.toFixed(2)}%</td>
      <td data-label="Total return" style={gain(totalReturn)}>
        {signedMoney(totalReturn)}
      </td>
      <td className="actions">
        <button className="icon-btn" onClick={startEditing}>
          <img src={editIcon} height={24} width={24} alt="edit" />
        </button>
        <button className="icon-btn" onClick={() => onDelete(property.id)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
}

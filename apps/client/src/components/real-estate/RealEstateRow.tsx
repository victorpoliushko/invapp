import { useState } from "react";
import deleteIcon from "../../assets/crud-icons/delete.svg";
import editIcon from "../../assets/crud-icons/update.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { RealEstate } from "./types";
import { API_BASE_URL } from "../../config";

type Props = {
  property: RealEstate;
  isExpanded: boolean;
  onExpand: () => void;
  onDelete: (id: string) => void;
  onUpdated: () => void;
};

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  COMMERCIAL: "Commercial",
};

function calcStats(property: RealEstate) {
  const purchaseMs = new Date(property.purchaseDate).getTime();
  const nowMs = Date.now();
  const totalDays = (nowMs - purchaseMs) / (1000 * 60 * 60 * 24);

  let occupiedDays = 0;
  let totalRentEarned = 0;

  for (const t of property.transactions) {
    const start = new Date(t.startDate).getTime();
    const end = new Date(t.endDate).getTime();
    const days = (end - start) / (1000 * 60 * 60 * 24);
    occupiedDays += days;
    totalRentEarned += (days / 30.4375) * t.monthlyRent;
  }

  const occupancyPct = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;
  const yearsSincePurchase = totalDays / 365.25;
  const annualNet = yearsSincePurchase > 0 ? totalRentEarned / yearsSincePurchase : 0;
  const annualNetPct = property.purchasePrice > 0 ? (annualNet / property.purchasePrice) * 100 : 0;
  const capitalGain = property.currentValue != null ? property.currentValue - property.purchasePrice : 0;

  return { occupancyPct, annualNet, annualNetPct, totalReturn: totalRentEarned + capitalGain };
}

function toDateInputValue(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function RealEstateRow({ property, isExpanded, onExpand, onDelete, onUpdated }: Props) {
  const { occupancyPct, annualNet, annualNetPct, totalReturn } = calcStats(property);
  const gain = (v: number) => ({ color: v >= 0 ? "#4caf50" : "#e57373" });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    code: property.code,
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
      code: property.code,
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
      <td data-label="Purchase price">{property.purchasePrice.toLocaleString()}</td>
      <td data-label="Current value">{property.currentValue != null ? property.currentValue.toLocaleString() : "—"}</td>
      <td data-label="Rooms">{property.rooms ?? "—"}</td>
      <td data-label="Total area, m²">{property.totalArea != null ? property.totalArea.toLocaleString() : "—"}</td>
      <td data-label="Occupancy %">{occupancyPct.toFixed(1)}%</td>
      <td data-label="Annual net income" style={gain(annualNet)}>{Math.round(annualNet).toLocaleString()}</td>
      <td data-label="Annual net income %" style={gain(annualNetPct)}>{annualNetPct.toFixed(2)}%</td>
      <td data-label="Total return" style={gain(totalReturn)}>
        {totalReturn >= 0 ? "+" : ""}
        {Math.round(totalReturn).toLocaleString()}
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

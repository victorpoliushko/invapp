import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { RealEstateRow } from "./RealEstateRow";
import { AddRealEstate } from "./AddRealEstate";

type RealEstate = {
  id: string;
  name: string;
  type: string;
  purchaseDate: string;
  purchasePrice: number;
  monthlyRent: number;
  occupancyPct: number;
};

export function RealEstateTable() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [properties, setProperties] = useState<RealEstate[]>([]);

  const load = useCallback(async () => {
    if (!portfolioId) return;
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/real-estate/${portfolioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProperties(await res.json());
  }, [portfolioId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/real-estate/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) load();
    else alert("Failed to delete property");
  };

  return (
    <table className="assets-table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Type</th>
          <th scope="col">Purchase date</th>
          <th scope="col">Purchase price</th>
          <th scope="col">Monthly rent</th>
          <th scope="col">Occupancy %</th>
          <th scope="col">Annual net income</th>
          <th scope="col">Annual net income %</th>
          <th scope="col">Total return</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {properties.map((p) => (
          <RealEstateRow key={p.id} property={p} onDelete={handleDelete} />
        ))}
        <AddRealEstate onAdded={load} />
      </tbody>
    </table>
  );
}

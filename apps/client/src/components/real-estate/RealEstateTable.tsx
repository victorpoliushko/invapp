import { Fragment, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { RealEstateRow } from "./RealEstateRow";
import { RealEstateTransactions } from "./RealEstateTransactions";
import { AddRealEstate } from "./AddRealEstate";
import { RealEstate } from "./types";

export function RealEstateTable() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [properties, setProperties] = useState<RealEstate[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          <th></th>
          <th scope="col">Code</th>
          <th scope="col">Name</th>
          <th scope="col">Type</th>
          <th scope="col">Purchase date</th>
          <th scope="col">Purchase price</th>
          <th scope="col">Occupancy %</th>
          <th scope="col">Annual net income</th>
          <th scope="col">Annual net income %</th>
          <th scope="col">Total return</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {properties.map((p) => (
          <Fragment key={p.id}>
            <RealEstateRow
              property={p}
              isExpanded={expandedId === p.id}
              onExpand={() => setExpandedId(expandedId === p.id ? null : p.id)}
              onDelete={handleDelete}
            />
            {expandedId === p.id && (
              <RealEstateTransactions
                realEstateId={p.id}
                transactions={p.transactions}
                onChanged={load}
              />
            )}
          </Fragment>
        ))}
        <AddRealEstate onAdded={load} />
      </tbody>
    </table>
  );
}

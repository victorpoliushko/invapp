import { Fragment, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { BondRow } from "./BondRow";
import { BondTransactions } from "./BondTransactions";
import { AddBondTransaction } from "./AddBondTransaction";
import { Bond } from "./types";
import "../../pages/portfolio/PortfolioPage.css";

export function BondTable() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!portfolioId) return;
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/bonds/${portfolioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setBonds(await res.json());
  }, [portfolioId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/bonds/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) load();
    else alert("Failed to delete bond");
  };

  return (
    <table className="assets-table">
      <thead>
        <tr>
          <th></th>
          <th scope="col">ISIN</th>
          <th scope="col">Name</th>
          <th scope="col">Date bought</th>
          <th scope="col">Quantity</th>
          <th scope="col">Avg price</th>
          <th scope="col">Face value</th>
          <th scope="col">Coupon %</th>
          <th scope="col">Frequency</th>
          <th scope="col">Annual income</th>
          <th scope="col">Total position</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {bonds.map((bond) => (
          <Fragment key={bond.id}>
            <BondRow
              bond={bond}
              isExpanded={expandedId === bond.id}
              onExpand={() => setExpandedId(expandedId === bond.id ? null : bond.id)}
              onDelete={handleDelete}
            />
            {expandedId === bond.id && (
              <BondTransactions
                bondId={bond.id}
                transactions={bond.transactions}
                onChanged={load}
              />
            )}
          </Fragment>
        ))}
        <AddBondTransaction onAdded={load} />
      </tbody>
    </table>
  );
}

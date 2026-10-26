import { BondRow } from "./BondRow";
import { AddBondTransaction } from "./AddBondTransaction";
import { Bond } from "./types";
import "../../pages/portfolio/PortfolioPage.css";
import { API_BASE_URL } from "../../config";

export function BondTable({ bonds, onChanged }: { bonds: Bond[]; onChanged: () => void }) {
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE_URL}/bonds/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onChanged();
    else alert("Failed to delete bond");
  };

  return (
    <div className="table-scroll">
    <table className="assets-table">
      <thead>
        <tr>
          <th scope="col">ISIN</th>
          <th scope="col">Name</th>
          <th scope="col">Date bought</th>
          <th scope="col">Maturity date</th>
          <th scope="col">Quantity</th>
          <th scope="col">Purchase price</th>
          <th scope="col">Current value</th>
          <th scope="col">Face value</th>
          <th scope="col">Coupon %</th>
          <th scope="col">Frequency</th>
          <th scope="col">Annual income</th>
          <th scope="col">Total position</th>
          <th scope="col">Capital gain</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {bonds.map((bond) => (
          <BondRow key={bond.id} bond={bond} onDelete={handleDelete} onUpdated={onChanged} />
        ))}
        <AddBondTransaction onAdded={onChanged} />
      </tbody>
    </table>
    </div>
  );
}

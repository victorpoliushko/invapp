import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MixedAssetRow } from "./MixedAssetRow";
import { AddMixedAsset } from "./AddMixedAsset";
import { MixedAsset } from "./types";
import "../../pages/portfolio/PortfolioPage.css";

export function MixedAssetTable() {
  const { id: portfolioId } = useParams<{ id: string }>();
  const [assets, setAssets] = useState<MixedAsset[]>([]);

  const load = useCallback(async () => {
    if (!portfolioId) return;
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/mixed-assets/${portfolioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setAssets(await res.json());
  }, [portfolioId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/mixed-assets/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) load();
    else alert("Failed to delete asset");
  };

  return (
    <div className="table-scroll">
    <table className="assets-table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Date bought</th>
          <th scope="col">Quantity</th>
          <th scope="col">Purchase price</th>
          <th scope="col">Current value</th>
          <th scope="col">Total position</th>
          <th scope="col">% return</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <MixedAssetRow key={asset.id} asset={asset} onDelete={handleDelete} />
        ))}
        <AddMixedAsset onAdded={load} />
      </tbody>
    </table>
    </div>
  );
}

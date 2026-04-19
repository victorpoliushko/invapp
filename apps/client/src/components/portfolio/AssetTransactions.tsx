import React from "react";
import { PortfolioAssetDto } from "../../../../api/src/portfolios/dto/PortfolioAsset.dto";
import { usePortfolio } from "../../context/PortfolioContext";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import "../../pages/portfolio/PortfolioPage.css";

export function AssetTransactions({
  portfolioAsset,
}: {
  portfolioAsset: PortfolioAssetDto;
}) {
  const COLUMN_COUNT = 7;
  const { refreshData } = usePortfolio();
  const token = localStorage.getItem("accessToken");

  const onDeleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions`, {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Delete failed");
      
      await refreshData();
    } catch (error) {
      alert("Could not delete transaction");
    }
  };

  return (
    <tr className="detail-row">
      <td colSpan={COLUMN_COUNT + 1}>
        <div className="transactions-container">
          <table className="transactions-subtable">
            <thead>
              <tr>
                <th scope="col">Actions</th>
                <th scope="col">Type</th>
                <th scope="col">Asset</th>
                <th scope="col">Date</th>
                <th scope="col">Quantity</th>
                <th scope="col">Price</th>
                <th scope="col">Delete</th>
              </tr>
            </thead>
            <tbody>
              {portfolioAsset.assets.transactions?.map((t) => (
                <tr key={t.id}>
                  <td>
                    <button title={`Edit`}>
                      <img src={editIcon} height={20} width={20} alt="edit" />
                    </button>
                  </td>
                  <td style={{ color: t.type === "BUY" ? "#4caf50" : "#e57373" }}>
                    {t.type}
                  </td>
                  <td>{portfolioAsset.assets.ticker}</td>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.quantityChange}</td>
                  <td>{t.pricePerUnit}</td>
                  <td>
                    <button onClick={() => onDeleteTransaction(t.id)}>
                      <img src={deleteIcon} height={20} width={20} alt="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

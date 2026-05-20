import React from "react";
import { TransactionsDto } from "../../../../api/src/transactions/dto/Transations.dto";
import { usePortfolio } from "../../context/PortfolioContext";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import "../../pages/portfolio/PortfolioPage.css";

export function AssetTransactions({
  assetTicker,
  portfolioAssetTransactions,
}: {
  assetTicker: string;
  portfolioAssetTransactions: TransactionsDto[];
}) {
  const { refreshPortfolio } = usePortfolio();
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
      
      await refreshPortfolio();
    } catch (error) {
      alert("Could not delete transaction");
    }
  };

  return (
    <tr className="detail-row">
      <td colSpan={8}>
        <div className="transactions-container">
          <table className="transactions-subtable">
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Asset</th>
                <th scope="col">Date</th>
                <th scope="col">Quantity</th>
                <th scope="col">Price</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolioAssetTransactions?.map((transaction) => (
                <tr key={transaction.id}>
                  <td style={{ color: transaction.type === "BUY" ? "#4caf50" : "#e57373" }}>
                    {transaction.type}
                  </td>
                  <td>{assetTicker}</td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.quantityChange}</td>
                  <td>{transaction.pricePerUnit}</td>
                  <td className="actions">
                    <button title="Edit">
                      <img src={editIcon} height={20} width={20} alt="edit" />
                    </button>
                    <button onClick={() => onDeleteTransaction(transaction.id)}>
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

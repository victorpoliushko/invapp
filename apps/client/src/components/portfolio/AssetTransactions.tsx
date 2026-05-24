import { useState } from "react";
import { TransactionsDto } from "../../../../api/src/transactions/dto/Transations.dto";
import { usePortfolio } from "../../context/PortfolioContext";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";
import "../../pages/portfolio/PortfolioPage.css";

type EditState = {
  date: string;
  quantityChange: string;
  pricePerUnit: string;
};

export function AssetTransactions({
  assetTicker,
  portfolioAssetTransactions,
}: {
  assetTicker: string;
  portfolioAssetTransactions: TransactionsDto[];
}) {
  const { refreshPortfolio } = usePortfolio();
  const token = localStorage.getItem("accessToken");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  const startEdit = (transaction: TransactionsDto) => {
    setEditingId(transaction.id);
    setEditState({
      date: transaction.date,
      quantityChange: String(transaction.quantityChange),
      pricePerUnit: String(transaction.pricePerUnit),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const saveEdit = async (id: string) => {
    if (!editState) return;
    try {
      const res = await fetch(`/api/transactions`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          date: editState.date,
          quantityChange: parseFloat(editState.quantityChange),
          pricePerUnit: parseFloat(editState.pricePerUnit),
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      cancelEdit();
      await refreshPortfolio();
    } catch {
      alert("Could not update transaction");
    }
  };

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
    } catch {
      alert("Could not delete transaction");
    }
  };

  return (
    <tr className="detail-row">
      <td colSpan={9}>
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
              {portfolioAssetTransactions?.map((transaction) =>
                editingId === transaction.id && editState ? (
                  <tr key={transaction.id}>
                    <td style={{ color: transaction.type === "BUY" ? "#4caf50" : "#e57373" }}>
                      {transaction.type}
                    </td>
                    <td>{assetTicker}</td>
                    <td>
                      <input
                        type="date"
                        value={editState.date}
                        onChange={(e) => setEditState({ ...editState, date: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editState.quantityChange}
                        onChange={(e) => setEditState({ ...editState, quantityChange: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editState.pricePerUnit}
                        onChange={(e) => setEditState({ ...editState, pricePerUnit: e.target.value })}
                      />
                    </td>
                    <td className="actions">
                      <button onClick={() => saveEdit(transaction.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={transaction.id}>
                    <td style={{ color: transaction.type === "BUY" ? "#4caf50" : "#e57373" }}>
                      {transaction.type}
                    </td>
                    <td>{assetTicker}</td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.quantityChange}</td>
                    <td>{transaction.pricePerUnit}</td>
                    <td className="actions">
                      <button title="Edit" onClick={() => startEdit(transaction)}>
                        <img src={editIcon} height={20} width={20} alt="edit" />
                      </button>
                      <button onClick={() => onDeleteTransaction(transaction.id)}>
                        <img src={deleteIcon} height={20} width={20} alt="delete" />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

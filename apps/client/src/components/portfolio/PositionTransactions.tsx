import { useState } from "react";
import { TransactionsDto } from "../../types/portfolio";
import { usePortfolio } from "../../context/PortfolioContext";
import editIcon from "../../assets/crud-icons/update.svg";
import deleteIcon from "../../assets/crud-icons/delete.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { TRANSACTION_COLORS } from "./transactionColors";
import { formatQuantity } from "../../utils/formatQuantity";
import { useDisplayMoney } from "./DisplayCurrency";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import { positionFromTrades } from "../../finance/positions";

type EditState = {
  date: string;
  quantityChange: string;
  pricePerUnit: string;
};

export function PositionTransactions({
  assetTicker,
  assetType,
  transactions,
}: {
  assetTicker: string;
  assetType: "stock" | "crypto";
  transactions: TransactionsDto[];
}) {
  const { money } = useDisplayMoney();
  const { refreshPortfolio } = usePortfolio();
  const fetchWithRedirect = useFetchWithRedirect();
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
    const edited = {
      date: editState.date,
      quantityChange: parseFloat(editState.quantityChange),
      pricePerUnit: parseFloat(editState.pricePerUnit),
    };
    const position = positionFromTrades(transactions.map((t) => (t.id === id ? { ...t, ...edited } : t)));
    try {
      const res = await fetchWithRedirect(`/transactions`, {
        method: "PATCH",
        body: JSON.stringify({ id, ...edited, position }),
      });
      if (!res.ok) throw new Error("Update failed");
      cancelEdit();
      await refreshPortfolio();
    } catch {
      alert("Could not update transaction");
    }
  };

  const onDeleteTransaction = async (id: string) => {
    const position = positionFromTrades(transactions.filter((t) => t.id !== id));
    try {
      const res = await fetchWithRedirect(`/transactions`, {
        method: "DELETE",
        body: JSON.stringify({ id, position }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await refreshPortfolio();
    } catch {
      alert("Could not delete transaction");
    }
  };

  return (
    <tr className="detail-row">
      <td colSpan={10}>
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
              {transactions?.map((transaction) =>
                editingId === transaction.id && editState ? (
                  <tr key={transaction.id}>
                    <td style={{ color: TRANSACTION_COLORS[transaction.type as "BUY" | "SELL"] }}>
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
                    <td style={{ color: TRANSACTION_COLORS[transaction.type as "BUY" | "SELL"] }}>
                      {transaction.type}
                    </td>
                    <td>{assetTicker}</td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{formatQuantity(transaction.quantityChange, assetType)}</td>
                    <td>{money(transaction.pricePerUnit, "USD", 2)}</td>
                    <td className="actions">
                      <button className="icon-btn" title="Edit" onClick={() => startEdit(transaction)}>
                        <img src={editIcon} height={20} width={20} alt="edit" />
                      </button>
                      <button className="icon-btn" onClick={() => onDeleteTransaction(transaction.id)}>
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

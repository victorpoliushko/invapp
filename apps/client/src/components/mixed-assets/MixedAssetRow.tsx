import deleteIcon from "../../assets/crud-icons/delete.svg";
import "../../pages/portfolio/PortfolioPage.css";
import { MixedAsset } from "./types";
import { useDisplayMoney } from "../portfolio/DisplayCurrency";

export function MixedAssetRow({ asset, onDelete }: { asset: MixedAsset; onDelete: (id: string) => void }) {
  const { money } = useDisplayMoney();
  const totalPosition = asset.purchasePrice * asset.quantity;
  const currentTotal = asset.currentValue != null ? asset.currentValue * asset.quantity : null;
  const dollarReturn = currentTotal != null ? currentTotal - totalPosition : null;
  const pctReturn = dollarReturn != null && totalPosition > 0 ? (dollarReturn / totalPosition) * 100 : null;

  return (
    <tr>
      <td data-label="Name">{asset.name}</td>
      <td data-label="Date bought">{new Date(asset.purchaseDate).toLocaleDateString()}</td>
      <td data-label="Quantity">{asset.quantity}</td>
      <td data-label="Purchase price">{money(asset.purchasePrice, "USD", 2)}</td>
      <td data-label="Current value">{asset.currentValue != null ? money(asset.currentValue, "USD", 2) : "—"}</td>
      <td data-label="Total position">{money(currentTotal ?? totalPosition)}</td>
      <td data-label="% return">{pctReturn != null ? `${pctReturn.toFixed(2)}%` : "—"}</td>
      <td className="actions">
        <button className="icon-btn" onClick={() => onDelete(asset.id)}>
          <img src={deleteIcon} height={30} width={30} alt="delete" />
        </button>
      </td>
    </tr>
  );
}

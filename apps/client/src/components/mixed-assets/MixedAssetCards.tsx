import { useState } from "react";
import { MaskIcon } from "../MaskIcon";
import searchIcon from "../../assets/icons/search.svg";
import { ConfirmDialog } from "../ConfirmDialog";
import { useDisplayMoney } from "../portfolio/DisplayCurrency";
import { gainColor, signedPct } from "../../utils/money";
import { MixedAsset } from "./types";
import { useMixedAssetActions } from "./useMixedAssets";
import { UpdateValueModal } from "./UpdateValueModal";

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: "numeric", day: "numeric", year: "2-digit" };

export function MixedAssetCards({ assets }: { assets: MixedAsset[] }) {
  const { deleteAsset } = useMixedAssetActions();
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<{ id: string; kind: "value" | "sell" } | null>(null);

  const q = query.trim().toLowerCase();
  const visible = assets.filter((a) => !q || a.name.toLowerCase().includes(q));
  const target = action ? assets.find((a) => a.id === action.id) : undefined;
  const close = () => setAction(null);

  return (
    <div className="position-cards">
      <label className="search-input">
        <MaskIcon src={searchIcon} size={24} />
        <input
          className="input"
          type="search"
          placeholder="Search"
          aria-label="Search other assets"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {visible.map((a) => (
        <MixedAssetCard key={a.id} asset={a} onAction={(kind) => setAction({ id: a.id, kind })} />
      ))}

      {visible.length === 0 && (
        <p className="position-cards-empty">{q ? "No matches" : "There are no assets yet."}</p>
      )}

      {target && action?.kind === "value" && <UpdateValueModal asset={target} onClose={close} />}
      {target && action?.kind === "sell" && (
        <ConfirmDialog
          title={`Sell ${target.name}?`}
          message="The asset will be removed from this portfolio."
          confirmLabel="Sell"
          onConfirm={async () => {
            await deleteAsset(target.id);
            close();
          }}
          onCancel={close}
        />
      )}
    </div>
  );
}

function MixedAssetCard({ asset, onAction }: { asset: MixedAsset; onAction: (kind: "value" | "sell") => void }) {
  const { money } = useDisplayMoney();
  const cost = asset.purchasePrice * asset.quantity;
  const current = asset.currentValue != null ? asset.currentValue * asset.quantity : null;
  const pct = current != null && cost > 0 ? ((current - cost) / cost) * 100 : null;

  return (
    <article className="position-card">
      <div className="position-card-header">
        <div>
          <h3 className="position-card-ticker">{asset.name}</h3>
          <p className="position-card-subtitle">
            Bought {new Date(asset.purchaseDate).toLocaleDateString(undefined, SHORT_DATE)}
          </p>
        </div>
      </div>

      <dl className="position-card-metrics bond-card-metrics">
        <div>
          <dt>Quantity</dt>
          <dd>{asset.quantity}</dd>
        </div>
        <div className="position-card-metric-end">
          <dt>Total position</dt>
          <dd>{money(current ?? cost)}</dd>
        </div>
        <div>
          <dt>Buying price</dt>
          <dd>{money(asset.purchasePrice, "USD", 2)}</dd>
        </div>
        <div className="position-card-metric-end">
          <dt>Return</dt>
          <dd style={pct != null ? { color: gainColor(pct) } : undefined}>{pct != null ? signedPct(pct, 2) : "—"}</dd>
        </div>
      </dl>

      <div className="position-card-actions">
        <button className="btn btn-primary" onClick={() => onAction("value")}>Update value</button>
        <button className="btn btn-secondary" onClick={() => onAction("sell")}>Sell</button>
      </div>
    </article>
  );
}

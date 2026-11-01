import { useState } from "react";
import { MaskIcon } from "../MaskIcon";
import searchIcon from "../../assets/icons/search.svg";
import eyeIcon from "../../assets/icons/eye.svg";
import { ConfirmDialog } from "../ConfirmDialog";
import { useDisplayMoney } from "../portfolio/DisplayCurrency";
import { signedPct } from "../../utils/money";
import { RealEstate, TYPE_LABELS } from "./types";
import { activeLease, calcRealEstateStats } from "./realEstateMetrics";
import { useRealEstateActions } from "./useRealEstate";
import { RealEstateDetailsModal } from "./RealEstateDetailsModal";
import { LendModal } from "./LendModal";

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: "numeric", day: "numeric", year: "2-digit" };

type Action = { id: string; kind: "details" | "lend" | "terminate" | "sell" };

export function RealEstateCards({ properties }: { properties: RealEstate[] }) {
  const { deleteProperty, terminate } = useRealEstateActions();
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<Action | null>(null);

  const q = query.trim().toLowerCase();
  const visible = properties.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || (TYPE_LABELS[p.type] ?? p.type).toLowerCase().includes(q),
  );
  const target = action ? properties.find((p) => p.id === action.id) : undefined;
  const close = () => setAction(null);
  const lease = target ? activeLease(target) : undefined;

  return (
    <div className="position-cards">
      <label className="search-input">
        <MaskIcon src={searchIcon} size={24} />
        <input
          className="input"
          type="search"
          placeholder="Search"
          aria-label="Search real estate"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {visible.map((p) => (
        <RealEstateCard key={p.id} property={p} onAction={(kind) => setAction({ id: p.id, kind })} />
      ))}

      {visible.length === 0 && (
        <p className="position-cards-empty">{q ? "No matches" : "No real estate yet — add some with New Asset."}</p>
      )}

      {target && action?.kind === "details" && <RealEstateDetailsModal property={target} onClose={close} />}
      {target && action?.kind === "lend" && <LendModal property={target} onClose={close} />}
      {target && action?.kind === "terminate" && lease && (
        <ConfirmDialog
          title="Confirm termination"
          message="Are you sure you want to terminate lending?"
          confirmLabel="Terminate"
          onConfirm={async () => {
            await terminate(lease);
            close();
          }}
          onCancel={close}
        />
      )}
      {target && action?.kind === "sell" && (
        <ConfirmDialog
          title={`Sell ${target.name}?`}
          message="The property and its history will be removed from this portfolio."
          confirmLabel="Sell"
          onConfirm={async () => {
            await deleteProperty(target.id);
            close();
          }}
          onCancel={close}
        />
      )}
    </div>
  );
}

function RealEstateCard({
  property,
  onAction,
}: {
  property: RealEstate;
  onAction: (kind: Action["kind"]) => void;
}) {
  const { money } = useDisplayMoney();
  const { annualNet, annualNetPct } = calcRealEstateStats(property);
  const leased = activeLease(property) != null;

  return (
    <article className="position-card">
      <div className="position-card-header">
        <div>
          <h3 className="position-card-ticker">{property.name}</h3>
          <p className="position-card-subtitle">{TYPE_LABELS[property.type] ?? property.type}</p>
        </div>
        <button className="icon-button" aria-label={`${property.name} details`} onClick={() => onAction("details")}>
          <MaskIcon src={eyeIcon} size={20} />
        </button>
      </div>

      <dl className="position-card-metrics bond-card-metrics">
        <div>
          <dt>Buying price</dt>
          <dd>{money(property.purchasePrice)}</dd>
        </div>
        <div className="position-card-metric-end">
          <dt>Annual net income</dt>
          <dd className="text-success">{money(annualNet, "USD", 2)}</dd>
        </div>
        <div>
          <dt>Buying date</dt>
          <dd>{new Date(property.purchaseDate).toLocaleDateString(undefined, SHORT_DATE)}</dd>
        </div>
        <div className="position-card-metric-end">
          <dt>Annual net income</dt>
          <dd className="text-success">{signedPct(annualNetPct, 2)}</dd>
        </div>
      </dl>

      <div className="position-card-actions">
        <button className="btn btn-primary" onClick={() => onAction(leased ? "terminate" : "lend")}>
          {leased ? "Terminate" : "Lend"}
        </button>
        <button className="btn btn-secondary" onClick={() => onAction("sell")}>Sell</button>
      </div>
    </article>
  );
}

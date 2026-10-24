import { useEffect, useRef, useState } from "react";
import { MaskIcon } from "../MaskIcon";
import chevronDownIcon from "../../assets/icons/chevron-down.svg";
import checkIcon from "../../assets/icons/check.svg";

export type AssetTab = "stocks" | "bonds" | "realestate" | "crypto" | "other";

const OPTIONS: { tab: AssetTab; label: string }[] = [
  { tab: "stocks", label: "Stock" },
  { tab: "bonds", label: "Bonds" },
  { tab: "realestate", label: "Real Estate" },
  { tab: "crypto", label: "Crypto" },
  { tab: "other", label: "Other" },
];

export function NewAssetMenu({ current, onSelect }: { current: AssetTab; onSelect: (tab: AssetTab) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="menu-anchor" ref={ref}>
      <button
        className="btn-pill"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        New Asset
        <span className={open ? "menu-chevron menu-chevron-open" : "menu-chevron"}>
          <MaskIcon src={chevronDownIcon} size={16} />
        </span>
      </button>
      {open && (
        <ul className="menu" role="menu">
          {OPTIONS.map((o) => (
            <li key={o.tab} role="none">
              <button
                className="menu-item"
                role="menuitem"
                aria-current={o.tab === current}
                onClick={() => {
                  setOpen(false);
                  onSelect(o.tab);
                }}
              >
                {o.tab === current && (
                  <span className="menu-item-check">
                    <MaskIcon src={checkIcon} size={20} />
                  </span>
                )}
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

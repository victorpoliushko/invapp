import { useEffect, useRef, useState } from "react";
import { MaskIcon } from "./MaskIcon";
import chevronDownIcon from "../assets/icons/chevron-down.svg";
import checkIcon from "../assets/icons/check.svg";
import { CURRENCIES, Currency } from "../context/CurrencyContext";

export function CurrencySelect({
  value,
  onChange,
  label = "Display currency",
  align = "end",
}: {
  value: string;
  onChange: (currency: Currency) => void;
  label?: string;
  align?: "start" | "end";
}) {
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
        className="btn-pill btn-pill-secondary"
        aria-label={`${label}: ${value}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {value}
        <span className={open ? "menu-chevron menu-chevron-open" : "menu-chevron"}>
          <MaskIcon src={chevronDownIcon} size={16} />
        </span>
      </button>
      {open && (
        <ul className={align === "start" ? "menu menu-start" : "menu"} role="menu">
          {CURRENCIES.map((c) => (
            <li key={c} role="none">
              <button
                className="menu-item"
                role="menuitem"
                aria-current={c === value}
                onClick={() => {
                  setOpen(false);
                  onChange(c);
                }}
              >
                {c === value && (
                  <span className="menu-item-check">
                    <MaskIcon src={checkIcon} size={20} />
                  </span>
                )}
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

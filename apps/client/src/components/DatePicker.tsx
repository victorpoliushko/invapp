import { useState } from "react";
import { CalendarMonth } from "./calendar/CalendarMonth";
import { formatFieldDate, parseDate, toDateValue } from "./calendar/calendarUtils";

export function DatePicker({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const [view, setView] = useState(() => selected ?? new Date());

  const toggle = () => {
    if (!open) setView(selected ?? new Date());
    setOpen((o) => !o);
  };

  return (
    <div className="date-picker">
      <button type="button" className="input date-range-control" onClick={toggle} aria-expanded={open}
        aria-label={ariaLabel}>
        <span className={selected ? undefined : "date-range-placeholder"}>{formatFieldDate(selected)}</span>
      </button>
      {open && (
        <div className="date-range-panel">
          <CalendarMonth
            view={view}
            onViewChange={setView}
            isSelected={(d) => selected?.getTime() === d.getTime()}
            dayClassName={(d) => (selected?.getTime() === d.getTime() ? "date-range-day-endpoint" : "")}
            onPick={(d) => {
              onChange(toDateValue(d));
              setOpen(false);
            }}
          />
          <div className="confirm-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onChange(toDateValue(new Date()));
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

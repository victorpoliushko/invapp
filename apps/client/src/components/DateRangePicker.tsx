import { useState } from "react";
import { CalendarMonth } from "./calendar/CalendarMonth";
import { DAY_MS, formatFieldDate as fieldDate, parseDate as parse, toDateValue as toValue } from "./calendar/calendarUtils";

function summary(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const month = (d: Date) => d.toLocaleDateString(undefined, { month: "short" });
  if (sameMonth) return `${month(start)} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  const first = start.toLocaleDateString(undefined, { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
  const last = end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${first} – ${last}`;
}

export function DateRangePicker({
  start,
  end,
  onChange,
  startLabel = "Start date",
  endLabel = "End date",
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  startLabel?: string;
  endLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState<Date | null>(parse(start));
  const [draftEnd, setDraftEnd] = useState<Date | null>(parse(end));
  const [view, setView] = useState(() => parse(start) ?? new Date());

  const openPicker = () => {
    setDraftStart(parse(start));
    setDraftEnd(parse(end));
    setView(parse(start) ?? new Date());
    setOpen(true);
  };

  const pick = (day: Date) => {
    if (!draftStart || draftEnd) {
      setDraftStart(day);
      setDraftEnd(null);
    } else if (day < draftStart) {
      setDraftStart(day);
    } else {
      setDraftEnd(day);
    }
  };

  const shownStart = open ? draftStart : parse(start);
  const shownEnd = open ? draftEnd : parse(end);

  const controls = (
    <div className="field-row">
      {[
        { label: startLabel, date: shownStart },
        { label: endLabel, date: shownEnd },
      ].map(({ label, date }) => (
        <div key={label} className="field">
          <span className="field-label">{label}</span>
          <button type="button" className="input date-range-control" onClick={open ? undefined : openPicker}>
            <span className={date ? undefined : "date-range-placeholder"}>{fieldDate(date)}</span>
          </button>
        </div>
      ))}
    </div>
  );

  if (!open) return controls;

  const time = (d: Date) => d.getTime();
  const inRange = (d: Date) => draftStart && draftEnd && time(d) > time(draftStart) && time(d) < time(draftEnd);
  const isEndpoint = (d: Date) =>
    (draftStart && time(d) === time(draftStart)) || (draftEnd && time(d) === time(draftEnd));
  const nights = draftStart && draftEnd ? Math.round((time(draftEnd) - time(draftStart)) / DAY_MS) + 1 : 0;

  return (
    <div className="date-range-panel">
      {controls}
      <hr className="date-range-divider" />

      <CalendarMonth
        view={view}
        onViewChange={setView}
        isSelected={(d) => Boolean(isEndpoint(d))}
        dayClassName={(d) => {
          const classes: string[] = [];
          if (inRange(d)) classes.push("date-range-day-in-range");
          if (isEndpoint(d)) classes.push("date-range-day-endpoint");
          if (draftStart && draftEnd && time(d) === time(draftStart) && time(d) !== time(draftEnd)) classes.push("date-range-day-start");
          if (draftStart && draftEnd && time(d) === time(draftEnd) && time(d) !== time(draftStart)) classes.push("date-range-day-end");
          return classes.join(" ");
        }}
        onPick={pick}
      />

      <div className="date-range-summary">
        <span>{draftStart && draftEnd ? summary(draftStart, draftEnd) : "Pick a start and end date"}</span>
        {nights > 0 && <span>{nights} {nights === 1 ? "day" : "days"}</span>}
      </div>
      <hr className="date-range-divider" />

      <div className="confirm-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!draftStart || !draftEnd}
          onClick={() => {
            if (!draftStart || !draftEnd) return;
            onChange(toValue(draftStart), toValue(draftEnd));
            setOpen(false);
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

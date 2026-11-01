import { MaskIcon } from "../MaskIcon";
import chevronIcon from "../../assets/icons/chevron-right.svg";
import { monthGrid, toDateValue, WEEKDAYS } from "./calendarUtils";

export function CalendarMonth({
  view,
  onViewChange,
  dayClassName,
  isSelected,
  onPick,
}: {
  view: Date;
  onViewChange: (view: Date) => void;
  dayClassName: (day: Date) => string;
  isSelected: (day: Date) => boolean;
  onPick: (day: Date) => void;
}) {
  return (
    <>
      <div className="date-range-nav">
        <button type="button" className="icon-button" aria-label="Previous month"
          onClick={() => onViewChange(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
          <span className="date-range-prev"><MaskIcon src={chevronIcon} size={16} /></span>
        </button>
        <span className="date-range-month">
          {view.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </span>
        <button type="button" className="icon-button" aria-label="Next month"
          onClick={() => onViewChange(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
          <MaskIcon src={chevronIcon} size={16} />
        </button>
      </div>

      <div className="date-range-grid" role="grid">
        {WEEKDAYS.map((w) => (
          <span key={w} className="date-range-weekday">{w}</span>
        ))}
        {monthGrid(view).map((d) => {
          const outside = d.getMonth() !== view.getMonth() ? " date-range-day-outside" : "";
          const extra = dayClassName(d);
          return (
            <button key={toDateValue(d)} type="button" className={`date-range-day${outside}${extra ? ` ${extra}` : ""}`}
              aria-pressed={isSelected(d)} onClick={() => onPick(d)}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );
}

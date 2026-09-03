import { localDateKey } from "./CalendarMonth";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function levelFor(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

type Props = {
  counts: Map<string, number>;
  todayKey: string;
  onDayClick?: (key: string) => void;
  scheduledKeys?: Set<string>;
};

export default function WeekStrip({ counts, todayKey, onDayClick, scheduledKeys }: Props) {
  const today = new Date(`${todayKey}T00:00:00`);
  const cells = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { key: localDateKey(d), label: WEEKDAY_LABELS[d.getDay()], day: d.getDate() };
  });

  return (
    <div className="cal-week-row">
      {cells.map((cell) => {
        const count = counts.get(cell.key) ?? 0;
        const isScheduled = Boolean(scheduledKeys?.has(cell.key)) && count === 0;
        const isToday = cell.key === todayKey;
        const clickable = count > 0 && Boolean(onDayClick);
        return (
          <div
            key={cell.key}
            className={`cal-week-cell ${isToday ? "cal-cell-today" : ""} ${clickable ? "cal-cell-clickable" : ""}`}
            data-level={levelFor(count)}
            data-scheduled={isScheduled ? "true" : undefined}
            title={isScheduled ? `${cell.key}: scheduled` : `${cell.key}: ${count} post${count === 1 ? "" : "s"}`}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onDayClick!(cell.key) : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onDayClick!(cell.key);
                    }
                  }
                : undefined
            }
          >
            <span className="cal-weekday-label">{cell.label}</span>
            <span className="cal-daynum-lg">{cell.day}</span>
            <span className="cal-count-label">
              {count > 0 ? `${count} post${count === 1 ? "" : "s"}` : isScheduled ? "scheduled" : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

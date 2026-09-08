const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function levelFor(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local calendar-day key — deliberately not toISOString(), so it matches the
 * browser's own notion of "today" instead of drifting a day in +offset zones. */
export function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type Props = {
  year: number;
  month: number; // 0-indexed
  counts: Map<string, number>;
  todayKey: string;
  muteFuture?: boolean;
  compact?: boolean;
  titleClassName?: string;
  onDayClick?: (key: string) => void;
  scheduledKeys?: Set<string>;
};

export default function CalendarMonth({
  year,
  month,
  counts,
  todayKey,
  muteFuture,
  compact,
  titleClassName,
  onDayClick,
  scheduledKeys,
}: Props) {
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: ({ key: string; day: number } | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ key: `${year}-${pad(month + 1)}-${pad(d)}`, day: d });
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={`flex flex-col gap-1.5 ${compact ? "cal-month-compact" : ""}`}>
      <p className={`font-display font-semibold cal-month-title ${titleClassName ?? ""}`}>
        {MONTH_NAMES[month]} {year}
      </p>
      <div className={`cal-grid ${compact ? "cal-grid-compact" : ""}`}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="cal-weekday">{w}</div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="cal-cell cal-cell-empty" />;
          const count = counts.get(cell.key) ?? 0;
          const isScheduled = Boolean(scheduledKeys?.has(cell.key)) && count === 0;
          const isFuture = Boolean(muteFuture) && cell.key > todayKey && !isScheduled;
          const isToday = cell.key === todayKey;
          const clickable = (count > 0 || isScheduled) && !isFuture && Boolean(onDayClick);
          return (
            <div
              key={cell.key}
              className={[
                "cal-cell",
                compact ? "cal-cell-compact" : "",
                isToday ? "cal-cell-today" : "",
                isFuture ? "cal-cell-future" : "",
                clickable ? "cal-cell-clickable" : "",
              ].join(" ").trim()}
              data-level={isFuture ? undefined : levelFor(count)}
              data-scheduled={isScheduled ? "true" : undefined}
              title={
                isScheduled
                  ? `${cell.key}: scheduled`
                  : `${cell.key}: ${count} post${count === 1 ? "" : "s"}`
              }
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
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

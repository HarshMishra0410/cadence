import { relativeTime } from "@/lib/time";

type Metric = {
  label: string;
  value: number | null;
  isLive: boolean;
};

export default function WebsiteMetricsChart({
  metrics,
  capturedAt,
}: {
  metrics: Metric[];
  capturedAt: Date | null;
}) {
  const max = Math.max(1, ...metrics.map((m) => m.value ?? 0));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-6">
        {metrics.map((m) => {
          const heightPct = m.value != null ? Math.max(4, (m.value / max) * 100) : 0;
          return (
            <div key={m.label} className="flex flex-col items-center gap-2 flex-1">
              <span className="font-display font-bold text-xl">{m.value ?? "—"}</span>
              <div
                className="w-full rounded-t-2xl flex items-end overflow-hidden"
                style={{ height: "6rem", background: "var(--clay-bg-end)" }}
              >
                <div
                  className="w-full rounded-t-2xl"
                  style={{
                    height: `${heightPct}%`,
                    background: m.value != null ? "var(--pop-blue)" : "transparent",
                  }}
                />
              </div>
              <span className="text-xs mono uppercase text-center" style={{ color: "var(--clay-ink-faint)" }}>
                {m.label}
              </span>
              {!m.isLive && (
                <span className="text-[0.62rem] mono" style={{ color: "var(--clay-ink-faint)" }}>
                  internal count
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs mono" style={{ color: "var(--clay-ink-faint)" }}>
        {capturedAt ? `Last refreshed ${relativeTime(capturedAt)}` : "Not refreshed yet — click Refresh below."}
      </p>
    </div>
  );
}

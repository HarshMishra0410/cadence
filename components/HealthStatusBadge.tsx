import { healthStatus } from "@/lib/health";

const STATUS_CLASS: Record<string, string> = {
  healthy: "badge-confirmed",
  "at-risk": "badge-pending",
  unhealthy: "badge-disputed",
};

export default function HealthStatusBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="clay-chip" style={{ background: "var(--clay-bg-end)", color: "var(--clay-ink-faint)" }}>Not enough data</span>;
  }
  const { label, emoji, status } = healthStatus(score);
  return (
    <span className={`clay-chip ${STATUS_CLASS[status]}`}>
      {emoji} {label}
    </span>
  );
}

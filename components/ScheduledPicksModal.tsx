"use client";

import { useEffect } from "react";
import type { ScheduledPickSummary } from "./HeatmapPanel";

function formatDateLabel(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

type Props = {
  dateKey: string;
  picks: ScheduledPickSummary[];
  onClose: () => void;
};

export default function ScheduledPicksModal({ dateKey, picks, onClose }: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="cal-modal-backdrop" onClick={onClose}>
      <div
        className="clay-card-raised cal-modal p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
              {picks.length} scheduled
            </p>
            <h3 className="text-lg font-display font-bold mt-0.5">{formatDateLabel(dateKey)}</h3>
          </div>
          <button type="button" onClick={onClose} className="clay-btn text-sm px-3 py-1.5" aria-label="Close">
            Close
          </button>
        </div>

        <div className="flex flex-col gap-3 cal-modal-list">
          {picks.map((pick) => (
            <div key={pick.id} className="clay-inset rounded-2xl p-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-display font-semibold">{pick.name}</span>
                <span className="clay-chip" style={{ background: "var(--pop-yellow-soft)", color: "#8a6412" }}>
                  📅 Scheduled
                </span>
              </div>
              <p className="text-xs mono" style={{ color: "var(--clay-ink-faint)" }}>
                by {pick.author}
              </p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--clay-ink-soft)" }}>
                {pick.positioning}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

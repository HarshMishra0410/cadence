"use client";

import { useEffect } from "react";
import type { PostSummary } from "./HeatmapPanel";

function formatDateLabel(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

type Props = {
  dateKey: string;
  posts: PostSummary[];
  onClose: () => void;
};

export default function DayPostsModal({ dateKey, posts, onClose }: Props) {
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
              {posts.length} post{posts.length === 1 ? "" : "s"}
            </p>
            <h3 className="text-lg font-display font-bold mt-0.5">{formatDateLabel(dateKey)}</h3>
          </div>
          <button type="button" onClick={onClose} className="clay-btn text-sm px-3 py-1.5" aria-label="Close">
            Close
          </button>
        </div>

        <div className="flex flex-col gap-3 cal-modal-list">
          {posts.map((post) => (
            <div key={post.id} className="clay-inset rounded-2xl p-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-display font-semibold">{post.topic}</span>
                <span
                  className="clay-chip"
                  style={{ background: "var(--clay-accent-soft)", color: "var(--clay-accent-strong)" }}
                >
                  {post.ownerName}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--clay-ink-soft)" }}>
                {post.content}
              </p>
              {(post.impressions != null || post.link) && (
                <div className="flex items-center gap-3 text-xs mono pt-0.5" style={{ color: "var(--clay-ink-faint)" }}>
                  {post.impressions != null && <span>{post.impressions.toLocaleString()} impressions</span>}
                  {post.link && (
                    <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--clay-accent-strong)" }}>
                      view post
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

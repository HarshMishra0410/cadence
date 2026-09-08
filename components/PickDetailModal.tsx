"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

/** Important links is a single free-text field — split on commas/newlines
 * so multiple pasted URLs render as a real list instead of one run-on blob. */
function splitLinks(text: string): string[] {
  return text
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type Props = {
  name: string;
  meta: string;
  whatHappened: string;
  contextBehind: string;
  positioning: string;
  importantLinks: string | null;
  badge: ReactNode;
  editHref: string;
  deleteAction: () => Promise<void>;
  children: ReactNode;
};

export default function PickDetailModal({
  name,
  meta,
  whatHappened,
  contextBehind,
  positioning,
  importantLinks,
  badge,
  editHref,
  deleteAction,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="flex flex-col gap-3 cursor-pointer"
      >
        {children}
      </div>

      {open && (
        <div className="cal-modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className="clay-card-raised cal-modal p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
                  {meta}
                </p>
                <h3 className="text-lg font-display font-bold mt-0.5">{name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="clay-btn text-sm px-3 py-1.5"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <div>{badge}</div>

            <div className="flex flex-col gap-4 cal-modal-list">
              <div>
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>
                  What happened
                </p>
                <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: "var(--clay-ink-soft)" }}>
                  {whatHappened}
                </p>
              </div>
              <div>
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>
                  Context behind
                </p>
                <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: "var(--clay-ink-soft)" }}>
                  {contextBehind}
                </p>
              </div>
              <div className="clay-inset rounded-2xl p-4">
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>
                  Positioning
                </p>
                <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: "var(--clay-ink)" }}>
                  {positioning}
                </p>
              </div>
              {importantLinks && (
                <div>
                  <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>
                    Important links
                  </p>
                  <ul className="flex flex-col gap-1 mt-1">
                    {splitLinks(importantLinks).map((link, i) => (
                      <li key={i} className="text-sm break-all">
                        {/^https?:\/\//.test(link) ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--clay-accent-strong)" }}
                          >
                            {link}
                          </a>
                        ) : (
                          <span style={{ color: "var(--clay-ink-soft)" }}>{link}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2" style={{ borderTop: "1px solid var(--clay-bg-end)" }}>
              <Link href={editHref} className="clay-btn text-sm px-4 py-2">
                Edit
              </Link>
              <form
                action={deleteAction}
                onSubmit={(e) => {
                  if (!confirm(`Delete "${name}"? This can't be undone.`)) {
                    e.preventDefault();
                  }
                }}
              >
                <button
                  type="submit"
                  className="clay-btn text-sm px-4 py-2"
                  style={{ background: "var(--bad-soft)", color: "var(--bad)" }}
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

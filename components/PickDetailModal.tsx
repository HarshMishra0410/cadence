"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  name: string;
  meta: string;
  whatHappened: string;
  contextBehind: string;
  positioning: string;
  importantLinks: string | null;
  badge: ReactNode;
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
                <p className="text-sm mt-1" style={{ color: "var(--clay-ink-soft)" }}>
                  {whatHappened}
                </p>
              </div>
              <div>
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>
                  Context behind
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--clay-ink-soft)" }}>
                  {contextBehind}
                </p>
              </div>
              <div className="clay-inset rounded-2xl p-4">
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>
                  Positioning
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--clay-ink)" }}>
                  {positioning}
                </p>
              </div>
              {importantLinks && (
                <div>
                  <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>
                    Important links
                  </p>
                  <p className="text-sm mt-1 break-all" style={{ color: "var(--clay-accent-strong)" }}>
                    {importantLinks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

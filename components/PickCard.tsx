import type { MarketingPointer, AuthorValidation } from "@prisma/client";
import {
  updateAuthorValidation,
  markPointerPosted,
  schedulePointer,
  unschedulePointer,
  deleteMarketingPointer,
} from "@/app/actions";
import { relativeTime } from "@/lib/time";
import ValidationBadge from "./ValidationBadge";
import PickDetailModal from "./PickDetailModal";

const STATES: AuthorValidation[] = ["PENDING", "CONFIRMED", "DISPUTED"];
const STATE_LABEL: Record<AuthorValidation, string> = {
  PENDING: "P",
  CONFIRMED: "C",
  DISPUTED: "D",
};

function formatScheduledDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function todayInputValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PickCard({ pick }: { pick: MarketingPointer }) {
  const setValidation = updateAuthorValidation.bind(null, pick.id, pick.chefId);
  const markPosted = markPointerPosted.bind(null, pick.id, pick.chefId);
  const schedule = schedulePointer.bind(null, pick.id, pick.chefId);
  const unschedule = unschedulePointer.bind(null, pick.id, pick.chefId);
  const deletePick = deleteMarketingPointer.bind(null, pick.id, pick.chefId);

  return (
    <article
      className="clay-card-raised p-5 flex flex-col gap-3"
      style={{ borderLeft: "4px solid var(--pop-yellow)" }}
    >
      <PickDetailModal
        name={pick.name}
        meta={`by ${pick.author} · added ${relativeTime(pick.createdAt)}`}
        whatHappened={pick.whatHappened}
        contextBehind={pick.contextBehind}
        positioning={pick.positioning}
        importantLinks={pick.importantLinks}
        badge={<ValidationBadge value={pick.authorValidation} />}
        editHref={`/chef/${pick.chefId}/pick/${pick.id}/edit`}
        deleteAction={deletePick}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display font-bold">{pick.name}</p>
            <p className="text-xs mono mt-0.5" style={{ color: "var(--clay-ink-faint)" }}>
              by {pick.author} &middot; added {relativeTime(pick.createdAt)}
            </p>
          </div>
          <ValidationBadge value={pick.authorValidation} />
        </div>

        <p className="text-sm whitespace-pre-wrap line-clamp-3" style={{ color: "var(--clay-ink-soft)" }}>
          {pick.whatHappened}
        </p>
        <p
          className="text-sm border-l-2 pl-3 whitespace-pre-wrap line-clamp-3"
          style={{ borderColor: "var(--clay-accent-soft)", color: "var(--clay-ink)" }}
        >
          {pick.positioning}
        </p>
      </PickDetailModal>

      {pick.scheduledFor ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="clay-chip"
            style={{ background: "var(--pop-blue-soft)", color: "var(--clay-accent-strong)" }}
          >
            📅 Scheduled for {formatScheduledDate(pick.scheduledFor)}
          </span>
          <form action={unschedule}>
            <button type="submit" className="text-xs mono" style={{ color: "var(--clay-ink-faint)" }}>
              clear
            </button>
          </form>
        </div>
      ) : (
        <form action={schedule} className="flex items-center gap-2 flex-wrap">
          <input
            name="scheduledFor"
            type="date"
            min={todayInputValue()}
            required
            className="clay-input text-xs py-1.5 px-3 w-auto"
          />
          <button type="submit" className="clay-btn text-xs px-3 py-1.5">
            Schedule
          </button>
        </form>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex gap-1.5">
          {STATES.map((state) => (
            <form key={state} action={async () => { "use server"; await setValidation(state); }}>
              <button
                type="submit"
                className={`clay-btn text-xs px-3 py-1.5 ${state === pick.authorValidation ? "clay-inset" : ""}`}
                title={state}
              >
                {STATE_LABEL[state]}
              </button>
            </form>
          ))}
        </div>

        <form action={markPosted} className="flex items-center gap-2">
          <input
            name="link"
            type="url"
            placeholder="post link (optional)"
            className="clay-input text-xs py-1.5 px-3 w-44"
          />
          <button type="submit" className="clay-btn clay-btn-primary text-xs px-3 py-1.5">
            Mark posted
          </button>
        </form>
      </div>
    </article>
  );
}

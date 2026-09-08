import type { MarketingPointer, Post } from "@prisma/client";
import { relativeTime } from "@/lib/time";
import { deleteMarketingPointer } from "@/app/actions";
import ValidationBadge from "./ValidationBadge";
import PickDetailModal from "./PickDetailModal";

type Props = {
  pick: MarketingPointer & { post: Post | null };
};

export default function PostedPickCard({ pick }: Props) {
  const deletePick = deleteMarketingPointer.bind(null, pick.id, pick.chefId);

  return (
    <article className="clay-card p-5 flex flex-col gap-2 opacity-90">
      <PickDetailModal
        name={pick.name}
        meta={`by ${pick.author}`}
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
            <p className="font-display font-semibold">{pick.name}</p>
            <p className="text-xs mono mt-0.5" style={{ color: "var(--clay-ink-faint)" }}>
              by {pick.author}
            </p>
          </div>
          <ValidationBadge value={pick.authorValidation} />
        </div>

        <p className="text-sm border-l-2 pl-3" style={{ borderColor: "var(--clay-accent-soft)", color: "var(--clay-ink-soft)" }}>
          {pick.positioning}
        </p>
      </PickDetailModal>

      <div className="flex items-center gap-3 text-xs mono pt-1" style={{ color: "var(--clay-ink-faint)" }}>
        <span className="clay-chip badge-confirmed" style={{ background: "var(--good-soft)", color: "var(--good)" }}>
          Posted {pick.postedAt ? relativeTime(pick.postedAt) : ""}
        </span>
        {pick.post?.link && (
          <a href={pick.post.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--clay-accent-strong)" }}>
            view post
          </a>
        )}
      </div>
    </article>
  );
}

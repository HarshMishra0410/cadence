import type { ContentIdea } from "@prisma/client";
import { markContentIdeaPublished } from "@/app/actions";
import { relativeTime } from "@/lib/time";

const TYPE_LABEL: Record<string, string> = { BLOG: "Blog", NEWSLETTER: "Newsletter" };

export default function ContentIdeaCard({ idea }: { idea: ContentIdea }) {
  const markPublished = markContentIdeaPublished.bind(null, idea.id);

  return (
    <article className="clay-card p-5 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className="clay-chip"
            style={{ background: "var(--clay-accent-soft)", color: "var(--clay-accent-strong)" }}
          >
            {TYPE_LABEL[idea.type] ?? idea.type}
          </span>
          <p className="font-display font-semibold mt-1.5">{idea.topic}</p>
          <p className="text-xs mono mt-0.5" style={{ color: "var(--clay-ink-faint)" }}>
            by {idea.author} &middot; added {relativeTime(idea.createdAt)}
          </p>
        </div>
        <span className={`clay-chip ${idea.status === "PUBLISHED" ? "badge-confirmed" : "badge-pending"}`}>
          {idea.status === "PUBLISHED" ? "Published" : "Idea"}
        </span>
      </div>

      <p className="text-sm" style={{ color: "var(--clay-ink-soft)" }}>
        {idea.content}
      </p>

      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        {idea.link ? (
          <a
            href={idea.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mono"
            style={{ color: "var(--clay-accent-strong)" }}
          >
            view link
          </a>
        ) : (
          <span />
        )}
        {idea.status === "IDEA" && (
          <form action={markPublished}>
            <button type="submit" className="clay-btn text-xs px-3 py-1.5">
              Mark published
            </button>
          </form>
        )}
      </div>
    </article>
  );
}

import { createContentIdea } from "@/app/actions";

const TITLE: Record<string, string> = {
  BLOG: "Blog idea",
  NEWSLETTER: "Newsletter idea",
};

export default async function NewContentIdeaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const ideaType = type === "NEWSLETTER" ? "NEWSLETTER" : "BLOG";

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
          Website Content
        </p>
        <h1 className="text-2xl font-display font-semibold mt-1">{TITLE[ideaType]}</h1>
      </div>

      <form action={createContentIdea} className="clay-card-raised p-6 flex flex-col gap-4 max-w-xl">
        <input type="hidden" name="type" value={ideaType} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Topic</span>
          <input name="topic" required className="clay-input" placeholder="Working title" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Content</span>
          <textarea name="content" required rows={4} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Author</span>
          <input name="author" required className="clay-input" placeholder="Who's writing this" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Link (optional)</span>
          <input name="link" type="url" className="clay-input" placeholder="Draft doc, published URL, etc." />
        </label>
        <button type="submit" className="clay-btn clay-btn-primary self-start mt-2">
          Add {TITLE[ideaType].toLowerCase()}
        </button>
      </form>
    </div>
  );
}

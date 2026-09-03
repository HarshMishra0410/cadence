import { prisma } from "@/lib/prisma";
import { logPost } from "@/app/actions";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ ownerType?: string; chefId?: string }>;
}) {
  const { ownerType = "COMPANY", chefId } = await searchParams;

  const chef = chefId ? await prisma.chef.findUnique({ where: { id: chefId } }) : null;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
          {chef ? `For ${chef.name}` : "Company"}
        </p>
        <h1 className="text-2xl font-display font-semibold mt-1">Log new post</h1>
      </div>

      <form action={logPost} className="clay-card-raised p-6 flex flex-col gap-4 max-w-lg">
        <input type="hidden" name="ownerType" value={ownerType} />
        {chefId && <input type="hidden" name="chefId" value={chefId} />}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Topic</span>
          <input name="topic" required className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Content</span>
          <textarea name="content" required rows={4} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Link (optional)</span>
          <input name="link" type="url" className="clay-input" />
        </label>
        <button type="submit" className="clay-btn clay-btn-primary self-start mt-2">
          Log post
        </button>
      </form>
    </div>
  );
}

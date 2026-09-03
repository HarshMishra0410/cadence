import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createMarketingPointer } from "@/app/actions";

export default async function NewPickPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chef = await prisma.chef.findUnique({ where: { id } });
  if (!chef) notFound();

  const action = createMarketingPointer.bind(null, chef.id);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
          For {chef.name}
        </p>
        <h1 className="text-2xl font-display font-semibold mt-1">Marketing pointer card</h1>
      </div>

      <form action={action} className="clay-card-raised p-6 flex flex-col gap-4 max-w-xl">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Name</span>
          <input name="name" required className="clay-input" placeholder="Short title for this story" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">What happened</span>
          <textarea name="whatHappened" required rows={3} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Context behind</span>
          <textarea name="contextBehind" required rows={3} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Author</span>
          <input name="author" required className="clay-input" placeholder="Who this story came from" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Positioning</span>
          <span className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
            {chef.name}&rsquo;s specific angle on this story.
          </span>
          <textarea name="positioning" required rows={3} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Important links (optional)</span>
          <input name="importantLinks" className="clay-input" />
        </label>
        <button type="submit" className="clay-btn clay-btn-primary self-start mt-2">
          Add pick
        </button>
      </form>
    </div>
  );
}

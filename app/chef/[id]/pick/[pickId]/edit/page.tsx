import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateMarketingPointer } from "@/app/actions";

export default async function EditPickPage({
  params,
}: {
  params: Promise<{ id: string; pickId: string }>;
}) {
  const { id, pickId } = await params;
  const [chef, pick] = await Promise.all([
    prisma.chef.findUnique({ where: { id } }),
    prisma.marketingPointer.findUnique({ where: { id: pickId } }),
  ]);
  if (!chef || !pick || pick.chefId !== id) notFound();

  const action = updateMarketingPointer.bind(null, pick.id, chef.id);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
          For {chef.name}
        </p>
        <h1 className="text-2xl font-display font-semibold mt-1">Edit pick</h1>
      </div>

      <form action={action} className="clay-card-raised p-6 flex flex-col gap-4 max-w-xl">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Name</span>
          <input name="name" required defaultValue={pick.name} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">What happened</span>
          <textarea name="whatHappened" required rows={3} defaultValue={pick.whatHappened} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Context behind</span>
          <textarea name="contextBehind" required rows={3} defaultValue={pick.contextBehind} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Author</span>
          <input name="author" required defaultValue={pick.author} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Positioning</span>
          <span className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
            {chef.name}&rsquo;s specific angle on this story.
          </span>
          <textarea name="positioning" required rows={3} defaultValue={pick.positioning} className="clay-input" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Important links (optional)</span>
          <input name="importantLinks" defaultValue={pick.importantLinks ?? ""} className="clay-input" />
        </label>
        <button type="submit" className="clay-btn clay-btn-primary self-start mt-2">
          Save changes
        </button>
      </form>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { importPostsFromCsv } from "@/app/actions";

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; skipped?: string; matched?: string }>;
}) {
  const { imported, skipped, matched } = await searchParams;
  const chefs = await prisma.chef.findMany({ orderBy: { name: "asc" } });

  const matchedRows = matched ? matched.split("|").map((pair) => {
    const [field, header] = pair.split("=");
    return { field, header };
  }) : null;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
          Free path — no API approval needed
        </p>
        <h1 className="text-2xl font-display font-bold mt-1">Import LinkedIn export</h1>
        <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--clay-ink-soft)" }}>
          Export your own analytics from LinkedIn (Company Page &rarr; Analytics &rarr; Export,
          or personal profile with Creator Mode on &rarr; Analytics &amp; Tools &rarr; Post
          analytics &rarr; Export) and drop the CSV here. Column headers are auto-detected, not
          assumed — check the match report below after importing.
        </p>
      </div>

      {imported !== undefined && (
        <div className="clay-card p-5 flex flex-col gap-2">
          <p className="font-display font-semibold">
            Imported {imported} post{imported === "1" ? "" : "s"}
            {Number(skipped) > 0 && (
              <span style={{ color: "var(--clay-ink-faint)" }}> &middot; {skipped} skipped (no usable date found)</span>
            )}
          </p>
          {matchedRows && (
            <div className="text-xs mono flex flex-col gap-1" style={{ color: "var(--clay-ink-faint)" }}>
              <span>Column match:</span>
              {matchedRows.map((m) => (
                <span key={m.field}>
                  {m.field} &rarr; {m.header}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <form action={importPostsFromCsv} className="clay-card-raised p-6 flex flex-col gap-4 max-w-lg">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Import for</span>
          <select name="ownerType" id="ownerType" className="clay-input" defaultValue="COMPANY">
            <option value="COMPANY">Company</option>
            <option value="CHEF">A chef</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Chef (if importing for a chef)</span>
          <select name="chefId" className="clay-input">
            <option value="">&mdash;</option>
            {chefs.map((chef) => (
              <option key={chef.id} value={chef.id}>
                {chef.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">CSV file</span>
          <input type="file" name="file" accept=".csv,text/csv" required className="clay-input" />
        </label>

        <button type="submit" className="clay-btn clay-btn-primary self-start mt-2">
          Import
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const [latestSnapshot, chefCount, postCount, ideaCount] = await Promise.all([
    prisma.websiteMetricSnapshot.findFirst({ orderBy: { capturedAt: "desc" } }),
    prisma.chef.count(),
    prisma.post.count(),
    prisma.contentIdea.count({ where: { status: "IDEA" } }),
  ]);

  return (
    <div className="flex flex-col gap-10 pt-4">
      <div>
        <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
          Facets &middot; Marketing ops
        </p>
        <h1 className="text-3xl font-display font-bold mt-1">Cadence</h1>
        <p className="text-sm mt-1" style={{ color: "var(--clay-ink-faint)" }}>
          Where every marketing channel we run gets tracked.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/website"
          className="clay-card-raised p-6 flex flex-col gap-1.5 hover:-translate-y-0.5 transition-transform"
        >
          <span className="font-display font-bold text-lg">Website Content</span>
          <span className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
            Blog &amp; newsletter ideas, published-content metrics
          </span>
        </Link>
        <Link
          href="/linkedin"
          className="clay-card-raised p-6 flex flex-col gap-1.5 hover:-translate-y-0.5 transition-transform"
        >
          <span className="font-display font-bold text-lg">Cook LinkedIn</span>
          <span className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
            Chef picks, posting cadence, LinkedIn Health
          </span>
        </Link>
        <div className="clay-card p-6 flex flex-col gap-1.5 opacity-60">
          <span className="font-display font-bold text-lg">Planning</span>
          <span className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
            Coming soon
          </span>
        </div>
        <div className="clay-card p-6 flex flex-col gap-1.5 opacity-60">
          <span className="font-display font-bold text-lg">Coming Soon</span>
          <span className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
            More channels, tracked here next
          </span>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-display font-bold">Activity overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/website" className="clay-card-raised p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform">
            <p className="font-display font-semibold">Website charts</p>
            <div className="flex gap-4">
              <div>
                <p className="text-xl font-display font-bold">{latestSnapshot?.blogCount ?? "—"}</p>
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Blogs</p>
              </div>
              <div>
                <p className="text-xl font-display font-bold">{latestSnapshot?.changelogCount ?? "—"}</p>
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Changelogs</p>
              </div>
              <div>
                <p className="text-xl font-display font-bold">{latestSnapshot?.newsletterCount ?? 0}</p>
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Newsletters</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
              {ideaCount} idea{ideaCount === 1 ? "" : "s"} queued
            </p>
          </Link>

          <Link href="/linkedin" className="clay-card-raised p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform">
            <p className="font-display font-semibold">LinkedIn charts</p>
            <div className="flex gap-4">
              <div>
                <p className="text-xl font-display font-bold">{chefCount}</p>
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Chefs</p>
              </div>
              <div>
                <p className="text-xl font-display font-bold">{postCount}</p>
                <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Posts logged</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
              Full health score, cadence &amp; calendar &rarr;
            </p>
          </Link>

          <div className="clay-card p-5 flex flex-col gap-2 opacity-60">
            <p className="font-display font-semibold">Planning Files</p>
            <p className="text-sm" style={{ color: "var(--clay-ink-faint)" }}>Coming soon</p>
          </div>
        </div>
      </section>
    </div>
  );
}

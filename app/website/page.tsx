import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { refreshWebsiteMetrics } from "@/app/actions";
import ContentIdeaCard from "@/components/ContentIdeaCard";
import WebsiteMetricsChart from "@/components/WebsiteMetricsChart";

export const dynamic = "force-dynamic";

export default async function WebsitePage() {
  const [ideas, latestSnapshot] = await Promise.all([
    prisma.contentIdea.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.websiteMetricSnapshot.findFirst({ orderBy: { capturedAt: "desc" } }),
  ]);

  const metrics = [
    { label: "Blogs", value: latestSnapshot?.blogCount ?? null, isLive: true },
    { label: "Changelogs", value: latestSnapshot?.changelogCount ?? null, isLive: true },
    { label: "Newsletters", value: latestSnapshot?.newsletterCount ?? 0, isLive: false },
  ];

  return (
    <div className="flex flex-col gap-8 pt-4">
      <div>
        <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
          Facets &middot; Marketing ops
        </p>
        <h1 className="text-3xl font-display font-bold mt-1">Website Content</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--clay-ink-faint)" }}>
          Blog and newsletter ideas, and how much of it is actually shipping.
        </p>
      </div>

      <section className="clay-card-raised p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-display font-bold">Current Website Metric</h2>
          <form action={refreshWebsiteMetrics}>
            <button type="submit" className="clay-btn text-sm">
              Refresh
            </button>
          </form>
        </div>
        <WebsiteMetricsChart metrics={metrics} capturedAt={latestSnapshot?.capturedAt ?? null} />
        <p className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
          Blogs and changelogs are scraped live from facets.cloud. Newsletters have no public page
          yet, so that count is our own published newsletter ideas below.
        </p>
      </section>

      <section
        className="clay-card-raised p-6 flex flex-col gap-5"
        style={{ borderLeft: "5px solid var(--pop-yellow)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-display font-bold">Saved Ideas Logged Here</h2>
          <div className="flex items-center gap-2">
            <Link href="/website/idea/new?type=BLOG" className="clay-btn text-sm">
              Blog Idea +
            </Link>
            <Link href="/website/idea/new?type=NEWSLETTER" className="clay-btn clay-btn-primary text-sm">
              Newsletter Idea +
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {ideas.length === 0 && (
            <p className="text-sm" style={{ color: "var(--clay-ink-faint)" }}>
              Nothing logged yet — add a blog or newsletter idea to get started.
            </p>
          )}
          {ideas.map((idea) => (
            <ContentIdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </section>

      <section className="clay-card p-5 flex flex-col gap-2">
        <h2 className="text-sm font-display font-semibold" style={{ color: "var(--clay-ink-soft)" }}>
          Beyond website
        </h2>
        <p className="text-sm" style={{ color: "var(--clay-ink-faint)" }}>
          3rd-party mentions (Gartner, Hacker News, etc.) &mdash; coming soon.
        </p>
      </section>
    </div>
  );
}

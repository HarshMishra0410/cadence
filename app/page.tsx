import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { relativeTime } from "@/lib/time";
import HeatmapPanel, { type PostSummary } from "@/components/HeatmapPanel";
import HealthStatusBadge from "@/components/HealthStatusBadge";
import {
  getEffectiveTarget,
  computeGapStats,
  cadenceScore,
  consistencyScore,
  momentumScore,
  roleCoverageScore,
  contributorDiversityScore,
  contributorCoverageScore,
  overallHealthScore,
} from "@/lib/health";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [chefs, company, companyPosts, allPosts, recentPosts] = await Promise.all([
    prisma.chef.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.company.findUnique({ where: { id: "company" } }),
    prisma.post.findMany({ where: { ownerType: "COMPANY" }, orderBy: { postedAt: "desc" } }),
    prisma.post.findMany({ orderBy: { postedAt: "desc" }, include: { chef: true } }),
    prisma.post.findMany({
      orderBy: { postedAt: "desc" },
      take: 8,
      include: { chef: true },
    }),
  ]);

  const companyPostSummaries: PostSummary[] = companyPosts.map((p) => ({
    id: p.id,
    postedAt: p.postedAt.toISOString(),
    topic: p.topic,
    content: p.content,
    link: p.link,
    ownerName: "Company",
    impressions: p.impressions,
  }));
  const activityPostSummaries: PostSummary[] = allPosts.map((p) => ({
    id: p.id,
    postedAt: p.postedAt.toISOString(),
    topic: p.topic,
    content: p.content,
    link: p.link,
    ownerName: p.chef ? p.chef.name : "Company",
    impressions: p.impressions,
  }));

  // ---- Org-wide LinkedIn Health ----
  // Scoped to chef-owned posts only — Company is the brand channel, not one
  // of the "contributors" this methodology is measuring.
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const chefPosts = allPosts.filter((p) => p.ownerType === "CHEF");
  const chefPostDates = chefPosts.map((p) => p.postedAt);

  const perChefStats = chefs.map((chef) => {
    const dates = chefPosts.filter((p) => p.chefId === chef.id).map((p) => p.postedAt);
    const target = getEffectiveTarget(chef.targetPostsPerMonth);
    const actual = dates.filter((d) => d >= thirtyDaysAgo).length;
    return { chef, target: target.value, actual };
  });

  const totalActual = perChefStats.reduce((s, c) => s + c.actual, 0);
  const totalTarget = perChefStats.reduce((s, c) => s + c.target, 0);
  const orgCadence = cadenceScore(totalActual, totalTarget);

  const orgCurrentGaps = computeGapStats(chefPostDates, 30, now);
  const orgPreviousGaps = computeGapStats(chefPostDates, 30, thirtyDaysAgo);
  const orgConsistency = consistencyScore(orgCurrentGaps, totalTarget, 30);

  const orgPreviousPosts = chefPostDates.filter((d) => d >= sixtyDaysAgo && d < thirtyDaysAgo).length;
  const currentActiveContributors = new Set(
    chefPosts.filter((p) => p.postedAt >= thirtyDaysAgo).map((p) => p.chefId),
  ).size;
  const previousActiveContributors = new Set(
    chefPosts.filter((p) => p.postedAt >= sixtyDaysAgo && p.postedAt < thirtyDaysAgo).map((p) => p.chefId),
  ).size;

  const orgMomentum = momentumScore(
    { posts: totalActual, activeContributors: currentActiveContributors, avgGapDays: orgCurrentGaps.avgGapDays },
    { posts: orgPreviousPosts, activeContributors: previousActiveContributors, avgGapDays: orgPreviousGaps.avgGapDays },
  );

  const coverageInputs = perChefStats.map((c) => ({ actual: c.actual, target: c.target }));
  const roleCoverage = roleCoverageScore(coverageInputs);
  const diversity = contributorDiversityScore(coverageInputs);
  const orgCoverage = contributorCoverageScore(roleCoverage, diversity);

  const orgOverall = overallHealthScore({
    cadence: orgCadence,
    consistency: orgConsistency,
    coverage: orgCoverage,
    momentum: orgMomentum,
  });

  return (
    <div className="flex flex-col gap-10 pt-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
            Facets &middot; LinkedIn content ops
          </p>
          <h1 className="text-3xl font-display font-bold mt-1">Cadence</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/import" className="clay-btn text-sm">
            Import CSV
          </Link>
          <Link href="/chef/new" className="clay-btn clay-btn-primary">
            + Add chef
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-start">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {chefs.length === 0 && (
            <p className="col-span-full text-sm" style={{ color: "var(--clay-ink-faint)" }}>
              No chefs yet — add the first one.
            </p>
          )}
          {chefs.map((chef, i) => (
            <Link
              key={chef.id}
              href={`/chef/${chef.id}`}
              className="clay-card p-5 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform"
            >
              <span className={`dot dot-${(i % 3) + 1}`} />
              <span className="font-display font-semibold">{chef.name}</span>
              <span className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
                {chef.position}
              </span>
            </Link>
          ))}
        </div>

        <div className="clay-card-raised p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold">Summary</span>
            <span className="clay-chip" style={{ background: "var(--clay-accent-soft)", color: "var(--clay-accent-strong)" }}>
              {recentPosts.length} recent
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {recentPosts.length === 0 && (
              <p className="text-sm" style={{ color: "var(--clay-ink-faint)" }}>
                Nothing posted yet.
              </p>
            )}
            {recentPosts.map((post) => (
              <div key={post.id} className="text-sm leading-snug">
                <span className="font-semibold">{post.chef ? post.chef.name : "Company"}</span>{" "}
                posted{" "}
                <span style={{ color: "var(--clay-ink-soft)" }}>&ldquo;{post.topic}&rdquo;</span>
                <div className="text-xs mono mt-0.5" style={{ color: "var(--clay-ink-faint)" }}>
                  {relativeTime(post.postedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="clay-card-raised p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-display font-semibold">LinkedIn Health</h2>
            <p className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
              How healthy is our LinkedIn presence, across every chef &mdash; not Company.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-display font-bold">{orgOverall ?? "—"}</span>
            <HealthStatusBadge score={orgOverall} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Cadence</p>
            <p className="text-xl font-display font-bold">{orgCadence ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Consistency</p>
            <p className="text-xl font-display font-bold">{orgConsistency ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Contributor Coverage</p>
            <p className="text-xl font-display font-bold">{orgCoverage ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Momentum</p>
            <p className="text-xl font-display font-bold">{orgMomentum ?? "—"}</p>
          </div>
        </div>

        <div className="clay-inset rounded-2xl p-4 flex flex-col gap-2">
          <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>
            Contributor Coverage, broken down
          </p>
          <div className="flex gap-8 flex-wrap text-sm">
            <span>
              Role Coverage:{" "}
              <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>{roleCoverage ?? "—"}</span>
              <span style={{ color: "var(--clay-ink-faint)" }}> &mdash; are the intended personas participating?</span>
            </span>
            <span>
              Contributor Diversity:{" "}
              <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>{diversity ?? "—"}</span>
              <span style={{ color: "var(--clay-ink-faint)" }}> &mdash; are we overly dependent on a few people?</span>
            </span>
          </div>
        </div>

        <div className="text-sm mono flex gap-6 flex-wrap" style={{ color: "var(--clay-ink-soft)" }}>
          <span>
            This period: <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>{totalActual}/{totalTarget} posts</span>
          </span>
          <span>
            Active contributors:{" "}
            <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>{currentActiveContributors}/{chefs.length}</span>
          </span>
          <span>
            Avg. gap:{" "}
            <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>
              {orgCurrentGaps.avgGapDays !== null ? `${orgCurrentGaps.avgGapDays.toFixed(1)} days` : "not enough data yet"}
            </span>
          </span>
        </div>
      </section>

      <section className="clay-card-raised p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-display font-semibold">Activity</h2>
          <span className="text-xs mono" style={{ color: "var(--clay-ink-faint)" }}>
            every chef + Company, combined
          </span>
        </div>
        <HeatmapPanel posts={activityPostSummaries} />
      </section>

      <section className="clay-card-raised p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-display font-semibold">Company LinkedIn</h2>
          <div className="flex items-center gap-2">
            <Link href="/company/edit" className="text-xs mono" style={{ color: "var(--clay-ink-faint)" }}>
              edit URL
            </Link>
            <Link href="/post/new?ownerType=COMPANY" className="clay-btn text-sm">
              Log New Post +
            </Link>
          </div>
        </div>

        {company?.linkedinUrl && (
          <a
            href={company.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm mono break-all"
            style={{ color: "var(--clay-accent-strong)" }}
          >
            {company.linkedinUrl}
          </a>
        )}

        <HeatmapPanel posts={companyPostSummaries} />

        <div>
          <p className="font-display font-semibold mb-2">Latest posts</p>
          <div className="flex flex-col gap-2">
            {companyPosts.length === 0 && (
              <p className="text-sm" style={{ color: "var(--clay-ink-faint)" }}>
                No posts logged yet.
              </p>
            )}
            {companyPosts.slice(0, 4).map((post) => (
              <div key={post.id} className="clay-inset rounded-2xl px-4 py-2.5 text-sm">
                {post.topic}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

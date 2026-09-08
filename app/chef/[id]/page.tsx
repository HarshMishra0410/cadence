import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getEffectiveTarget,
  computeGapStats,
  cadenceScore,
  consistencyScore,
  momentumScore,
  overallHealthScore,
} from "@/lib/health";
import HeatmapPanel, { type PostSummary, type ScheduledPickSummary } from "@/components/HeatmapPanel";
import PickCard from "@/components/PickCard";
import PostedPickCard from "@/components/PostedPickCard";
import HealthStatusBadge from "@/components/HealthStatusBadge";
import { relativeTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function ChefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chef = await prisma.chef.findUnique({ where: { id } });
  if (!chef) notFound();

  const [picks, postedPicks, posts] = await Promise.all([
    prisma.marketingPointer.findMany({
      where: { chefId: id, postedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.marketingPointer.findMany({
      where: { chefId: id, postedAt: { not: null } },
      orderBy: { postedAt: "desc" },
      include: { post: true },
    }),
    prisma.post.findMany({
      where: { chefId: id },
      orderBy: { postedAt: "desc" },
    }),
  ]);

  const postedDates = posts.map((p) => p.postedAt);
  const postSummaries: PostSummary[] = posts.map((p) => ({
    id: p.id,
    postedAt: p.postedAt.toISOString(),
    topic: p.topic,
    content: p.content,
    link: p.link,
    ownerName: chef.name,
    impressions: p.impressions,
  }));
  const scheduledPicks: ScheduledPickSummary[] = picks
    .filter((p) => p.scheduledFor)
    .map((p) => ({
      id: p.id,
      scheduledFor: p.scheduledFor!.toISOString(),
      name: p.name,
      author: p.author,
      positioning: p.positioning,
    }));

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const target = getEffectiveTarget(chef.targetPostsPerMonth);
  const currentPosts = postedDates.filter((d) => d >= thirtyDaysAgo).length;
  const previousPosts = postedDates.filter((d) => d >= sixtyDaysAgo && d < thirtyDaysAgo).length;

  const currentGaps = computeGapStats(postedDates, 30, now);
  const previousGaps = computeGapStats(postedDates, 30, thirtyDaysAgo);

  const cadence = cadenceScore(currentPosts, target.value);
  const consistency = consistencyScore(currentGaps, target.value);
  // activeContributors is a no-op here (always 1 vs 1) — momentum for one
  // person only depends on posts and gap, this just reuses the same formula.
  const momentum = momentumScore(
    { posts: currentPosts, activeContributors: 1, avgGapDays: currentGaps.avgGapDays },
    { posts: previousPosts, activeContributors: 1, avgGapDays: previousGaps.avgGapDays },
  );
  const overall = overallHealthScore({ cadence, consistency, coverage: null, momentum });
  const targetPerWeek = (target.value * 7) / 30;

  return (
    <div className="flex flex-col gap-8 pt-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs mono uppercase tracking-wide" style={{ color: "var(--clay-ink-faint)" }}>
            Chef card
          </p>
          <h1 className="text-3xl font-display font-bold mt-1">{chef.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--clay-ink-faint)" }}>
            {chef.position}
          </p>
        </div>
        <Link href={`/chef/${chef.id}/edit`} className="clay-btn text-sm">
          Edit chef
        </Link>
      </div>

      <section
        className="clay-card-raised p-6 flex flex-col gap-5"
        style={{ borderLeft: "5px solid var(--pop-yellow)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-display font-bold">Picks to be posted</h2>
            <span
              className="clay-chip"
              style={{
                background: picks.length > 0 ? "var(--pop-yellow-soft)" : "var(--clay-bg-end)",
                color: picks.length > 0 ? "#8a6412" : "var(--clay-ink-faint)",
              }}
            >
              {picks.length} queued
            </span>
          </div>
          <Link href={`/chef/${chef.id}/pick/new`} className="clay-btn clay-btn-primary text-sm">
            Add +
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {picks.length === 0 && (
            <p className="text-sm" style={{ color: "var(--clay-ink-faint)" }}>
              Nothing queued right now.
            </p>
          )}
          {picks.map((pick) => (
            <PickCard key={pick.id} pick={pick} />
          ))}
        </div>
      </section>

      <section className="clay-card p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-display font-semibold" style={{ color: "var(--clay-ink-soft)" }}>
            LinkedIn overview
          </h2>
          <a
            href={chef.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mono"
            style={{ color: "var(--clay-accent-strong)" }}
          >
            {chef.linkedinUrl}
          </a>
        </div>
        {chef.intent && <p className="text-sm" style={{ color: "var(--clay-ink-soft)" }}>{chef.intent}</p>}
      </section>

      <section className="clay-card-raised p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-display font-semibold">LinkedIn hygiene</h2>
          <HealthStatusBadge score={overall} />
        </div>

        <div className="flex gap-8 flex-wrap">
          <div>
            <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Cadence</p>
            <p className="text-2xl font-display font-bold">{cadence ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Consistency</p>
            <p className="text-2xl font-display font-bold">{consistency ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs mono uppercase" style={{ color: "var(--clay-ink-faint)" }}>Momentum</p>
            <p className="text-2xl font-display font-bold">{momentum ?? "—"}</p>
          </div>
        </div>

        {/* Every score above traces back to these — no number without its inputs visible. */}
        <div className="text-sm mono flex flex-col gap-1" style={{ color: "var(--clay-ink-soft)" }}>
          <span>
            Last post:{" "}
            <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>
              {currentGaps.lastPostedAt ? relativeTime(currentGaps.lastPostedAt) : "never"}
            </span>
          </span>
          <span>
            Avg. gap:{" "}
            <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>
              {currentGaps.avgGapDays !== null ? `${currentGaps.avgGapDays.toFixed(1)} days` : "not enough data yet"}
            </span>
          </span>
          <span>
            Longest gap:{" "}
            <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>
              {currentGaps.longestGapDays !== null ? `${currentGaps.longestGapDays.toFixed(1)} days` : "—"}
            </span>
          </span>
          <span>
            Target:{" "}
            <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>
              ~{targetPerWeek.toFixed(1)}/week ({target.value}/month{target.isDefault ? ", default" : ""})
            </span>
          </span>
          <span>
            This period: <span className="font-semibold" style={{ color: "var(--clay-ink)" }}>{currentPosts} posts</span> (last 30 days)
          </span>
        </div>

        <HeatmapPanel posts={postSummaries} scheduledPicks={scheduledPicks} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold">Posted picks</h2>
          <span className="text-xs mono" style={{ color: "var(--clay-ink-faint)" }}>
            {postedPicks.length} total
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {postedPicks.length === 0 && (
            <p className="text-sm" style={{ color: "var(--clay-ink-faint)" }}>
              Nothing posted yet.
            </p>
          )}
          {postedPicks.map((pick) => (
            <PostedPickCard key={pick.id} pick={pick} />
          ))}
        </div>
      </section>
    </div>
  );
}

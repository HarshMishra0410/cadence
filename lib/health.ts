/**
 * LinkedIn Health scoring. Four dimensions — Cadence, Consistency, Contributor
 * Coverage, Momentum — per the methodology: Cadence is the primary KPI (are we
 * posting at the rate we planned), the other three are diagnostic (why the
 * cadence number looks the way it does). Every score here must be traceable
 * back to real dates/counts shown alongside it — no number without its inputs
 * visible nearby in the UI.
 */

export const DEFAULT_TARGET_POSTS_PER_MONTH = 4;
const PERIOD_DAYS = 30;

export const WEIGHTS = {
  cadence: 0.4,
  consistency: 0.25,
  coverage: 0.2,
  momentum: 0.15,
};

export type HealthStatus = "healthy" | "at-risk" | "unhealthy";

export function healthStatus(score: number): { status: HealthStatus; label: string; emoji: string } {
  if (score >= 80) return { status: "healthy", label: "Healthy", emoji: "🟢" };
  if (score >= 60) return { status: "at-risk", label: "At Risk", emoji: "🟡" };
  return { status: "unhealthy", label: "Unhealthy", emoji: "🔴" };
}

export function getEffectiveTarget(targetPostsPerMonth: number | null): { value: number; isDefault: boolean } {
  if (targetPostsPerMonth && targetPostsPerMonth > 0) {
    return { value: targetPostsPerMonth, isDefault: false };
  }
  return { value: DEFAULT_TARGET_POSTS_PER_MONTH, isDefault: true };
}


export function countInLastDays(postedDates: Date[], days: number, asOf: Date = new Date()): number {
  const cutoff = asOf.getTime() - days * 24 * 60 * 60 * 1000;
  return postedDates.filter((d) => d.getTime() >= cutoff).length;
}

// ---- Gap stats (the shared input to Consistency + the "last post" display) ----

export type GapStats = {
  avgGapDays: number | null;
  gapStdDevDays: number | null;
  longestGapDays: number | null;
  lastPostedAt: Date | null;
  daysSinceLastPost: number | null;
  hasEnoughData: boolean; // needs 2+ posts in the window to say anything about spacing
};

/** Gaps between consecutive posts within the window, PLUS the live gap from the last post to now — a long current silence must show up as the longest gap, not just historical ones. */
export function computeGapStats(postedDates: Date[], windowDays = PERIOD_DAYS, asOf: Date = new Date()): GapStats {
  const cutoff = asOf.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const inWindow = postedDates
    .filter((d) => d.getTime() >= cutoff)
    .sort((a, b) => a.getTime() - b.getTime());

  const allSorted = [...postedDates].sort((a, b) => a.getTime() - b.getTime());
  const lastPostedAt = allSorted.length ? allSorted[allSorted.length - 1] : null;
  const daysSinceLastPost = lastPostedAt
    ? Math.floor((asOf.getTime() - lastPostedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (inWindow.length < 2) {
    return {
      avgGapDays: null,
      gapStdDevDays: null,
      longestGapDays: daysSinceLastPost,
      lastPostedAt,
      daysSinceLastPost,
      hasEnoughData: false,
    };
  }

  const gapsMs: number[] = [];
  for (let i = 1; i < inWindow.length; i++) {
    gapsMs.push(inWindow[i].getTime() - inWindow[i - 1].getTime());
  }
  const gapsDays = gapsMs.map((ms) => ms / (1000 * 60 * 60 * 24));

  // The live gap since the last post counts too — a post 2 days ago after a
  // clean history still means today's silence is the longest gap so far.
  if (daysSinceLastPost !== null) gapsDays.push(daysSinceLastPost);

  const avgGapDays = gapsDays.reduce((a, b) => a + b, 0) / gapsDays.length;
  const variance = gapsDays.reduce((sum, g) => sum + (g - avgGapDays) ** 2, 0) / gapsDays.length;
  const gapStdDevDays = Math.sqrt(variance);
  const longestGapDays = Math.max(...gapsDays);

  return { avgGapDays, gapStdDevDays, longestGapDays, lastPostedAt, daysSinceLastPost, hasEnoughData: true };
}

// ---- Dimension 1: Cadence ----

export function cadenceScore(actualPosts: number, targetPosts: number): number {
  if (targetPosts <= 0) return 100;
  return Math.min(100, Math.round((actualPosts / targetPosts) * 100));
}

// ---- Dimension 2: Consistency ----

export function consistencyScore(gaps: GapStats, targetPosts: number, windowDays = PERIOD_DAYS): number | null {
  if (!gaps.hasEnoughData || gaps.avgGapDays === null || gaps.gapStdDevDays === null || gaps.longestGapDays === null) {
    return null; // not enough posts in the window to say anything about spacing
  }
  const targetGapDays = windowDays / Math.max(1, targetPosts);

  const avgGapPenalty = Math.min(50, (Math.max(0, gaps.avgGapDays - targetGapDays) / targetGapDays) * 50);
  const variabilityPenalty = Math.min(30, (gaps.gapStdDevDays / targetGapDays) * 30);
  const longestGapPenalty = Math.min(
    20,
    (Math.max(0, gaps.longestGapDays - targetGapDays * 3) / (targetGapDays * 3)) * 20,
  );

  return Math.round(Math.max(0, 100 - avgGapPenalty - variabilityPenalty - longestGapPenalty));
}

// ---- Dimension 3: Contributor Coverage (org-wide only) ----

export type ChefCoverageInput = { actual: number; target: number };

/** Average adherence to each chef's own target — "are the intended personas participating, at the rate expected." */
export function roleCoverageScore(chefs: ChefCoverageInput[]): number | null {
  if (chefs.length === 0) return null;
  const perChef = chefs.map((c) => Math.min(1, c.target > 0 ? c.actual / c.target : 1));
  return Math.round((perChef.reduce((a, b) => a + b, 0) / perChef.length) * 100);
}

/** How many of the expected contributors posted at all — "are we relying on just a few people." */
export function contributorDiversityScore(chefs: ChefCoverageInput[]): number | null {
  if (chefs.length === 0) return null;
  const active = chefs.filter((c) => c.actual > 0).length;
  return Math.round((active / chefs.length) * 100);
}

export function contributorCoverageScore(roleCoverage: number | null, diversity: number | null): number | null {
  if (roleCoverage === null || diversity === null) return null;
  return Math.round(0.6 * roleCoverage + 0.4 * diversity);
}

// ---- Dimension 4: Momentum ----

export type MomentumInput = { posts: number; activeContributors: number; avgGapDays: number | null };

/** Compares this period to the previous one; centered at 50 (neutral), moves up/down with the average % change across posts, contributors, and gap (inverted — a shrinking gap is improvement). */
export function momentumScore(current: MomentumInput, previous: MomentumInput): number | null {
  if (previous.posts === 0 && current.posts === 0) return null; // nothing to compare

  const pctChange = (curr: number, prev: number): number => {
    if (prev === 0) return curr > 0 ? 1 : 0; // went from nothing to something = full positive signal
    return (curr - prev) / prev;
  };

  const postsDelta = pctChange(current.posts, previous.posts);
  const contributorsDelta = pctChange(current.activeContributors, previous.activeContributors);

  let gapDelta = 0;
  if (current.avgGapDays !== null && previous.avgGapDays !== null && previous.avgGapDays > 0) {
    gapDelta = (previous.avgGapDays - current.avgGapDays) / previous.avgGapDays; // shrinking gap = positive
  }

  const avgChange = (postsDelta + contributorsDelta + gapDelta) / 3;
  return Math.round(Math.max(0, Math.min(100, 50 + avgChange * 100)));
}

// ---- Composite ----

export type DimensionScores = {
  cadence: number | null;
  consistency: number | null;
  coverage: number | null;
  momentum: number | null;
};

/** Weighted average, renormalized across whichever dimensions actually have data — a dimension with no data is excluded rather than treated as 0. */
export function overallHealthScore(dims: DimensionScores): number | null {
  const entries: [number, number][] = [];
  if (dims.cadence !== null) entries.push([dims.cadence, WEIGHTS.cadence]);
  if (dims.consistency !== null) entries.push([dims.consistency, WEIGHTS.consistency]);
  if (dims.coverage !== null) entries.push([dims.coverage, WEIGHTS.coverage]);
  if (dims.momentum !== null) entries.push([dims.momentum, WEIGHTS.momentum]);

  if (entries.length === 0) return null;
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  const weighted = entries.reduce((sum, [score, w]) => sum + score * w, 0);
  return Math.round(weighted / totalWeight);
}

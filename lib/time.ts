/**
 * "X hours ago" until 24h have passed, then "X days ago" — per spec, hours
 * roll over into days rather than showing e.g. "36 hours ago".
 */
export function relativeTime(date: Date | string): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - then.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

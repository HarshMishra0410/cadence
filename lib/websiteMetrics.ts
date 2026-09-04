/**
 * Live counts scraped from the public facets.cloud site. Both pages are
 * server-rendered (no JS execution needed to see the real numbers), so a
 * plain fetch + text match is enough — confirmed by inspecting the raw HTML
 * of each page before writing these.
 */

const BLOG_URL = "https://www.facets.cloud/blog";
const CHANGELOG_URL = "https://www.facets.cloud/docs/changelog";

export async function scrapeBlogCount(): Promise<number | null> {
  try {
    const res = await fetch(BLOG_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const html = await res.text();
    // Rendered text reads "Showing 1–15 of 97 articles", split by React
    // hydration comments (<!-- -->) in the raw HTML.
    const clean = html.replace(/<!--\s*-->/g, "");
    const match = clean.match(/of\s*(\d+)\s*articles/i);
    return match ? parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
}

export async function scrapeChangelogCount(): Promise<number | null> {
  try {
    const res = await fetch(CHANGELOG_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const html = await res.text();
    // Every release entry has a "Release Notes vX.Y" heading; the page
    // lists the full history on one URL (no pagination), so counting
    // distinct versions gives the total release count.
    const matches = html.match(/Release Notes v\d[\d.]*/gi) ?? [];
    const unique = new Set(matches);
    return unique.size || null;
  } catch {
    return null;
  }
}

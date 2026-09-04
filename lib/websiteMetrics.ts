/**
 * Live counts + full post list scraped from the public facets.cloud site.
 *
 * Blog: the listing page paginates client-side and doesn't expose more than
 * the first ~15 posts to a plain fetch, but /sitemap-blog.xml lists every
 * post URL, and every individual post page carries a clean schema.org
 * BlogPosting JSON-LD block (title, author, category, publish date) — both
 * confirmed by inspecting the real responses before writing this.
 *
 * Changelog: the docs changelog page lists the full release history on one
 * URL, server-rendered, so a plain fetch + text match is enough there.
 */

const SITEMAP_URL = "https://www.facets.cloud/sitemap-blog.xml";
const CHANGELOG_URL = "https://www.facets.cloud/docs/changelog";

// Fetch post pages in bounded batches rather than all 97 in parallel, so a
// slow one doesn't blow a serverless function's connection/time limits.
const BATCH_SIZE = 10;

export type ScrapedBlogPost = {
  slug: string;
  title: string;
  description: string | null;
  link: string;
  author: string | null;
  category: string | null;
  publishedAt: Date | null;
};

async function listBlogUrls(): Promise<{ slug: string; link: string; lastmod: Date | null }[]> {
  const res = await fetch(SITEMAP_URL, { cache: "no-store" });
  if (!res.ok) return [];
  const xml = await res.text();
  const entries: { slug: string; link: string; lastmod: Date | null }[] = [];
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    const slug = loc.split("/blog/")[1]?.replace(/\/$/, "");
    if (!slug) continue;
    const lastmodStr = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    entries.push({ slug, link: loc, lastmod: lastmodStr ? new Date(lastmodStr) : null });
  }
  return entries;
}

async function fetchOnePost(entry: {
  slug: string;
  link: string;
  lastmod: Date | null;
}): Promise<ScrapedBlogPost | null> {
  try {
    const res = await fetch(entry.link, { cache: "no-store" });
    if (!res.ok) return null;
    const html = await res.text();

    const ldBlocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) ?? [];
    for (const block of ldBlocks) {
      const jsonText = block.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        continue;
      }
      if (parsed["@type"] !== "BlogPosting" && parsed["@type"] !== "Article") continue;

      const author = parsed.author as { name?: string } | undefined;
      return {
        slug: entry.slug,
        title: String(parsed.headline ?? entry.slug),
        description: typeof parsed.description === "string" ? parsed.description : null,
        link: entry.link,
        author: author?.name ?? null,
        category: typeof parsed.articleSection === "string" ? parsed.articleSection : null,
        publishedAt: typeof parsed.datePublished === "string" ? new Date(parsed.datePublished) : entry.lastmod,
      };
    }

    // No BlogPosting block found — fall back to the <title> tag rather than
    // dropping the post entirely.
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    return {
      slug: entry.slug,
      title: title ?? entry.slug,
      description: null,
      link: entry.link,
      author: null,
      category: null,
      publishedAt: entry.lastmod,
    };
  } catch {
    return null;
  }
}

export async function scrapeBlogPosts(): Promise<ScrapedBlogPost[]> {
  const entries = await listBlogUrls();
  const results: ScrapedBlogPost[] = [];

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(fetchOnePost));
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  return results;
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

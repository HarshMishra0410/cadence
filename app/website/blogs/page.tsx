import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "Undated";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;
  const query = (q ?? "").trim();
  const sortDir = sort === "oldest" ? "asc" : "desc";

  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
              { author: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { publishedAt: sortDir },
    }),
    prisma.blogPost.count(),
  ]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <Link href="/website" className="text-xs mono" style={{ color: "var(--clay-accent-strong)" }}>
          &larr; Website Content
        </Link>
        <h1 className="text-3xl font-display font-bold mt-2">Blog Posts</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--clay-ink-faint)" }}>
          {totalCount} imported from facets.cloud
          {query || sort === "oldest" ? ` · ${posts.length} shown` : ""}
        </p>
      </div>

      <form className="flex items-center gap-3 flex-wrap">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search title, category, author&hellip;"
          className="clay-input text-sm"
          style={{ maxWidth: "22rem" }}
        />
        {sort === "oldest" && <input type="hidden" name="sort" value="oldest" />}
        <button type="submit" className="clay-btn text-sm">
          Search
        </button>
        <div className="flex items-center gap-1.5 ml-auto">
          <Link
            href={{ pathname: "/website/blogs", query: { ...(query ? { q: query } : {}), sort: "newest" } }}
            className={`clay-btn text-xs px-3 py-1.5 ${sortDir === "desc" ? "clay-inset" : ""}`}
          >
            Newest first
          </Link>
          <Link
            href={{ pathname: "/website/blogs", query: { ...(query ? { q: query } : {}), sort: "oldest" } }}
            className={`clay-btn text-xs px-3 py-1.5 ${sortDir === "asc" ? "clay-inset" : ""}`}
          >
            Oldest first
          </Link>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {posts.length === 0 && (
          <p className="text-sm" style={{ color: "var(--clay-ink-faint)" }}>
            {totalCount === 0
              ? "No posts imported yet — hit Refresh on the Website Content page."
              : "No posts match that search."}
          </p>
        )}
        {posts.map((post) => (
          <article key={post.id} className="clay-card p-5 flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display font-semibold"
                style={{ color: "var(--clay-ink)" }}
              >
                {post.title}
              </a>
              <span className="text-xs mono whitespace-nowrap" style={{ color: "var(--clay-ink-faint)" }}>
                {formatDate(post.publishedAt)}
              </span>
            </div>
            {post.description && (
              <p className="text-sm" style={{ color: "var(--clay-ink-soft)" }}>
                {post.description}
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap text-xs mono" style={{ color: "var(--clay-ink-faint)" }}>
              {post.category && (
                <span
                  className="clay-chip"
                  style={{ background: "var(--clay-accent-soft)", color: "var(--clay-accent-strong)" }}
                >
                  {post.category}
                </span>
              )}
              {post.author && <span>by {post.author}</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

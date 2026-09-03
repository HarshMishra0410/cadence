import Papa from "papaparse";

export type ImportedRow = {
  topic: string;
  content: string;
  link: string | null;
  postedAt: Date;
  impressions: number | null;
};

export type ImportResult = {
  rows: ImportedRow[];
  skipped: number;
  matchedColumns: { field: string; header: string | null }[];
  headers: string[];
};

/** Case-insensitive substring match against a header row; returns the first hit. */
function findHeader(headers: string[], candidates: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase());
  for (const candidate of candidates) {
    const idx = lower.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseDate(raw: string): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function parseNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[,%\s]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * Parses a LinkedIn analytics export (personal "Post analytics" CSV, or a
 * Company Page "Content" export saved as CSV) into Post-shaped rows.
 * Column names aren't hardcoded — LinkedIn's exact export headers weren't
 * available to verify against, so this fuzzy-matches common header shapes
 * and reports what it matched, rather than assuming a fixed schema.
 */
export function parsePostsCsv(csvText: string): ImportResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = parsed.meta.fields ?? [];

  const dateHeader = findHeader(headers, ["date", "posted", "published", "created"]);
  const linkHeader = findHeader(headers, ["url", "link", "permalink"]);
  const contentHeader = findHeader(headers, ["content", "text", "caption", "post title", "title"]);
  const impressionsHeader = findHeader(headers, ["impression", "views", "view count"]);

  const matchedColumns = [
    { field: "postedAt (date)", header: dateHeader },
    { field: "link", header: linkHeader },
    { field: "content/topic", header: contentHeader },
    { field: "impressions", header: impressionsHeader },
  ];

  const rows: ImportedRow[] = [];
  let skipped = 0;

  for (const record of parsed.data) {
    const dateRaw = dateHeader ? record[dateHeader] : "";
    const postedAt = parseDate(dateRaw ?? "");
    if (!postedAt) {
      skipped++;
      continue;
    }

    const content = contentHeader ? (record[contentHeader] ?? "").trim() : "";
    const link = linkHeader ? (record[linkHeader] ?? "").trim() || null : null;
    const impressions = impressionsHeader ? parseNumber(record[impressionsHeader]) : null;

    rows.push({
      topic: content ? content.slice(0, 80) : "Imported LinkedIn post",
      content: content || "(no content captured in export — see link)",
      link,
      postedAt,
      impressions,
    });
  }

  return { rows, skipped, matchedColumns, headers };
}

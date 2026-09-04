"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AuthorValidation, ContentIdeaType } from "@prisma/client";
import { parsePostsCsv } from "@/lib/csvImport";
import { scrapeBlogCount, scrapeChangelogCount } from "@/lib/websiteMetrics";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optStr(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v.length ? v : null;
}

function optInt(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (!v.length) return null;
  const n = parseInt(v, 10);
  return isNaN(n) || n <= 0 ? null : n;
}

// ---- Chef ----

export async function createChef(formData: FormData) {
  const name = str(formData, "name");
  const linkedinUrl = str(formData, "linkedinUrl");
  const position = str(formData, "position");
  const email = str(formData, "email");
  const intent = optStr(formData, "intent");
  const targetPostsPerMonth = optInt(formData, "targetPostsPerMonth");

  if (!name || !linkedinUrl || !position || !email) {
    throw new Error("Name, LinkedIn URL, position, and email are required.");
  }

  await prisma.chef.create({
    data: { name, linkedinUrl, position, email, intent, targetPostsPerMonth },
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateChef(chefId: string, formData: FormData) {
  const name = str(formData, "name");
  const linkedinUrl = str(formData, "linkedinUrl");
  const position = str(formData, "position");
  const email = str(formData, "email");
  const intent = optStr(formData, "intent");
  const targetPostsPerMonth = optInt(formData, "targetPostsPerMonth");

  if (!name || !linkedinUrl || !position || !email) {
    throw new Error("Name, LinkedIn URL, position, and email are required.");
  }

  await prisma.chef.update({
    where: { id: chefId },
    data: { name, linkedinUrl, position, email, intent, targetPostsPerMonth },
  });

  revalidatePath("/");
  revalidatePath(`/chef/${chefId}`);
  redirect(`/chef/${chefId}`);
}

// ---- Company ----

export async function updateCompany(formData: FormData) {
  const linkedinUrl = str(formData, "linkedinUrl");
  await prisma.company.upsert({
    where: { id: "company" },
    update: { linkedinUrl },
    create: { id: "company", linkedinUrl },
  });
  revalidatePath("/");
}

// ---- Marketing Pointer ("pick") ----

export async function createMarketingPointer(chefId: string, formData: FormData) {
  const name = str(formData, "name");
  const whatHappened = str(formData, "whatHappened");
  const contextBehind = str(formData, "contextBehind");
  const author = str(formData, "author");
  const positioning = str(formData, "positioning");
  const importantLinks = optStr(formData, "importantLinks");

  if (!name || !whatHappened || !contextBehind || !author || !positioning) {
    throw new Error("All fields except important links are required.");
  }

  const pointer = await prisma.marketingPointer.create({
    data: {
      name,
      whatHappened,
      contextBehind,
      author,
      positioning,
      importantLinks,
      chefId,
      storyGroupId: "", // set below to its own id, since this flow creates one card at a time
    },
  });

  await prisma.marketingPointer.update({
    where: { id: pointer.id },
    data: { storyGroupId: pointer.id },
  });

  revalidatePath(`/chef/${chefId}`);
  redirect(`/chef/${chefId}`);
}

export async function updateAuthorValidation(pointerId: string, chefId: string, value: AuthorValidation) {
  await prisma.marketingPointer.update({
    where: { id: pointerId },
    data: { authorValidation: value },
  });
  revalidatePath(`/chef/${chefId}`);
}

/**
 * Marking a pick posted is the SAME action as logging its Post — one click
 * creates the linked Post record (powering the heatmap + summary feed) and
 * stamps the pointer's postedAt, which removes it from "Picks to be Posted".
 */
export async function markPointerPosted(pointerId: string, chefId: string, formData: FormData) {
  const link = optStr(formData, "link");

  const pointer = await prisma.marketingPointer.findUniqueOrThrow({
    where: { id: pointerId },
  });

  const now = new Date();

  await prisma.$transaction([
    prisma.marketingPointer.update({
      where: { id: pointerId },
      data: { postedAt: now },
    }),
    prisma.post.create({
      data: {
        ownerType: "CHEF",
        chefId,
        topic: pointer.name,
        content: pointer.positioning,
        link,
        postedAt: now,
        marketingPointerId: pointerId,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath(`/chef/${chefId}`);
}

export async function schedulePointer(pointerId: string, chefId: string, formData: FormData) {
  const dateStr = str(formData, "scheduledFor");
  if (!dateStr) {
    throw new Error("Pick a date to schedule for.");
  }

  const scheduledFor = new Date(`${dateStr}T00:00:00`);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  if (scheduledFor < todayStart) {
    throw new Error("Can't schedule a post in the past.");
  }

  await prisma.marketingPointer.update({
    where: { id: pointerId },
    data: { scheduledFor },
  });

  revalidatePath(`/chef/${chefId}`);
}

export async function unschedulePointer(pointerId: string, chefId: string) {
  await prisma.marketingPointer.update({
    where: { id: pointerId },
    data: { scheduledFor: null },
  });
  revalidatePath(`/chef/${chefId}`);
}

// ---- Post (standalone log, e.g. for Company) ----

export async function logPost(formData: FormData) {
  const ownerType = str(formData, "ownerType") as "CHEF" | "COMPANY";
  const chefId = optStr(formData, "chefId");
  const topic = str(formData, "topic");
  const content = str(formData, "content");
  const link = optStr(formData, "link");

  if (!topic || !content) {
    throw new Error("Topic and content are required.");
  }
  if (ownerType === "CHEF" && !chefId) {
    throw new Error("chefId is required when logging a post for a chef.");
  }

  await prisma.post.create({
    data: {
      ownerType,
      chefId: ownerType === "CHEF" ? chefId : null,
      topic,
      content,
      link,
    },
  });

  revalidatePath("/");
  if (chefId) revalidatePath(`/chef/${chefId}`);
}

// ---- CSV import (LinkedIn native analytics export) ----

export async function importPostsFromCsv(formData: FormData) {
  const ownerType = str(formData, "ownerType") as "CHEF" | "COMPANY";
  const chefId = optStr(formData, "chefId");
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Choose a CSV file to import.");
  }
  if (ownerType === "CHEF" && !chefId) {
    throw new Error("Pick which chef this export belongs to.");
  }

  const text = await file.text();
  const { rows, skipped, matchedColumns } = parsePostsCsv(text);

  if (rows.length > 0) {
    await prisma.post.createMany({
      data: rows.map((r) => ({
        ownerType,
        chefId: ownerType === "CHEF" ? chefId : null,
        topic: r.topic,
        content: r.content,
        link: r.link,
        postedAt: r.postedAt,
        impressions: r.impressions,
        source: "csv-import",
      })),
    });
  }

  revalidatePath("/");
  if (chefId) revalidatePath(`/chef/${chefId}`);

  const params = new URLSearchParams();
  params.set("imported", String(rows.length));
  params.set("skipped", String(skipped));
  params.set(
    "matched",
    matchedColumns.map((m) => `${m.field}=${m.header ?? "(not found)"}`).join("|"),
  );
  redirect(`/import?${params.toString()}`);
}

// ---- Website content (blog/newsletter ideas + published-content metrics) ----

export async function createContentIdea(formData: FormData) {
  const type = str(formData, "type") as ContentIdeaType;
  const topic = str(formData, "topic");
  const content = str(formData, "content");
  const author = str(formData, "author");
  const link = optStr(formData, "link");

  if (!type || !topic || !content || !author) {
    throw new Error("Type, topic, content, and author are required.");
  }

  await prisma.contentIdea.create({
    data: { type, topic, content, author, link },
  });

  revalidatePath("/website");
  redirect("/website");
}

export async function markContentIdeaPublished(id: string) {
  await prisma.contentIdea.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  revalidatePath("/website");
}

/**
 * Scrapes live blog/changelog counts from facets.cloud and pairs them with
 * our own published-newsletter count (no public newsletter page exists to
 * scrape), storing the result as a new snapshot so the chart can show
 * change over time rather than just the latest number.
 */
export async function refreshWebsiteMetrics() {
  const [blogCount, changelogCount, newsletterCount] = await Promise.all([
    scrapeBlogCount(),
    scrapeChangelogCount(),
    prisma.contentIdea.count({ where: { type: "NEWSLETTER", status: "PUBLISHED" } }),
  ]);

  await prisma.websiteMetricSnapshot.create({
    data: { blogCount, changelogCount, newsletterCount },
  });

  revalidatePath("/website");
}

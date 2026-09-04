-- CreateEnum
CREATE TYPE "ContentIdeaType" AS ENUM ('BLOG', 'NEWSLETTER');

-- CreateEnum
CREATE TYPE "ContentIdeaStatus" AS ENUM ('IDEA', 'PUBLISHED');

-- CreateTable
CREATE TABLE "ContentIdea" (
    "id" TEXT NOT NULL,
    "type" "ContentIdeaType" NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "link" TEXT,
    "status" "ContentIdeaStatus" NOT NULL DEFAULT 'IDEA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "ContentIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteMetricSnapshot" (
    "id" TEXT NOT NULL,
    "blogCount" INTEGER,
    "changelogCount" INTEGER,
    "newsletterCount" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentIdea_type_idx" ON "ContentIdea"("type");

-- CreateIndex
CREATE INDEX "ContentIdea_status_idx" ON "ContentIdea"("status");

-- CreateIndex
CREATE INDEX "WebsiteMetricSnapshot_capturedAt_idx" ON "WebsiteMetricSnapshot"("capturedAt");

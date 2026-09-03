-- CreateEnum
CREATE TYPE "AuthorValidation" AS ENUM ('PENDING', 'CONFIRMED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PostOwnerType" AS ENUM ('CHEF', 'COMPANY');

-- CreateTable
CREATE TABLE "Chef" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "intent" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetPostsPerMonth" INTEGER,

    CONSTRAINT "Chef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL DEFAULT 'company',
    "linkedinUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingPointer" (
    "id" TEXT NOT NULL,
    "storyGroupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatHappened" TEXT NOT NULL,
    "contextBehind" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "positioning" TEXT NOT NULL,
    "importantLinks" TEXT,
    "authorValidation" "AuthorValidation" NOT NULL DEFAULT 'PENDING',
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" TIMESTAMP(3),
    "chefId" TEXT NOT NULL,

    CONSTRAINT "MarketingPointer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "ownerType" "PostOwnerType" NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "link" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "impressions" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "chefId" TEXT,
    "marketingPointerId" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketingPointer_chefId_idx" ON "MarketingPointer"("chefId");

-- CreateIndex
CREATE INDEX "MarketingPointer_storyGroupId_idx" ON "MarketingPointer"("storyGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_marketingPointerId_key" ON "Post"("marketingPointerId");

-- CreateIndex
CREATE INDEX "Post_chefId_idx" ON "Post"("chefId");

-- CreateIndex
CREATE INDEX "Post_postedAt_idx" ON "Post"("postedAt");

-- AddForeignKey
ALTER TABLE "MarketingPointer" ADD CONSTRAINT "MarketingPointer_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "Chef"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "Chef"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_marketingPointerId_fkey" FOREIGN KEY ("marketingPointerId") REFERENCES "MarketingPointer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

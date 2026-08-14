-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "ScoreEntry" (
    "id" TEXT NOT NULL,
    "initials" VARCHAR(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "timeMs" INTEGER NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScoreEntry_score_timeMs_idx" ON "ScoreEntry"("score", "timeMs");


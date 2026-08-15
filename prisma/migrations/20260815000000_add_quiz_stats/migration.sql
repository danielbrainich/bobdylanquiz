-- CreateTable
CREATE TABLE "QuizRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "answeredCount" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER,
    "timeMs" INTEGER,

    CONSTRAINT "QuizRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterStat" (
    "character" TEXT NOT NULL,
    "served" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "wrong" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterStat_pkey" PRIMARY KEY ("character")
);

-- CreateIndex
CREATE INDEX "QuizRun_finishedAt_idx" ON "QuizRun"("finishedAt");

-- AlterTable
ALTER TABLE "ScoreEntry" ADD COLUMN "quizRunId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ScoreEntry_quizRunId_key" ON "ScoreEntry"("quizRunId");

-- AddForeignKey
ALTER TABLE "ScoreEntry" ADD CONSTRAINT "ScoreEntry_quizRunId_fkey" FOREIGN KEY ("quizRunId") REFERENCES "QuizRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

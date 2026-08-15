-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "quizRunId" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizAnswer_quizRunId_idx" ON "QuizAnswer"("quizRunId");

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizRunId_fkey" FOREIGN KEY ("quizRunId") REFERENCES "QuizRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

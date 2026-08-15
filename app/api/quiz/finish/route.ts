import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QUESTION_COUNT } from "@/lib/quiz";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { runId, score, timeMs } = body as Record<string, unknown>;

  if (typeof runId !== "string") {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  if (!Number.isInteger(score) || (score as number) < 0 || (score as number) > QUESTION_COUNT) {
    return NextResponse.json(
      { error: `score must be an integer between 0 and ${QUESTION_COUNT}` },
      { status: 400 }
    );
  }

  if (!Number.isInteger(timeMs) || (timeMs as number) <= 0) {
    return NextResponse.json(
      { error: "timeMs must be a positive integer" },
      { status: 400 }
    );
  }

  await prisma.quizRun.updateMany({
    where: { id: runId, finishedAt: null },
    data: {
      finishedAt: new Date(),
      score: score as number,
      timeMs: timeMs as number,
    },
  });

  return NextResponse.json({ ok: true });
}

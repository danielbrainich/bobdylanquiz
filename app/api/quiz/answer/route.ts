import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DATA } from "@/lib/data";

const VALID_CHARACTERS = new Set<string>(DATA.map((d) => d.character));

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { runId, character, correct } = body as Record<string, unknown>;

  if (typeof runId !== "string") {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  if (typeof character !== "string" || !VALID_CHARACTERS.has(character)) {
    return NextResponse.json({ error: "Unknown character" }, { status: 400 });
  }

  if (typeof correct !== "boolean") {
    return NextResponse.json({ error: "correct must be a boolean" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.quizRun.updateMany({
      where: { id: runId, finishedAt: null },
      data: { answeredCount: { increment: 1 } },
    }),
    prisma.characterStat.upsert({
      where: { character },
      create: { character, served: 1, correct: correct ? 1 : 0, wrong: correct ? 0 : 1 },
      update: {
        served: { increment: 1 },
        correct: { increment: correct ? 1 : 0 },
        wrong: { increment: correct ? 0 : 1 },
      },
    }),
    prisma.quizAnswer.create({
      data: { quizRunId: runId, character, correct },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

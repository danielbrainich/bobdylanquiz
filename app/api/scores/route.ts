import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INITIALS_RE = /^[A-Z]{1,3}$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { initials, score, timeMs, quizRunId } = body as Record<string, unknown>;

  if (typeof initials !== "string" || !INITIALS_RE.test(initials)) {
    return NextResponse.json(
      { error: "Initials must be 1-3 uppercase letters" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(score) || (score as number) < 0 || (score as number) > 10) {
    return NextResponse.json(
      { error: "Score must be an integer between 0 and 10" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(timeMs) || (timeMs as number) <= 0) {
    return NextResponse.json(
      { error: "timeMs must be a positive integer" },
      { status: 400 }
    );
  }

  if (quizRunId !== undefined && typeof quizRunId !== "string") {
    return NextResponse.json({ error: "quizRunId must be a string" }, { status: 400 });
  }

  const entry = await prisma.scoreEntry.create({
    data: {
      initials,
      score: score as number,
      timeMs: timeMs as number,
      ...(quizRunId ? { quizRunId: quizRunId as string } : {}),
    },
  });

  const [total, better] = await Promise.all([
    prisma.scoreEntry.count(),
    prisma.scoreEntry.count({
      where: {
        OR: [
          { score: { gt: entry.score } },
          { score: entry.score, timeMs: { lt: entry.timeMs } },
        ],
      },
    }),
  ]);

  return NextResponse.json(
    { id: entry.id, rank: better + 1, total },
    { status: 201 }
  );
}

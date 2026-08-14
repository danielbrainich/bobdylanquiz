import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LEADERBOARD_SIZE } from "@/lib/quiz";

export async function GET() {
  const entries = await prisma.scoreEntry.findMany({
    orderBy: [{ score: "desc" }, { timeMs: "asc" }],
    take: LEADERBOARD_SIZE,
    select: {
      id: true,
      initials: true,
      score: true,
      timeMs: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ entries });
}

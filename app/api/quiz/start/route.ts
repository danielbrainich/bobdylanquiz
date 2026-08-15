import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const run = await prisma.quizRun.create({ data: {} });
  return NextResponse.json({ runId: run.id }, { status: 201 });
}

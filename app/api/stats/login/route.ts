import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "stats_auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password");
  const expected = process.env.STATS_PASSWORD;

  if (typeof password !== "string" || !expected || password !== expected) {
    return NextResponse.redirect(new URL("/stats/login?error=1", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/stats", request.url), 303);
  response.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

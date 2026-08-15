import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "stats_auth";

export function proxy(request: NextRequest) {
  const password = process.env.PASSWORD;
  if (!password) return NextResponse.next();

  if (request.nextUrl.pathname === "/stats/login") {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie === password) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/stats/login", request.url));
}

export const config = {
  matcher: "/stats/:path*",
};

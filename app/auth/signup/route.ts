import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL("/auth/register", req.url);
  // Forward any query parameters (such as redirect, package, etc.)
  req.nextUrl.searchParams.forEach((val, key) => {
    url.searchParams.set(key, val);
  });
  return NextResponse.redirect(url, 307);
}


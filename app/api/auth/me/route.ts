import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    return NextResponse.json({
      authenticated: !!user,
      user: user || null,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const account = await prisma.account.findUnique({
      where: { email: normalizedEmail },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found. Please sign in with Email OTP." },
        { status: 401 }
      );
    }

    const safeUser = {
      id: account.id,
      email: account.email,
      name: account.fullName,
    };

    const token = await createSessionToken(safeUser);
    const response = NextResponse.json({
      success: true,
      user: safeUser,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error during sign in" },
      { status: 500 }
    );
  }
}

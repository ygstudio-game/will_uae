import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if account already exists
    const existing = await prisma.account.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // Treat duplicate registration as the same user: log them in seamlessly without error
      const safeUser = { id: existing.id, email: existing.email, name: existing.fullName };
      if (name && name.trim() && name.trim() !== existing.fullName) {
        const updated = await prisma.account.update({
          where: { id: existing.id },
          data: { fullName: name.trim() },
        });
        safeUser.name = updated.fullName;
      }

      const token = await createSessionToken(safeUser);
      const response = NextResponse.json({
        success: true,
        user: safeUser,
        isExisting: true,
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
    }

    const account = await prisma.account.create({
      data: {
        fullName: name.trim(),
        email: normalizedEmail,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    const safeUser = { id: account.id, email: account.email, name: account.fullName };

    // Create session token and set HTTP-only cookie
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
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}

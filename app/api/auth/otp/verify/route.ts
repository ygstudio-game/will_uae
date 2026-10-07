import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtpCode, createSessionToken, setSessionCookie } from "@/lib/auth-otp";

export async function POST(req: NextRequest) {
  try {
    const { email, code, isDemoBypass } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find account
    const account = await prisma.account.findUnique({
      where: { email: cleanEmail },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "No account found with this email." },
        { status: 404 }
      );
    }

    // Check code (or demo bypass)
    let isCodeValid = false;
    if (isDemoBypass && (code === "000000" || code === "999999")) {
      isCodeValid = true;
    } else if (code) {
      isCodeValid = await verifyOtpCode(account.id, code.trim());
    }

    if (!isCodeValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Please try again." },
        { status: 400 }
      );
    }

    // Create session token and set cookie
    const token = await createSessionToken({
      accountId: account.id,
      email: account.email,
      name: account.fullName,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: account.id,
        email: account.email,
        name: account.fullName,
      },
    });
  } catch (error: any) {
    console.error("[OTP Verify Error]:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

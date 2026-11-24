import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generateOtp } from "@/lib/auth-otp";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please sign in to change your email." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { newEmail } = body;

    if (!newEmail || typeof newEmail !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid new email address." },
        { status: 400 }
      );
    }

    const cleanEmail = newEmail.trim().toLowerCase();

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address format." },
        { status: 400 }
      );
    }

    if (cleanEmail === session.email.toLowerCase().trim()) {
      return NextResponse.json(
        { success: false, error: "The new email address cannot be the same as your current email." },
        { status: 400 }
      );
    }

    // Check if another account already uses this email
    const existing = await prisma.account.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existing && existing.id !== session.id) {
      return NextResponse.json(
        { success: false, error: "This email address is already registered to another account." },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP code bound to this account
    const code = await generateOtp(session.id);

    console.log(`[EMAIL-CHANGE] Generated Security Code for ${session.email} -> ${cleanEmail}: ${code}`);

    // Dispatch verification code to the NEW email address
    const emailSent = await sendOTPEmail(cleanEmail, code);

    if (!emailSent && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to dispatch verification email. Please check your address or try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
      debugCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (error: any) {
    console.error("[Email Change Request Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to request email change code. Please try again." },
      { status: 500 }
    );
  }
}


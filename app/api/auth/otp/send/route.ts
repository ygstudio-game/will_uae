import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth-otp";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find or create account
    let account = await prisma.account.findUnique({
      where: { email: cleanEmail },
    });

    if (!account) {
      account = await prisma.account.create({
        data: {
          email: cleanEmail,
          fullName: cleanEmail.split("@")[0].replace(/[._]/g, " "),
        },
      });
    }

    // Generate OTP
    const code = await generateOtp(account.id);

    console.log(`[AUTH-OTP] Security Code for ${cleanEmail}: ${code}`);

    // In non-production or for demo testing, return code directly to simplify test flows
    return NextResponse.json({
      success: true,
      message: "A 6-digit verification code has been sent to your email.",
      debugCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (error: any) {
    console.error("[OTP Send Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}

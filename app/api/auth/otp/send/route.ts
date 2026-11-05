import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth-otp";
import { sendOTPEmail } from "@/lib/email";

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

    // Generate 6-digit OTP in database (15-min expiry)
    const code = await generateOtp(account.id);

    console.log(`[AUTH-OTP] Generated Security Code for ${cleanEmail}: ${code}`);

    // Dispatch live email via Hostinger SMTP
    const emailSent = await sendOTPEmail(cleanEmail, code);

    if (!emailSent && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send verification email. Please check your address or try again shortly.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailSent,
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

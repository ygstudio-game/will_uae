import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, createSessionToken, setSessionCookie } from "@/lib/auth";
import { verifyOtpCode } from "@/lib/auth-otp";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please sign in to complete email change." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { newEmail, code } = body;

    if (!newEmail || typeof newEmail !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide the new email address." },
        { status: 400 }
      );
    }

    const cleanEmail = newEmail.trim().toLowerCase();

    if (!code || typeof code !== "string" || code.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: "Please enter the 6-digit verification code." },
        { status: 400 }
      );
    }

    // Verify OTP code
    const isCodeValid = await verifyOtpCode(session.id, code.trim());
    if (!isCodeValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // Double check conflict
    const existing = await prisma.account.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existing && existing.id !== session.id) {
      return NextResponse.json(
        { success: false, error: "This email address is already in use by another account." },
        { status: 400 }
      );
    }

    const oldEmail = session.email;

    // Update account email
    const updatedAccount = await prisma.account.update({
      where: { id: session.id },
      data: { email: cleanEmail },
    });

    // Update Person records matching old email in this account's applications
    const userApps = await prisma.application.findMany({
      where: { accountId: session.id },
      select: { id: true },
    });
    const appIds = userApps.map((a) => a.id);

    if (appIds.length > 0) {
      await prisma.person.updateMany({
        where: {
          applicationId: { in: appIds },
          email: oldEmail,
        },
        data: { email: cleanEmail },
      });
    }

    // Refresh session cookie with new email
    const token = await createSessionToken({
      accountId: updatedAccount.id,
      email: updatedAccount.email,
      name: updatedAccount.fullName,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Email address successfully updated and verified.",
      user: {
        id: updatedAccount.id,
        email: updatedAccount.email,
        name: updatedAccount.fullName,
      },
    });
  } catch (error: any) {
    console.error("[Email Change Verify Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify and update email. Please try again." },
      { status: 500 }
    );
  }
}


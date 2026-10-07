import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "@/lib/auth-otp";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const demoEmail = "pm.reviewer@court.ae";
    const demoName = "Alexander David Croft";

    // 1. Upsert demo account
    let account = await prisma.account.findUnique({
      where: { email: demoEmail },
    });

    if (!account) {
      account = await prisma.account.create({
        data: {
          email: demoEmail,
          fullName: demoName,
          phoneNumber: "+971 50 123 4567",
        },
      });
    }

    // 2. Check if Application exists for this account
    let app = await prisma.application.findFirst({
      where: { accountId: account.id },
      include: { wills: true },
    });

    if (!app) {
      app = await prisma.application.create({
        data: {
          accountId: account.id,
          packageType: "COUPLES",
          status: "AWAITING_ADMIN_VERIFICATION",
        },
        include: { wills: true },
      });
    }

    // Set auth cookie
    cookies().set({
      name: SESSION_COOKIE_NAME,
      value: JSON.stringify({
        accountId: account.id,
        email: account.email,
        fullName: account.fullName,
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      account,
      applicationId: app.id,
    });
  } catch (err: any) {
    console.error("[POST /api/auth/demo error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

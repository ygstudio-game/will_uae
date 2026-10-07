import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";

// GET /api/wills - List wills for active session
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    const whereClause: any = {};
    if (session) {
      whereClause.application = { accountId: session.accountId };
    }

    const wills = await prisma.will.findMany({
      where: whereClause,
      include: {
        application: true,
        testatorPerson: true,
        roleAssignments: { include: { person: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedWills = wills.map((w) => ({
      id: w.id,
      willNumber: w.willIndex,
      versionTag: w.versionTag,
      fullName: w.testatorPerson?.fullName || "Untitled Will Draft",
      arabicName: w.testatorPerson?.arabicName,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      packageType: w.application.packageType,
      status: w.application.status,
    }));

    return NextResponse.json({
      success: true,
      wills: formattedWills,
    });
  } catch (error) {
    console.error("Fetch wills error:", error);
    return NextResponse.json({ error: "Failed to fetch wills" }, { status: 500 });
  }
}

// POST /api/wills - Create a new will
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json().catch(() => ({}));

    // Find or create application
    let app = session
      ? await prisma.application.findFirst({
          where: { accountId: session.accountId },
        })
      : null;

    if (!app) {
      let targetAccountId = session?.accountId;
      if (!targetAccountId) {
        const createdAccount = await prisma.account.create({
          data: {
            email: `client-${Date.now()}@uae-court.ae`,
            fullName: "Prospective Testator",
          },
        });
        targetAccountId = createdAccount.id;
      }

      app = await prisma.application.create({
        data: {
          accountId: targetAccountId,
          packageType: body.packageType || "INDIVIDUAL",
          status: "IN_PROGRESS",
        },
      });
    }

    const will = await prisma.will.create({
      data: {
        applicationId: app.id,
        willIndex: 1,
        versionTag: "ADJD-NM0723-07-03",
        domicileCountry: "United Kingdom",
      },
    });

    return NextResponse.json({
      success: true,
      will,
    });
  } catch (error) {
    console.error("Create will error:", error);
    return NextResponse.json({ error: "Failed to create will" }, { status: 500 });
  }
}

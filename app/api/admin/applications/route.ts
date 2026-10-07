import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") as ApplicationStatus | null;
    const search = searchParams.get("q") || "";

    const whereClause: any = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    }
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { account: { email: { contains: search, mode: "insensitive" } } },
        { account: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        account: true,
        wills: {
          include: { testatorPerson: true },
        },
        payments: true,
        reviewFlags: true,
        tickets: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Compute status metrics across all applications
    const allApps = await prisma.application.findMany({
      select: { status: true },
    });

    const counts: Record<string, number> = {
      TOTAL: allApps.length,
      IN_PROGRESS: 0,
      DRAFT_READY: 0,
      COURT_FEE_PENDING: 0,
      AWAITING_ADMIN_VERIFICATION: 0,
      UNDER_ADMIN_REVIEW: 0,
      ACTION_REQUIRED: 0,
      READY_FOR_SUBMISSION: 0,
      SUBMITTED_TO_ADJD: 0,
      REGISTRATION_COMPLETED: 0,
    };

    allApps.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++;
      }
    });

    return NextResponse.json({
      success: true,
      applications,
      counts,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/applications error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

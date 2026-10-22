import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";

export const dynamic = "force-dynamic";

const FULL_APP_INCLUDE = {
  account: true,
  persons: {
    include: { documents: true },
    orderBy: { createdAt: "asc" as const },
  },
  wills: {
    include: {
      testatorPerson: {
        include: { documents: true },
      },
      roleAssignments: {
        include: {
          person: {
            include: { documents: true },
          },
        },
        orderBy: { appointmentOrder: "asc" as const },
      },
    },
    orderBy: { willIndex: "asc" as const },
  },
  payments: {
    orderBy: { createdAt: "desc" as const },
  },
  tickets: {
    include: { replies: true },
    orderBy: { createdAt: "desc" as const },
  },
  reviewFlags: true,
};

// GET /api/applications/current - Get or auto-provision the active DB application for logged-in account
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    let application = await prisma.application.findFirst({
      where: { accountId: session.accountId },
      include: FULL_APP_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });

    if (!application) {
      // Create initial application in DB linked to this account
      const createdApp = await prisma.application.create({
        data: {
          accountId: session.accountId,
          packageType: "INDIVIDUAL",
          status: "IN_PROGRESS",
        },
      });

      const testatorPerson = await prisma.person.create({
        data: {
          applicationId: createdApp.id,
          fullName: session.name || "",
          relationship: "Self",
          nationality: "British",
          isUaeResident: true,
        },
      });

      await prisma.will.create({
        data: {
          applicationId: createdApp.id,
          willIndex: 1,
          versionTag: "ADJD-NM0723-07-03",
          testatorPersonId: testatorPerson.id,
          domicileCountry: "United Kingdom",
        },
      });

      application = await prisma.application.findUnique({
        where: { id: createdApp.id },
        include: FULL_APP_INCLUDE,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      application,
    });
  } catch (err: any) {
    console.error("[GET /api/applications/current error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/applications/current - Sync local draft into the DB application
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { localApp } = body;

    let dbApp = await prisma.application.findFirst({
      where: { accountId: session.accountId },
      include: FULL_APP_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });

    if (!dbApp) {
      dbApp = await prisma.application.create({
        data: {
          accountId: session.accountId,
          packageType: localApp?.packageType || "INDIVIDUAL",
          status: "IN_PROGRESS",
        },
        include: FULL_APP_INCLUDE,
      });
    }

    const appId = dbApp.id;

    // If localApp has persons, upsert them into DB
    if (localApp?.persons && Array.isArray(localApp.persons)) {
      for (const p of localApp.persons) {
        if (!p.fullName?.trim()) continue;

        const existingP = await prisma.person.findFirst({
          where: {
            applicationId: appId,
            OR: [
              { id: p.id },
              { fullName: p.fullName.trim() }
            ]
          }
        });

        if (existingP) {
          await prisma.person.update({
            where: { id: existingP.id },
            data: {
              fullName: p.fullName.trim(),
              arabicName: p.arabicName?.trim() || null,
              isArabicApproved: Boolean(p.isArabicApproved),
              dob: p.dob ? new Date(p.dob) : null,
              nationality: p.nationality?.trim() || null,
              relationship: p.relationship?.trim() || null,
              passportNumber: p.passportNumber?.trim() || null,
              emiratesId: p.emiratesId?.trim() || null,
              isUaeResident: p.isUaeResident ?? true,
              address: p.address?.trim() || null,
              email: p.email?.trim() || null,
              phone: p.phone?.trim() || null,
            }
          });
        } else {
          await prisma.person.create({
            data: {
              applicationId: appId,
              fullName: p.fullName.trim(),
              arabicName: p.arabicName?.trim() || null,
              isArabicApproved: Boolean(p.isArabicApproved),
              dob: p.dob ? new Date(p.dob) : null,
              nationality: p.nationality?.trim() || null,
              relationship: p.relationship?.trim() || null,
              passportNumber: p.passportNumber?.trim() || null,
              emiratesId: p.emiratesId?.trim() || null,
              isUaeResident: p.isUaeResident ?? true,
              address: p.address?.trim() || null,
              email: p.email?.trim() || null,
              phone: p.phone?.trim() || null,
            }
          });
        }
      }
    }

    // Refetch latest synced application from DB
    const updatedApplication = await prisma.application.findUnique({
      where: { id: appId },
      include: FULL_APP_INCLUDE,
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      application: updatedApplication,
    });
  } catch (err: any) {
    console.error("[POST /api/applications/current error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

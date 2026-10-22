import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";

export const dynamic = "force-dynamic";

// GET /api/applications/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        account: true,
        persons: {
          include: { documents: true },
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
              orderBy: { appointmentOrder: "asc" },
            },
          },
          orderBy: { willIndex: "asc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        tickets: {
          include: { replies: true },
          orderBy: { createdAt: "desc" },
        },
        reviewFlags: true,
      },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch (err: any) {
    console.error("[GET /api/applications/[id] error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/applications/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { willId, roleAssignments, domicileCountry, isDraftConfirmed, status } = body;

    // Check if application is locked due to court payment
    const currentApp = await prisma.application.findUnique({
      where: { id: params.id },
      select: { status: true },
    });

    const isLocked =
      currentApp?.status &&
      [
        "AWAITING_ADMIN_VERIFICATION",
        "UNDER_ADMIN_REVIEW",
        "READY_FOR_SUBMISSION",
        "SUBMITTED_TO_ADJD",
        "REGISTRATION_COMPLETED",
      ].includes(currentApp.status);

    if (isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: "Questionnaire editing is locked after court-fee payment. Please use support tickets to request changes.",
        },
        { status: 403 }
      );
    }

    // Update Will if willId provided
    if (willId) {
      // Invalidate earlier confirmation if data is edited
      const updateData: any = {};
      if (domicileCountry !== undefined) updateData.domicileCountry = domicileCountry;
      if (isDraftConfirmed !== undefined) {
        updateData.isDraftConfirmed = isDraftConfirmed;
        updateData.confirmedAt = isDraftConfirmed ? new Date() : null;
      }

      // Find the will: check by ID or find the will belonging to this application
      let targetWill = await prisma.will.findUnique({
        where: { id: willId },
      });

      if (!targetWill) {
        targetWill = await prisma.will.findFirst({
          where: { applicationId: params.id },
        });
      }

      if (!targetWill) {
        targetWill = await prisma.will.create({
          data: {
            applicationId: params.id,
            willIndex: 1,
            versionTag: "ADJD-NM0723-07-03",
            domicileCountry: domicileCountry || "United Kingdom",
            isDraftConfirmed: isDraftConfirmed || false,
          },
        });
      } else {
        await prisma.will.update({
          where: { id: targetWill.id },
          data: updateData,
        });
      }

      const effectiveWillId = targetWill.id;

      // Update role assignments if provided
      if (Array.isArray(roleAssignments)) {
        await prisma.roleAssignment.deleteMany({
          where: { willId: effectiveWillId },
        });

        for (const ra of roleAssignments) {
          if (ra.personId && ra.role) {
            const personExists = await prisma.person.findUnique({
              where: { id: ra.personId },
            });
            if (personExists) {
              await prisma.roleAssignment.create({
                data: {
                  willId: effectiveWillId,
                  personId: ra.personId,
                  role: ra.role,
                  appointmentOrder: ra.appointmentOrder || 1,
                  sharePercentage:
                    ra.sharePercentage !== null && ra.sharePercentage !== undefined
                      ? Number(ra.sharePercentage)
                      : null,
                },
              });
            }
          }
        }
      }
    }

    // Update application status if provided
    if (status) {
      await prisma.application.update({
        where: { id: params.id },
        data: { status },
      });
    }

    return NextResponse.json({ success: true, message: "Application updated successfully" });
  } catch (err: any) {
    console.error("[PATCH /api/applications/[id] error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

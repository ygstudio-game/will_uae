import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        account: true,
        persons: {
          include: { documents: true },
        },
        wills: {
          include: {
            testatorPerson: { include: { documents: true } },
            roleAssignments: {
              include: { person: { include: { documents: true } } },
              orderBy: { appointmentOrder: "asc" },
            },
            generatedDrafts: { orderBy: { versionNum: "desc" } },
          },
          orderBy: { willIndex: "asc" },
        },
        payments: { orderBy: { createdAt: "desc" } },
        tickets: {
          include: { replies: { orderBy: { createdAt: "asc" } } },
          orderBy: { createdAt: "desc" },
        },
        reviewFlags: { orderBy: { createdAt: "desc" } },
        auditEvents: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application });
  } catch (err: any) {
    console.error("[GET /api/admin/applications/[id] error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      status,
      resolveFlagId,
      resolutionNotes,
      addFlag,
      draftCorrection,
      adminEmail = "admin@adjd-legal.ae",
    } = body;

    const application = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    // 1. Advance or modify 9-stage pipeline status
    if (status && status !== application.status) {
      await prisma.application.update({
        where: { id: params.id },
        data: { status },
      });

      await prisma.auditEvent.create({
        data: {
          applicationId: params.id,
          actor: adminEmail,
          action: "STATUS_CHANGE",
          details: {
            previousStatus: application.status,
            newStatus: status,
            notes: `Admin transitioned stage from ${application.status} to ${status}.`,
          },
        },
      });
    }

    // 2. Resolve an AI/Legal Verification Flag
    if (resolveFlagId) {
      await prisma.reviewFlag.update({
        where: { id: resolveFlagId },
        data: {
          isResolved: true,
          resolvedBy: adminEmail,
          resolutionNotes: resolutionNotes || "Verified and approved by legal administrator.",
        },
      });

      await prisma.auditEvent.create({
        data: {
          applicationId: params.id,
          actor: adminEmail,
          action: "FLAG_RESOLVED",
          details: {
            flagId: resolveFlagId,
            resolutionNotes,
          },
        },
      });
    }

    // 3. Add a new manual review flag
    if (addFlag) {
      await prisma.reviewFlag.create({
        data: {
          applicationId: params.id,
          fieldPath: addFlag.fieldPath || "general",
          severity: addFlag.severity || "WARNING",
          message: addFlag.message,
        },
      });

      await prisma.auditEvent.create({
        data: {
          applicationId: params.id,
          actor: adminEmail,
          action: "FLAG_ADDED",
          details: addFlag,
        },
      });
    }

    // 4. Admin Direct Draft Correction
    if (draftCorrection && draftCorrection.personId) {
      await prisma.person.update({
        where: { id: draftCorrection.personId },
        data: {
          fullName: draftCorrection.fullName,
          arabicName: draftCorrection.arabicName,
          passportNumber: draftCorrection.passportNumber,
          isArabicApproved: true,
        },
      });

      await prisma.auditEvent.create({
        data: {
          applicationId: params.id,
          actor: adminEmail,
          action: "DRAFT_CORRECTION",
          details: draftCorrection,
        },
      });
    }

    // Return fresh updated application
    const updated = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        account: true,
        persons: { include: { documents: true } },
        wills: {
          include: {
            testatorPerson: true,
            roleAssignments: { include: { person: true } },
          },
        },
        reviewFlags: true,
        auditEvents: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
      application: updated,
    });
  } catch (err: any) {
    console.error("[PATCH /api/admin/applications/[id] error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

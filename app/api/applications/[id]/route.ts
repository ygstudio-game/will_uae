import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";
import { normalizeRoleType } from "@/lib/roles";

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
      include: FULL_APP_INCLUDE,
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
    const {
      willId,
      domicileCountry,
      hasChildrenUnder18,
      childrenAnswered,
      isDraftConfirmed,
      testatorPerson,
      persons,
      roleAssignments,
      status,
    } = body;

    // Check if application is locked due to court payment
    const currentApp = await prisma.application.findUnique({
      where: { id: params.id },
      include: { wills: true, persons: true },
    });

    if (!currentApp) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    const isLocked =
      currentApp.status &&
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

    const idMapping: Record<string, string> = {};
    let targetTestatorId = currentApp.wills[0]?.testatorPersonId || null;

    // 1. Upsert Testator Person
    if (testatorPerson && testatorPerson.fullName?.trim()) {
      let existingTestator = targetTestatorId
        ? await prisma.person.findUnique({ where: { id: targetTestatorId } })
        : await prisma.person.findFirst({
            where: { applicationId: params.id, relationship: "Self" },
          });

      if (!existingTestator) {
        existingTestator = await prisma.person.findFirst({
          where: { applicationId: params.id, fullName: testatorPerson.fullName.trim() },
        });
      }

      if (existingTestator) {
        const updated = await prisma.person.update({
          where: { id: existingTestator.id },
          data: {
            fullName: testatorPerson.fullName.trim(),
            arabicName: testatorPerson.arabicName?.trim() || null,
            isArabicApproved: Boolean(testatorPerson.isArabicApproved),
            dob: testatorPerson.dob ? new Date(testatorPerson.dob) : null,
            nationality: testatorPerson.nationality?.trim() || null,
            passportNumber: testatorPerson.passportNumber?.trim() || null,
            emiratesId: testatorPerson.emiratesId?.trim() || null,
            isUaeResident: testatorPerson.isUaeResident ?? true,
            address: testatorPerson.address?.trim() || null,
            email: testatorPerson.email?.trim() || null,
            phone: testatorPerson.phone?.trim() || null,
          },
        });
        targetTestatorId = updated.id;
        if (testatorPerson.id) idMapping[testatorPerson.id] = updated.id;
      } else {
        const created = await prisma.person.create({
          data: {
            applicationId: params.id,
            fullName: testatorPerson.fullName.trim(),
            arabicName: testatorPerson.arabicName?.trim() || null,
            isArabicApproved: Boolean(testatorPerson.isArabicApproved),
            dob: testatorPerson.dob ? new Date(testatorPerson.dob) : null,
            nationality: testatorPerson.nationality?.trim() || null,
            relationship: "Self",
            passportNumber: testatorPerson.passportNumber?.trim() || null,
            emiratesId: testatorPerson.emiratesId?.trim() || null,
            isUaeResident: testatorPerson.isUaeResident ?? true,
            address: testatorPerson.address?.trim() || null,
            email: testatorPerson.email?.trim() || null,
            phone: testatorPerson.phone?.trim() || null,
          },
        });
        targetTestatorId = created.id;
        if (testatorPerson.id) idMapping[testatorPerson.id] = created.id;
      }
    }

    // 2. Upsert other Persons
    if (Array.isArray(persons)) {
      for (const p of persons) {
        if (!p.fullName?.trim()) continue;
        if (p.id && (p.id === testatorPerson?.id || idMapping[p.id])) continue;
        if (targetTestatorId && p.id === targetTestatorId) continue;

        let existing = null;
        if (p.id && !p.id.startsWith("draft-") && !p.id.startsWith("person-")) {
          existing = await prisma.person.findUnique({ where: { id: p.id } });
        }
        if (!existing) {
          existing = await prisma.person.findFirst({
            where: { applicationId: params.id, fullName: p.fullName.trim() },
          });
        }

        if (existing) {
          const updated = await prisma.person.update({
            where: { id: existing.id },
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
            },
          });
          if (p.id) idMapping[p.id] = updated.id;
        } else {
          const created = await prisma.person.create({
            data: {
              applicationId: params.id,
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
            },
          });
          if (p.id) idMapping[p.id] = created.id;
        }
      }
    }

    // 3. Find or Create Will
    let targetWill = willId
      ? await prisma.will.findUnique({ where: { id: willId } })
      : null;

    if (!targetWill) {
      targetWill = await prisma.will.findFirst({
        where: { applicationId: params.id },
      });
    }

    const willUpdateData: any = {};
    if (domicileCountry !== undefined) willUpdateData.domicileCountry = domicileCountry;
    if (hasChildrenUnder18 !== undefined) willUpdateData.hasChildrenUnder18 = Boolean(hasChildrenUnder18);
    if (isDraftConfirmed !== undefined) {
      willUpdateData.isDraftConfirmed = Boolean(isDraftConfirmed);
      willUpdateData.confirmedAt = isDraftConfirmed ? new Date() : null;
    }
    if (targetTestatorId) {
      willUpdateData.testatorPersonId = targetTestatorId;
    }

    if (!targetWill) {
      targetWill = await prisma.will.create({
        data: {
          applicationId: params.id,
          willIndex: 1,
          versionTag: "ADJD-NM0723-07-03",
          domicileCountry: domicileCountry || "United Kingdom",
          hasChildrenUnder18: Boolean(hasChildrenUnder18),
          isDraftConfirmed: Boolean(isDraftConfirmed),
          testatorPersonId: targetTestatorId,
        },
      });
    } else {
      targetWill = await prisma.will.update({
        where: { id: targetWill.id },
        data: willUpdateData,
      });
    }

    const effectiveWillId = targetWill.id;

    // 4. Update Role Assignments
    if (Array.isArray(roleAssignments) && roleAssignments.length > 0) {
      await prisma.roleAssignment.deleteMany({
        where: { willId: effectiveWillId },
      });

      for (const ra of roleAssignments) {
        const resolvedPersonId = idMapping[ra.personId] || ra.personId;
        const normalizedRole = normalizeRoleType(ra.role);
        if (resolvedPersonId && normalizedRole) {
          const personExists = await prisma.person.findUnique({
            where: { id: resolvedPersonId },
          });
          if (personExists) {
            await prisma.roleAssignment.create({
              data: {
                willId: effectiveWillId,
                personId: resolvedPersonId,
                role: normalizedRole,
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
    } else if (body.clearRoleAssignments === true) {
      await prisma.roleAssignment.deleteMany({
        where: { willId: effectiveWillId },
      });
    }

    // 5. Update application status if provided
    if (status) {
      await prisma.application.update({
        where: { id: params.id },
        data: { status },
      });
    }

    // Return the updated application with all relations
    const updatedApplication = await prisma.application.findUnique({
      where: { id: params.id },
      include: FULL_APP_INCLUDE,
    });

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
      application: updatedApplication,
    });
  } catch (err: any) {
    console.error("[PATCH /api/applications/[id] error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

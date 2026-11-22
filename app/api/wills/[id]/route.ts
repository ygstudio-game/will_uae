import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/wills/[id] - Fetch full will with all relations from OWA schema
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    const adminSession = await getAdminSession(req);
    if (!session && !adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const will = await prisma.will.findUnique({
      where: { id: params.id },
      include: {
        application: {
          include: { account: true },
        },
        testatorPerson: {
          include: { documents: true },
        },
        roleAssignments: {
          include: { person: { include: { documents: true } } },
          orderBy: { appointmentOrder: "asc" },
        },
      },
    });

    if (!will) {
      return NextResponse.json({ error: "Will not found" }, { status: 404 });
    }

    // RBAC: Verify ownership (or verified administrator)
    if (!adminSession && session && will.application.accountId !== session.accountId) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view this will." },
        { status: 403 }
      );
    }

    const testator = will.testatorPerson;
    const parties = will.roleAssignments
      .filter((ra) => ra.role !== "CHILD")
      .map((ra) => ({
        id: ra.id,
        partyType: ra.role,
        fullName: ra.person.fullName,
        arabicName: ra.person.arabicName,
        relationship: ra.person.relationship,
        nationality: ra.person.nationality,
        passportNumber: ra.person.passportNumber,
        emiratesId: ra.person.emiratesId,
        residentialAddress: ra.person.address,
        sharePercentage: ra.sharePercentage,
      }));

    const children = will.roleAssignments
      .filter((ra) => ra.role === "CHILD")
      .map((ra) => ({
        id: ra.id,
        fullName: ra.person.fullName,
        arabicName: ra.person.arabicName,
        gender: ra.person.relationship === "Daughter" ? "FEMALE" : "MALE",
        dob: ra.person.dob,
        passportNumber: ra.person.passportNumber,
        nationality: ra.person.nationality,
      }));

    return NextResponse.json({
      success: true,
      will: {
        id: will.id,
        willNumber: will.willIndex,
        versionTag: will.versionTag,
        fullName: testator?.fullName,
        arabicName: testator?.arabicName,
        dob: testator?.dob,
        nationality: testator?.nationality,
        passportNumber: testator?.passportNumber,
        emiratesId: testator?.emiratesId,
        residentialAddress: testator?.address,
        emailAddress: testator?.email,
        contactNumber: testator?.phone,
        domicileCountry: will.domicileCountry,
        signatureDataUrl:
          testator?.documents?.find((d) => d.fileName?.includes("signature"))?.fileUrl ||
          (testator?.documents?.[0]?.extractedData as any)?.signatureDataUrl ||
          null,
        parties,
        children,
      },
    });
  } catch (error) {
    console.error("Get will error:", error);
    return NextResponse.json({ error: "Failed to fetch will" }, { status: 500 });
  }
}

// PATCH /api/wills/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    const adminSession = await getAdminSession(req);
    if (!session && !adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentWill = await prisma.will.findUnique({
      where: { id: params.id },
      include: { application: true },
    });

    if (!currentWill) {
      return NextResponse.json({ error: "Will not found" }, { status: 404 });
    }

    // RBAC: Verify ownership (or verified administrator)
    if (!adminSession && session && currentWill.application.accountId !== session.accountId) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to update this will." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { domicileCountry, isDraftConfirmed } = body;

    const will = await prisma.will.update({
      where: { id: params.id },
      data: {
        domicileCountry,
        isDraftConfirmed,
      },
    });

    return NextResponse.json({ success: true, will });
  } catch (error) {
    console.error("Patch will error:", error);
    return NextResponse.json({ error: "Failed to update will" }, { status: 500 });
  }
}

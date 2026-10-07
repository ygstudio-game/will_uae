import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { PartyType, WillStatus } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/wills/[id] - Fetch full will with all relations
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const will = await prisma.will.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        parties: { orderBy: { createdAt: "asc" } },
        children: { orderBy: { createdAt: "asc" } },
        assets: { orderBy: { createdAt: "asc" } },
        documents: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!will) {
      return NextResponse.json({ error: "Will not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      will,
    });
  } catch (error) {
    console.error("Get will error:", error);
    return NextResponse.json({ error: "Failed to fetch will" }, { status: 500 });
  }
}

// PATCH /api/wills/[id] - Save step data & sync relational records
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const will = await prisma.will.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!will) {
      return NextResponse.json({ error: "Will not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      currentStep,
      status,
      testator,
      confirmations,
      parties,
      children,
      assets,
      willType,
    } = body;

    // 1. Prepare Will scalar updates
    const updateData: any = {};

    if (typeof currentStep === "number") {
      updateData.currentStep = Math.max(will.currentStep, currentStep);
    }

    if (status && Object.values(WillStatus).includes(status)) {
      updateData.status = status;
    }

    if (willType) {
      updateData.willType = willType;
    }

    if (testator) {
      if (testator.fullName !== undefined) updateData.fullName = testator.fullName;
      if (testator.arabicName !== undefined) updateData.arabicName = testator.arabicName;
      if (testator.dob) updateData.dob = new Date(testator.dob);
      if (testator.nationality !== undefined) updateData.nationality = testator.nationality;
      if (testator.passportNumber !== undefined) updateData.passportNumber = testator.passportNumber;
      if (testator.emiratesId !== undefined) updateData.emiratesId = testator.emiratesId;
      if (testator.isUaeResident !== undefined) updateData.isUaeResident = testator.isUaeResident;
      if (testator.residentialAddress !== undefined) updateData.residentialAddress = testator.residentialAddress;
      if (testator.emailAddress !== undefined) updateData.emailAddress = testator.emailAddress;
      if (testator.contactNumber !== undefined) updateData.contactNumber = testator.contactNumber;
      if (testator.domicileCountry !== undefined) updateData.domicileCountry = testator.domicileCountry;
      if (testator.hasChildren !== undefined) updateData.hasChildren = testator.hasChildren;
      if (testator.hasTitledAssets !== undefined) updateData.hasTitledAssets = testator.hasTitledAssets;
    }

    if (confirmations) {
      if (confirmations.declarationConfirmed !== undefined) updateData.declarationConfirmed = confirmations.declarationConfirmed;
      if (confirmations.debtsConfirmed !== undefined) updateData.debtsConfirmed = confirmations.debtsConfirmed;
      if (confirmations.wishesConfirmed !== undefined) updateData.wishesConfirmed = confirmations.wishesConfirmed;
      if (confirmations.jurisdictionConfirmed !== undefined) updateData.jurisdictionConfirmed = confirmations.jurisdictionConfirmed;
      if (confirmations.insuranceConfirmed !== undefined) updateData.insuranceConfirmed = confirmations.insuranceConfirmed;
      if (confirmations.powersConfirmed !== undefined) updateData.powersConfirmed = confirmations.powersConfirmed;
      if (confirmations.executionConfirmed !== undefined) updateData.executionConfirmed = confirmations.executionConfirmed;
    }

    // 2. Perform updates in a Prisma transaction if relational records are present
    await prisma.$transaction(async (tx) => {
      // Update core Will record
      if (Object.keys(updateData).length > 0) {
        await tx.will.update({
          where: { id: params.id },
          data: updateData,
        });
      }

      // Sync Parties if array supplied
      if (Array.isArray(parties)) {
        await tx.party.deleteMany({ where: { willId: params.id } });
        if (parties.length > 0) {
          await tx.party.createMany({
            data: parties.map((p: any) => ({
              willId: params.id,
              partyType: p.role || p.partyType || PartyType.PRIMARY_EXECUTOR,
              fullName: p.fullName || "",
              arabicName: p.arabicName || null,
              isArabicApproved: p.isArabicApproved || false,
              dob: p.dob ? new Date(p.dob) : null,
              nationality: p.nationality || null,
              passportNumber: p.passportNumber || null,
              emiratesId: p.emiratesId || null,
              isUaeResident: p.isUaeResident || false,
              address: p.address || p.residentialAddress || null,
              email: p.email || p.emailAddress || null,
              phone: p.phone || p.contactNumber || null,
              sharePercentage: typeof p.sharePercentage === "number" ? p.sharePercentage : null,
            })),
          });
        }
      }

      // Sync Children if array supplied
      if (Array.isArray(children)) {
        await tx.child.deleteMany({ where: { willId: params.id } });
        if (children.length > 0) {
          await tx.child.createMany({
            data: children.map((c: any) => ({
              willId: params.id,
              fullName: c.fullName || "",
              arabicName: c.arabicName || null,
              dob: c.dob ? new Date(c.dob) : null,
              nationality: c.nationality || null,
              passportNumber: c.passportNumber || null,
            })),
          });
        }
      }

      // Sync Assets if array supplied
      if (Array.isArray(assets)) {
        await tx.asset.deleteMany({ where: { willId: params.id } });
        if (assets.length > 0) {
          await tx.asset.createMany({
            data: assets.map((a: any) => ({
              willId: params.id,
              assetType: a.assetType || "Immovable Property",
              description: a.description || a.titleDescription || "",
              emirate: a.emirate || "Dubai",
              titleDeedNumber: a.titleDeedNumber || a.assetIdentifier || null,
            })),
          });
        }
      }
    });

    const updatedWill = await prisma.will.findUnique({
      where: { id: params.id },
      include: {
        parties: true,
        children: true,
        assets: true,
      },
    });

    return NextResponse.json({
      success: true,
      will: updatedWill,
    });
  } catch (error) {
    console.error("Patch will error:", error);
    return NextResponse.json({ error: "Failed to update will" }, { status: 500 });
  }
}

// DELETE /api/wills/[id] - Permanently delete will draft
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const will = await prisma.will.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!will) {
      return NextResponse.json({ error: "Will not found" }, { status: 404 });
    }

    await prisma.will.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Will draft deleted" });
  } catch (error) {
    console.error("Delete will error:", error);
    return NextResponse.json({ error: "Failed to delete will" }, { status: 500 });
  }
}

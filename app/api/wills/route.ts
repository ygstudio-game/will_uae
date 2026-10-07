import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { WillStatus, WillType } from "@prisma/client";

// GET /api/wills - List user's wills
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wills = await prisma.will.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            parties: true,
            children: true,
            assets: true,
            documents: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedWills = wills.map((w) => ({
      id: w.id,
      willNumber: w.willNumber,
      status: w.status,
      currentStep: w.currentStep,
      willType: w.willType,
      fullName: w.fullName || "Untitled Will Draft",
      arabicName: w.arabicName,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      counts: w._count,
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

// POST /api/wills - Create a new will draft
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedType = body.willType === "MIRROR" ? WillType.MIRROR : WillType.INDIVIDUAL;

    const will = await prisma.will.create({
      data: {
        userId: user.id,
        willType: requestedType,
        status: WillStatus.DRAFT,
        currentStep: 1,
        fullName: user.name || "",
        emailAddress: user.email,
        isUaeResident: true,
      },
      select: {
        id: true,
        willNumber: true,
        willType: true,
        currentStep: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      will,
    });
  } catch (error) {
    console.error("Create will error:", error);
    return NextResponse.json({ error: "Failed to create will draft" }, { status: 500 });
  }
}

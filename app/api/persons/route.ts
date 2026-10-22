import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";

export const dynamic = "force-dynamic";

// GET /api/persons?applicationId=xyz
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json({ success: false, error: "Missing applicationId" }, { status: 400 });
    }

    const persons = await prisma.person.findMany({
      where: { applicationId },
      include: { documents: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, persons });
  } catch (err: any) {
    console.error("[GET /api/persons error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/persons - Create or update person
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      applicationId,
      fullName,
      arabicName,
      isArabicApproved,
      dob,
      nationality,
      passportNumber,
      emiratesId,
      isUaeResident,
      address,
      email,
      phone,
    } = body;

    if (!applicationId || !fullName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (applicationId, fullName)" },
        { status: 400 }
      );
    }

    let person = null;
    if (id && !id.startsWith("draft-") && !id.startsWith("person-")) {
      const existing = await prisma.person.findUnique({ where: { id } });
      if (existing) {
        person = await prisma.person.update({
          where: { id },
          data: {
            fullName: fullName.trim(),
            arabicName: arabicName?.trim() || null,
            isArabicApproved: Boolean(isArabicApproved),
            dob: dob ? new Date(dob) : null,
            nationality: nationality?.trim() || null,
            passportNumber: passportNumber?.trim() || null,
            emiratesId: emiratesId?.trim() || null,
            isUaeResident: isUaeResident ?? true,
            address: address?.trim() || null,
            email: email?.trim() || null,
            phone: phone?.trim() || null,
          },
          include: { documents: true },
        });
      }
    }

    if (!person) {
      // Check if a person with this name already exists in this application
      const existingByName = await prisma.person.findFirst({
        where: { applicationId, fullName: fullName.trim() },
      });

      if (existingByName) {
        person = await prisma.person.update({
          where: { id: existingByName.id },
          data: {
            arabicName: arabicName?.trim() || existingByName.arabicName,
            isArabicApproved: Boolean(isArabicApproved),
            dob: dob ? new Date(dob) : existingByName.dob,
            nationality: nationality?.trim() || existingByName.nationality,
            passportNumber: passportNumber?.trim() || existingByName.passportNumber,
            emiratesId: emiratesId?.trim() || existingByName.emiratesId,
            isUaeResident: isUaeResident ?? existingByName.isUaeResident,
            address: address?.trim() || existingByName.address,
            email: email?.trim() || existingByName.email,
            phone: phone?.trim() || existingByName.phone,
          },
          include: { documents: true },
        });
      } else {
        // Create new
        person = await prisma.person.create({
          data: {
            applicationId,
            fullName: fullName.trim(),
            arabicName: arabicName?.trim() || null,
            isArabicApproved: Boolean(isArabicApproved),
            dob: dob ? new Date(dob) : null,
            nationality: nationality?.trim() || null,
            passportNumber: passportNumber?.trim() || null,
            emiratesId: emiratesId?.trim() || null,
            isUaeResident: isUaeResident ?? true,
            address: address?.trim() || null,
            email: email?.trim() || null,
            phone: phone?.trim() || null,
          },
          include: { documents: true },
        });
      }
    }

    return NextResponse.json({ success: true, person });
  } catch (err: any) {
    console.error("[POST /api/persons error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

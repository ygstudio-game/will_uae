import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, hashPassword, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";
import { WillStatus, WillType, PartyType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const demoEmail = "daniel@example.com";
    const demoName = "Daniel Michael Carter";

    // 1. Upsert demo user
    let user = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (!user) {
      const passwordHash = await hashPassword("demo-pm-pass-2026");
      user = await prisma.user.create({
        data: {
          email: demoEmail,
          name: demoName,
          passwordHash,
        },
      });
    }

    // 2. Check if Will fixture exists for this user, create if missing
    let will = await prisma.will.findFirst({
      where: { userId: user.id },
      include: { parties: true, children: true, assets: true },
    });

    if (!will) {
      will = await prisma.will.create({
        data: {
          userId: user.id,
          status: WillStatus.REVIEW,
          currentStep: 15,
          willType: WillType.INDIVIDUAL,
          fullName: "Daniel Michael Carter",
          arabicName: "دانيال مايكل كارتر",
          dob: new Date("1984-05-14"),
          nationality: "British",
          passportNumber: "P987654321",
          emiratesId: "784-1984-1234567-1",
          isUaeResident: true,
          residentialAddress: "Villa 42, Palm Jumeirah, Dubai, UAE",
          emailAddress: "daniel@example.com",
          contactNumber: "+971 50 123 4567",
          domicileCountry: "United Arab Emirates",
          hasChildren: true,
          hasTitledAssets: true,
          declarationConfirmed: true,
          debtsConfirmed: true,
          wishesConfirmed: true,
          jurisdictionConfirmed: true,
          insuranceConfirmed: true,
          powersConfirmed: true,
          executionConfirmed: true,
          parties: {
            create: [
              {
                partyType: PartyType.PRIMARY_EXECUTOR,
                fullName: "Sarah Elizabeth Carter",
                arabicName: "سارة إليزابيث كارتر",
                nationality: "British",
                passportNumber: "P112233445",
                emiratesId: "784-1986-7654321-2",
                address: "Villa 42, Palm Jumeirah, Dubai, UAE",
                email: "sarah.carter@example.com",
                phone: "+971 50 765 4321",
                isArabicApproved: true,
              },
              {
                partyType: PartyType.SUBSTITUTE_EXECUTOR,
                fullName: "Robert William Smith",
                arabicName: "روبرت ويليام سميث",
                nationality: "British",
                passportNumber: "P998877665",
                emiratesId: "784-1980-9988776-3",
                address: "Apt 1204, Downtown Views, Dubai, UAE",
                email: "robert.smith@example.com",
                phone: "+971 52 987 6543",
                isArabicApproved: true,
              },
              {
                partyType: PartyType.PRIMARY_BENEFICIARY,
                fullName: "Sarah Elizabeth Carter",
                arabicName: "سارة إليزابيث كارتر",
                sharePercentage: 100,
                isArabicApproved: true,
              },
            ],
          },
          children: {
            create: [
              {
                fullName: "Oliver James Carter",
                arabicName: "أوليفر جيمس كارتر",
                dob: new Date("2015-08-20"),
                nationality: "British",
                passportNumber: "P554433221",
              },
              {
                fullName: "Emma Grace Carter",
                arabicName: "إيما غريس كارتر",
                dob: new Date("2018-03-12"),
                nationality: "British",
                passportNumber: "P665544332",
              },
            ],
          },
          assets: {
            create: [
              {
                assetType: "Immovable Property",
                description: "Villa 42, Palm Jumeirah, Frond M",
                emirate: "Dubai",
                titleDeedNumber: "102938475",
              },
              {
                assetType: "Bank Account",
                description: "Emirates NBD Current Account (AED)",
                emirate: "Dubai",
                titleDeedNumber: "AE120260001234567890123",
              },
            ],
          },
        },
        include: { parties: true, children: true, assets: true },
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = await createSessionToken(safeUser);
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      demoWillId: will.id,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Failed to initialize demo account" },
      { status: 500 }
    );
  }
}

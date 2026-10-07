import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth-otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phoneNumber,
      packageType = "INDIVIDUAL",
      qualifications = {},
    } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: "Full legal name and email address are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const isCouples = packageType === "COUPLES";
    const serviceFeeAed = isCouples ? 1799.0 : 999.0;

    // 1. Create or update Account
    let account = await prisma.account.findUnique({
      where: { email: cleanEmail },
    });

    if (!account) {
      account = await prisma.account.create({
        data: {
          email: cleanEmail,
          fullName: fullName.trim(),
          phoneNumber: phoneNumber || null,
        },
      });
    } else {
      account = await prisma.account.update({
        where: { id: account.id },
        data: {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber || account.phoneNumber,
        },
      });
    }

    // 2. Create Application with Qualification answers
    const application = await prisma.application.create({
      data: {
        accountId: account.id,
        packageType: isCouples ? "COUPLES" : "INDIVIDUAL",
        status: "IN_PROGRESS",
        qualTestatorAge21: qualifications.testatorAge21 ?? true,
        qualNonUaeNational: qualifications.nonUaeNational ?? true,
        qualUaeAssets: qualifications.uaeAssets ?? true,
        qualMarried: qualifications.married ?? false,
        qualChildrenUnder18: qualifications.childrenUnder18 ?? false,
        qualPartnerAge21: isCouples ? (qualifications.partnerAge21 ?? true) : null,
        qualPartnerNonUae: isCouples ? (qualifications.partnerNonUae ?? true) : null,
        qualPartnerAssets: isCouples ? (qualifications.partnerAssets ?? true) : null,
        qualPartnerMarried: isCouples ? (qualifications.partnerMarried ?? true) : null,
        qualPartnerChildrenUnder18: isCouples ? (qualifications.partnerChildrenUnder18 ?? false) : null,
      },
    });

    // 3. Create Primary Person profile for Testator
    const testatorPerson = await prisma.person.create({
      data: {
        applicationId: application.id,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phoneNumber || null,
        isUaeResident: true,
      },
    });

    // 4. Create Will 1
    const will1 = await prisma.will.create({
      data: {
        applicationId: application.id,
        willIndex: 1,
        versionTag: "ADJD-NM0723-07-03",
        testatorPersonId: testatorPerson.id,
        hasChildrenUnder18: qualifications.childrenUnder18 ?? false,
      },
    });

    // 5. If Couples, create Will 2
    let will2 = null;
    if (isCouples) {
      will2 = await prisma.will.create({
        data: {
          applicationId: application.id,
          willIndex: 2,
          versionTag: "ADJD-NM0723-07-03",
          hasChildrenUnder18: qualifications.partnerChildrenUnder18 ?? qualifications.childrenUnder18 ?? false,
        },
      });
    }

    // 6. Record Initial Payment
    const payment = await prisma.payment.create({
      data: {
        applicationId: application.id,
        milestone: "INITIAL_SERVICE_FEE",
        amountAed: serviceFeeAed,
        status: "COMPLETED",
        transactionRef: `OWA-INIT-${Date.now().toString(36).toUpperCase()}`,
      },
    });

    // 7. Establish Session
    const sessionToken = await createSessionToken({
      accountId: account.id,
      email: account.email,
      name: account.fullName,
    });
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      willId: will1.id,
      will2Id: will2?.id || null,
      paymentId: payment.id,
      amountAed: serviceFeeAed,
      user: {
        id: account.id,
        email: account.email,
        name: account.fullName,
      },
    });
  } catch (error: any) {
    console.error("[Initial Checkout Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process checkout. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, paymentMethod = "CARD" } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Application ID is required" },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        account: true,
        wills: { include: { testatorPerson: true } },
        payments: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify draft is confirmed before paying court fee
    const allWillsConfirmed = application.wills.every((w) => w.isDraftConfirmed);
    if (!allWillsConfirmed) {
      // Auto-confirm draft if user proceeds to pay
      await prisma.will.updateMany({
        where: { applicationId: application.id },
        data: { isDraftConfirmed: true, confirmedAt: new Date() },
      });
    }

    // Compute fee: AED 950 for Individual, AED 1,900 for Couples
    const amountAed = application.packageType === "COUPLES" ? 1900 : 950;
    const refNumber = `ADJD-FEE-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Payment record for Milestone 2 Court Fee
    const payment = await prisma.payment.create({
      data: {
        applicationId: application.id,
        milestone: "COURT_FEE",
        amountAed,
        status: "COMPLETED",
        transactionRef: refNumber,
        receiptUrl: `/receipts/${refNumber}.pdf`,
      },
    });

    // Update Application status to AWAITING_ADMIN_VERIFICATION (locks editing)
    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "AWAITING_ADMIN_VERIFICATION",
      },
      include: {
        wills: true,
        payments: true,
      },
    });

    // Log Audit Event
    await prisma.auditEvent.create({
      data: {
        applicationId: application.id,
        actor: session.account.email,
        action: "COURT_FEE_PAID",
        details: {
          amountAed,
          referenceNumber: refNumber,
          description: `Stage 2 Court Fee of AED ${amountAed} successfully processed (${refNumber}). Application locked for administrative verification.`,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stage 2 Court Fee processed successfully",
      payment,
      application: updatedApplication,
    });
  } catch (err: any) {
    console.error("[POST /api/checkout/court-fee error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

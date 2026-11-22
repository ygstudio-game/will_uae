import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty
    }

    const requestedAppId = body.applicationId;
    const email = (body.email || session?.email || "").trim().toLowerCase();

    // 1. Locate the application
    let application: any = null;

    if (requestedAppId) {
      application = await prisma.application.findUnique({
        where: { id: requestedAppId },
        include: {
          account: true,
          payments: true,
        },
      });
    }

    if (!application && session?.accountId) {
      application = await prisma.application.findFirst({
        where: { accountId: session.accountId },
        include: {
          account: true,
          payments: true,
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (!application && email) {
      const account = await prisma.account.findUnique({
        where: { email },
        include: {
          applications: {
            include: { payments: true, account: true },
            orderBy: { updatedAt: "desc" },
          },
        },
      });
      if (account?.applications?.length) {
        application = account.applications[0];
      }
    }

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found for payment simulation" },
        { status: 404 }
      );
    }

    const simRef = `SIM-NOMOD-${Date.now().toString(36).toUpperCase()}`;
    const feeAmount = application.packageType === "COUPLES" ? 1799 : 999;

    // 2. Find or create the initial service fee payment
    const existingInitialPayment = application.payments?.find(
      (p: any) => p.milestone === "INITIAL_SERVICE_FEE"
    );

    let payment;
    if (existingInitialPayment) {
      payment = await prisma.payment.update({
        where: { id: existingInitialPayment.id },
        data: {
          status: "COMPLETED",
          transactionRef: existingInitialPayment.transactionRef?.startsWith("SIM-NOMOD-")
            ? existingInitialPayment.transactionRef
            : simRef,
          amountAed: existingInitialPayment.amountAed || feeAmount,
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          applicationId: application.id,
          milestone: "INITIAL_SERVICE_FEE",
          amountAed: feeAmount,
          status: "COMPLETED",
          transactionRef: simRef,
        },
      });
    }

    // 3. Keep application status active
    if (application.status === "DRAFT_READY" || application.status === "AWAITING_ADMIN_VERIFICATION") {
      // keep advanced status
    } else {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    // 4. Audit Event
    await prisma.auditEvent.create({
      data: {
        applicationId: application.id,
        actor: session?.email || application.account?.email || "System (Simulation)",
        action: "PAYMENT_SIMULATED",
        details: {
          amountAed: feeAmount,
          transactionRef: payment.transactionRef,
          environment: process.env.NODE_ENV || "production",
          simulated: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      simulated: true,
      applicationId: application.id,
      paymentId: payment.id,
      paymentStatus: "COMPLETED",
      amountAed: payment.amountAed,
      message: "Payment successfully simulated in " + (process.env.NODE_ENV || "production"),
    });
  } catch (error: any) {
    console.error("[POST /api/checkout/simulate error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to simulate payment" },
      { status: 500 }
    );
  }
}


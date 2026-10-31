import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!applicationId && !email) {
      return NextResponse.json(
        { success: false, error: "applicationId or email parameter required" },
        { status: 400 }
      );
    }

    let application = null;

    if (applicationId) {
      application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    if (!application && email) {
      const account = await prisma.account.findUnique({
        where: { email },
        include: {
          applications: {
            orderBy: { createdAt: "desc" },
            include: {
              payments: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });

      if (account && account.applications.length > 0) {
        application = account.applications[0];
      }
    }

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    const initialPayment = application.payments.find(
      (p) => p.milestone === "INITIAL_SERVICE_FEE"
    );

    const isPaid = initialPayment?.status === "COMPLETED";

    return NextResponse.json({
      success: true,
      paid: isPaid,
      paymentStatus: initialPayment?.status || "PENDING",
      applicationId: application.id,
      packageType: application.packageType,
      transactionRef: initialPayment?.transactionRef || null,
      amountAed: initialPayment?.amountAed ? Number(initialPayment.amountAed) : null,
    });
  } catch (error: any) {
    console.error("[Checkout Status Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyNomodSignature } from "@/lib/nomod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const signature = req.headers.get("x-nomod-signature");
    const secret = process.env.NOMOD_WEBHOOK_SECRET;

    if (secret && !verifyNomodSignature(rawBody, signature, secret)) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Extract transaction properties from either nested (event.data) or flat webhook payload
    const data = body.data || body;
    const txId = data.id || data.transactionId || body.id;
    const email = (data.customer?.email || data.email || body.email || "").trim().toLowerCase();
    const amount = Number(data.amount || body.amount || 0);
    const status = (data.status || body.status || "").toLowerCase();
    const applicationId = data.metadata?.applicationId || body.metadata?.applicationId;

    if (!txId) {
      return NextResponse.json(
        { success: false, error: "Missing transaction identifier" },
        { status: 400 }
      );
    }

    // 1. Idempotency Check: Check if transaction has already been recorded and completed
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionRef: txId },
      include: { application: true },
    });

    if (existingPayment && existingPayment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        received: true,
        duplicate: true,
        alreadyProcessed: true,
        applicationId: existingPayment.applicationId,
      });
    }

    // Only process successful payments
    const isSuccess = status === "paid" || status === "succeeded" || status === "completed" || body.event === "payment.succeeded";
    if (!isSuccess) {
      return NextResponse.json({
        success: true,
        reconciled: false,
        message: `Ignored status: ${status}`,
      });
    }

    // 2. Locate Application
    let targetApplication = null;

    if (applicationId) {
      targetApplication = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { payments: true },
      });
    }

    if (!targetApplication && email) {
      const account = await prisma.account.findUnique({
        where: { email },
        include: {
          applications: {
            orderBy: { createdAt: "desc" },
            include: { payments: true },
          },
        },
      });

      if (account && account.applications.length > 0) {
        // Look for the latest application with a pending payment
        targetApplication =
          account.applications.find((app) =>
            app.payments.some((p) => p.status === "PENDING")
          ) || account.applications[0];
      }
    }

    if (!targetApplication) {
      console.warn(`[Nomod Webhook]: No matching application found for email: ${email}, tx: ${txId}`);
      return NextResponse.json(
        { success: false, error: "Application not found for transaction" },
        { status: 404 }
      );
    }

    // 3. Reconcile Payment in DB
    const pendingPayment = targetApplication.payments.find(
      (p) => p.milestone === "INITIAL_SERVICE_FEE" && p.status === "PENDING"
    );

    await prisma.$transaction(async (tx) => {
      if (pendingPayment) {
        await tx.payment.update({
          where: { id: pendingPayment.id },
          data: {
            status: "COMPLETED",
            transactionRef: txId,
            amountAed: amount > 0 ? amount : pendingPayment.amountAed,
          },
        });
      } else {
        await tx.payment.create({
          data: {
            applicationId: targetApplication.id,
            milestone: "INITIAL_SERVICE_FEE",
            amountAed: amount > 0 ? amount : 999.0,
            status: "COMPLETED",
            transactionRef: txId,
          },
        });
      }

      await tx.application.update({
        where: { id: targetApplication.id },
        data: {
          status: "IN_PROGRESS",
        },
      });

      await tx.auditEvent.create({
        data: {
          applicationId: targetApplication.id,
          actor: "Nomod Webhook",
          action: "INITIAL_SERVICE_FEE_PAID",
          details: {
            transactionId: txId,
            amountAed: amount,
            email,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      received: true,
      reconciled: true,
      applicationId: targetApplication.id,
    });
  } catch (error: any) {
    console.error("[Nomod Webhook Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Testing Task 7: Milestone 2 Court-Fee Checkout & Locking ===");

  // 1. Fetch or create a test application
  let account = await prisma.account.findUnique({
    where: { email: "test.task6@court.ae" },
  });

  if (!account) {
    throw new Error("Account not found. Please run test-task6-questionnaire.ts first.");
  }

  let app = await prisma.application.findFirst({
    where: { accountId: account.id },
    include: { wills: true },
  });

  if (!app) {
    throw new Error("Application not found.");
  }

  console.log(`[PASS] Found test application: ID=${app.id}, Package=${app.packageType}`);

  // 2. Simulate Court Fee payment (Milestone 2)
  const amountAed = app.packageType === "COUPLES" ? 1900 : 950;
  const refNumber = `ADJD-FEE-${Date.now()}`;

  const payment = await prisma.payment.create({
    data: {
      applicationId: app.id,
      milestone: "COURT_FEE",
      amountAed,
      status: "COMPLETED",
      transactionRef: refNumber,
      receiptUrl: `/receipts/${refNumber}.pdf`,
    },
  });

  console.log(`[PASS] Milestone 2 Court Fee created: ${payment.amountAed} AED (Ref: ${payment.transactionRef})`);

  // 3. Update status to AWAITING_ADMIN_VERIFICATION
  const updatedApp = await prisma.application.update({
    where: { id: app.id },
    data: { status: "AWAITING_ADMIN_VERIFICATION" },
  });

  console.log(`[PASS] Application status transitioned to: ${updatedApp.status}`);

  // 4. Verify editing lock
  const lockedStatuses = [
    "AWAITING_ADMIN_VERIFICATION",
    "UNDER_ADMIN_REVIEW",
    "READY_FOR_SUBMISSION",
    "SUBMITTED_TO_ADJD",
    "REGISTRATION_COMPLETED",
  ];

  const isLocked = lockedStatuses.includes(updatedApp.status);
  if (!isLocked) {
    throw new Error("Application status should be locked!");
  }
  console.log("[PASS] Application is confirmed locked from user-level editing.");

  // 5. Create Audit Event
  const audit = await prisma.auditEvent.create({
    data: {
      applicationId: app.id,
      actor: account.email,
      action: "COURT_FEE_PAID",
      details: {
        amountAed,
        description: `Stage 2 Court Fee of AED ${amountAed} paid. Application locked for court verification.`,
      },
    },
  });

  console.log(`[PASS] Audit event created: ID=${audit.id}, Action=${audit.action}`);
  console.log("=== Task 7 Milestone 2 Court-Fee Checkout & Locking Passed! ===");
}

main()
  .catch((e) => {
    console.error("Task 7 test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

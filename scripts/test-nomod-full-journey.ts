import assert from "node:assert";
import { POST as initialCheckout } from "../app/api/checkout/initial/route";
import { GET as checkStatus } from "../app/api/checkout/status/route";
import { POST as nomodWebhook } from "../app/api/webhooks/nomod/route";
import { prisma } from "../lib/prisma";

async function runFullJourneyTest() {
  console.log("--- Starting End-to-End Nomod Payment Journey Test ---");

  const testEmail = `journey.test.${Date.now()}@example.com`;
  const fullName = "David Alan Whitfield";
  const packageType = "COUPLES";

  // Step 1: Initial checkout submission
  console.log("Step 1: Submitting initial checkout...");
  const initReq = new Request("http://localhost:3000/api/checkout/initial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName,
      email: testEmail,
      phoneNumber: "+971501234567",
      packageType,
      qualifications: {
        testatorAge21: true,
        nonUaeNational: true,
        uaeAssets: true,
        married: true,
        childrenUnder18: true,
        partnerAge21: true,
        partnerNonUae: true,
        partnerAssets: true,
        partnerMarried: true,
        partnerChildrenUnder18: true,
      },
    }),
  });

  const initRes = await initialCheckout(initReq);
  const initJson = await initRes.json();
  assert.strictEqual(initRes.status, 200, "Checkout submission failed");
  assert.strictEqual(initJson.success, true, "Checkout not marked success");
  assert.strictEqual(initJson.paymentStatus, "PENDING", "Payment must be PENDING");
  assert.ok(initJson.applicationId, "Missing applicationId");
  const appId = initJson.applicationId;
  console.log("✓ Application created:", appId, "Payment Status: PENDING");

  // Step 2: Check status before payment
  console.log("Step 2: Checking status before webhook confirmation...");
  const statusReq1 = new Request(`http://localhost:3000/api/checkout/status?applicationId=${appId}`);
  const statusRes1 = await checkStatus(statusReq1);
  const statusJson1 = await statusRes1.json();
  assert.strictEqual(statusJson1.success, true);
  assert.strictEqual(statusJson1.paid, false, "Should NOT be paid before webhook");
  assert.strictEqual(statusJson1.paymentStatus, "PENDING");
  console.log("✓ Status verified as UNPAID (paid = false)");

  // Step 3: Nomod webhook arrives with payment.succeeded
  console.log("Step 3: Simulating Nomod webhook payment.succeeded...");
  const webhookTxRef = `nomod_e2e_${Date.now()}`;
  const webhookReq = new Request("http://localhost:3000/api/webhooks/nomod", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "payment.succeeded",
      data: {
        id: webhookTxRef,
        amount: 1799.0,
        currency: "AED",
        customer: {
          name: fullName,
          email: testEmail,
        },
        metadata: {
          applicationId: appId,
        },
      },
    }),
  });

  const webhookRes = await nomodWebhook(webhookReq);
  const webhookJson = await webhookRes.json();
  assert.strictEqual(webhookRes.status, 200);
  assert.strictEqual(webhookJson.received, true);
  assert.strictEqual(webhookJson.reconciled, true);
  console.log("✓ Webhook processed & payment reconciled successfully");

  // Step 4: Check status after webhook
  console.log("Step 4: Checking status after webhook confirmation...");
  const statusReq2 = new Request(`http://localhost:3000/api/checkout/status?applicationId=${appId}`);
  const statusRes2 = await checkStatus(statusReq2);
  const statusJson2 = await statusRes2.json();
  assert.strictEqual(statusJson2.success, true);
  assert.strictEqual(statusJson2.paid, true, "Should be marked paid after webhook");
  assert.strictEqual(statusJson2.paymentStatus, "COMPLETED");
  console.log("✓ Status verified as PAID (paid = true)");

  // Step 5: Webhook Idempotency Check
  console.log("Step 5: Testing webhook idempotency duplicate detection...");
  const duplicateWebhookReq = new Request("http://localhost:3000/api/webhooks/nomod", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "payment.succeeded",
      data: {
        id: webhookTxRef,
        amount: 1799.0,
        currency: "AED",
        customer: {
          name: fullName,
          email: testEmail,
        },
        metadata: {
          applicationId: appId,
        },
      },
    }),
  });

  const duplicateWebhookRes = await nomodWebhook(duplicateWebhookReq);
  const duplicateJson = await duplicateWebhookRes.json();
  assert.strictEqual(duplicateWebhookRes.status, 200);
  assert.strictEqual(duplicateJson.duplicate, true, "Duplicate webhook must be acknowledged idempotently");
  console.log("✓ Duplicate webhook detected & handled safely without duplicate records");

  // Step 6: Verify Database Records
  console.log("Step 6: Verifying Prisma database audit events and payment records...");
  const payment = await prisma.payment.findUnique({
    where: { transactionRef: webhookTxRef },
  });
  assert.ok(payment, "Payment record not found in database");
  assert.strictEqual(payment?.status, "COMPLETED");
  assert.strictEqual(Number(payment?.amountAed), 1799.0);

  const auditEvents = await prisma.auditEvent.findMany({
    where: { applicationId: appId },
  });
  assert.ok(auditEvents.length >= 2, "Expected at least 2 audit events");
  console.log("✓ Database integrity verified:", auditEvents.length, "audit logs recorded");

  console.log("\n=======================================================");
  console.log("  ALL END-TO-END NOMOD INTEGRATION CHECKS PASSED (100%)");
  console.log("=======================================================\n");
}

runFullJourneyTest()
  .catch((err) => {
    console.error("End-to-End Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

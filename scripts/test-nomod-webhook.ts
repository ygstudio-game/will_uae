import { prisma } from "../lib/prisma";
import { POST as initialCheckout } from "../app/api/checkout/initial/route";
import { POST as webhookHandler } from "../app/api/webhooks/nomod/route";
import { NextRequest } from "next/server";
import assert from "assert";

async function testNomodWebhook() {
  console.log("=== [TEST] Task 2: Nomod Webhook Reconciliation ===");

  const testEmail = `test.webhook.${Date.now()}@example.com`;
  const testName = "Arthur Webhook Tester";

  // 1. Create initial application with PENDING payment
  const reqInit = new NextRequest("http://localhost:3000/api/checkout/initial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: testName,
      email: testEmail,
      phoneNumber: "+971 50 999 1111",
      packageType: "INDIVIDUAL",
      qualifications: {
        testatorAge21: true,
        nonUaeNational: true,
        uaeAssets: true,
      },
    }),
  });

  const resInit = await initialCheckout(reqInit);
  const dataInit = await resInit.json();
  assert.strictEqual(dataInit.success, true);
  assert.strictEqual(dataInit.paymentStatus, "PENDING");

  // 2. Simulate Nomod Webhook POST
  const fakeTxId = `NOMOD-TX-${Date.now().toString(36).toUpperCase()}`;
  const webhookBody = {
    event: "payment.succeeded",
    data: {
      id: fakeTxId,
      amount: 999.0,
      currency: "AED",
      status: "paid",
      customer: {
        email: testEmail,
        name: testName,
      },
      metadata: {
        applicationId: dataInit.applicationId,
      },
    },
  };

  const reqWebhook = new NextRequest("http://localhost:3000/api/webhooks/nomod", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(webhookBody),
  });

  const resWebhook = await webhookHandler(reqWebhook);
  const dataWebhook = await resWebhook.json();

  console.log("Webhook response:", dataWebhook);
  assert.strictEqual(dataWebhook.success, true, "Webhook processing must succeed");
  assert.strictEqual(dataWebhook.reconciled, true, "Payment must be marked reconciled");

  // 3. Verify in database
  const updatedPayment = await prisma.payment.findUnique({
    where: { id: dataInit.paymentId },
  });

  assert(updatedPayment, "Payment record must exist");
  assert.strictEqual(updatedPayment.status, "COMPLETED", "Payment status in database must be COMPLETED");
  assert.strictEqual(updatedPayment.transactionRef, fakeTxId, "Transaction ref must be recorded from Nomod");

  // 4. Test idempotency (duplicate delivery)
  const reqDuplicate = new NextRequest("http://localhost:3000/api/webhooks/nomod", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(webhookBody),
  });

  const resDuplicate = await webhookHandler(reqDuplicate);
  const dataDuplicate = await resDuplicate.json();
  assert.strictEqual(dataDuplicate.success, true, "Duplicate webhook must be handled gracefully");
  assert.strictEqual(dataDuplicate.alreadyProcessed, true, "Duplicate webhook must be identified as alreadyProcessed");

  console.log("✓ PASS: Nomod webhook reconciled payment, verified DB status, and handled idempotency.");
}

testNomodWebhook().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

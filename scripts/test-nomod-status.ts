import { prisma } from "../lib/prisma";
import { POST as initialCheckout } from "../app/api/checkout/initial/route";
import { GET as statusHandler } from "../app/api/checkout/status/route";
import { NextRequest } from "next/server";
import assert from "assert";

async function testNomodStatus() {
  console.log("=== [TEST] Task 3: Payment Status Polling Route ===");

  const testEmail = `test.status.${Date.now()}@example.com`;
  const testName = "Arthur Status Tester";

  // 1. Create initial application
  const reqInit = new NextRequest("http://localhost:3000/api/checkout/initial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: testName,
      email: testEmail,
      phoneNumber: "+971 50 888 2222",
      packageType: "INDIVIDUAL",
    }),
  });

  const resInit = await initialCheckout(reqInit);
  const dataInit = await resInit.json();

  // 2. Check status while unpaid / pending
  const reqStatus1 = new NextRequest(
    `http://localhost:3000/api/checkout/status?applicationId=${dataInit.applicationId}&email=${encodeURIComponent(testEmail)}`
  );
  const resStatus1 = await statusHandler(reqStatus1);
  const dataStatus1 = await resStatus1.json();

  console.log("Status before webhook:", dataStatus1);
  assert.strictEqual(dataStatus1.success, true);
  assert.strictEqual(dataStatus1.paid, false, "Must be unpaid initially");
  assert.strictEqual(dataStatus1.paymentStatus, "PENDING");

  // 3. Mark payment as completed
  await prisma.payment.update({
    where: { id: dataInit.paymentId },
    data: { status: "COMPLETED", transactionRef: `TX-NOMOD-${Date.now()}` },
  });

  // 4. Check status after payment completed
  const reqStatus2 = new NextRequest(
    `http://localhost:3000/api/checkout/status?applicationId=${dataInit.applicationId}&email=${encodeURIComponent(testEmail)}`
  );
  const resStatus2 = await statusHandler(reqStatus2);
  const dataStatus2 = await resStatus2.json();

  console.log("Status after webhook:", dataStatus2);
  assert.strictEqual(dataStatus2.success, true);
  assert.strictEqual(dataStatus2.paid, true, "Must be paid after reconciliation");
  assert.strictEqual(dataStatus2.paymentStatus, "COMPLETED");
  assert.strictEqual(dataStatus2.applicationId, dataInit.applicationId);

  console.log("✓ PASS: Payment status endpoint accurately reports real-time payment states.");
}

testNomodStatus().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

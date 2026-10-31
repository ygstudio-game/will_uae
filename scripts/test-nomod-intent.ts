import { prisma } from "../lib/prisma";
import { POST } from "../app/api/checkout/initial/route";
import { NextRequest } from "next/server";
import assert from "assert";

async function testNomodIntent() {
  console.log("=== [TEST] Task 1: Pending Payment Intent Creation ===");

  const testEmail = `test.nomod.intent.${Date.now()}@example.com`;
  const testName = "Arthur Nomod Test";
  const testPhone = "+971 50 123 4567";

  const req = new NextRequest("http://localhost:3000/api/checkout/initial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: testName,
      email: testEmail,
      phoneNumber: testPhone,
      packageType: "INDIVIDUAL",
      qualifications: {
        testatorAge21: true,
        nonUaeNational: true,
        uaeAssets: true,
        married: false,
        childrenUnder18: false,
      },
    }),
  });

  const res = await POST(req);
  const data = await res.json();

  console.log("Response data:", data);
  assert.strictEqual(data.success, true, "Checkout intent creation must succeed");
  assert.strictEqual(data.paymentStatus, "PENDING", "Initial checkout payment status must be PENDING");

  const payment = await prisma.payment.findUnique({
    where: { id: data.paymentId },
  });

  assert(payment, "Payment record must exist in database");
  assert.strictEqual(payment.status, "PENDING", "Database payment status must be PENDING");
  assert.strictEqual(Number(payment.amountAed), 999, "Individual package fee must be AED 999");

  console.log("✓ PASS: Payment intent successfully created with PENDING status and exact fee AED 999");
}

testNomodIntent().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

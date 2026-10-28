import { prisma } from "../lib/prisma";
import { POST } from "../app/api/checkout/initial/route";
import { NextRequest } from "next/server";

async function runPrepaymentE2ETest() {
  console.log("=== [START] Pre-Payment & Database Assurance Test ===");

  const testEmail = `test.e2e.${Date.now()}@example.com`;
  const testName = "Arthur Pendelton Vance";
  const testPhone = "+971 50 882 1923";

  console.log(`\n1. Creating Couples application for: ${testName} (${testEmail})`);

  const mockReq = new NextRequest("http://localhost:3000/api/checkout/initial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: testName,
      email: testEmail,
      phoneNumber: testPhone,
      packageType: "COUPLES",
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

  const res = await POST(mockReq);
  const data = await res.json();

  console.log("API Response Status:", res.status);
  console.log("API Response Body:", data);

  if (!data.success) {
    throw new Error(`Checkout failed: ${data.error}`);
  }

  const { applicationId, willId, will2Id, paymentId } = data;

  console.log("\n2. Verifying database records directly in PostgreSQL...");

  // Verify Account
  const account = await prisma.account.findUnique({
    where: { email: testEmail },
  });
  if (!account || account.fullName !== testName || account.phoneNumber !== testPhone) {
    throw new Error("Account verification failed: Data does not match user input!");
  }
  console.log("✓ Account created with exact user data (ID:", account.id, ")");

  // Verify Application
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { persons: true, wills: true, payments: true },
  });
  if (!application) throw new Error("Application not found in database!");
  if (application.packageType !== "COUPLES") throw new Error("Wrong package type in DB!");
  if (application.status !== "IN_PROGRESS") throw new Error("Wrong status in DB!");
  if (
    !application.qualTestatorAge21 ||
    !application.qualNonUaeNational ||
    !application.qualUaeAssets ||
    !application.qualMarried ||
    !application.qualChildrenUnder18
  ) {
    throw new Error("Application qualification answers did not persist!");
  }
  console.log("✓ Application verified with full qualification flags (ID:", application.id, ")");

  // Verify Person
  const primaryPerson = application.persons.find((p) => p.email === testEmail);
  if (!primaryPerson || primaryPerson.fullName !== testName) {
    throw new Error("Primary Person not properly linked or wrong name in DB!");
  }
  console.log("✓ Primary Person created for Testator:", primaryPerson.fullName);

  // Verify Wills
  if (application.wills.length !== 2) {
    throw new Error(`Expected 2 wills for Couples package, found ${application.wills.length}`);
  }
  const will1 = application.wills.find((w) => w.willIndex === 1);
  const will2 = application.wills.find((w) => w.willIndex === 2);
  if (!will1 || will1.testatorPersonId !== primaryPerson.id) {
    throw new Error("Will 1 not linked to primary person!");
  }
  if (!will2) {
    throw new Error("Will 2 missing for couples package!");
  }
  console.log("✓ Will 1 (Testator) & Will 2 (Partner) successfully linked in DB");

  // Verify Payment
  const payment = application.payments.find((p) => p.id === paymentId);
  if (!payment || Number(payment.amountAed) !== 1799.0 || payment.status !== "COMPLETED") {
    throw new Error(`Payment record verification failed! Found amount: ${payment?.amountAed}, status: ${payment?.status}`);
  }
  console.log("✓ Payment recorded: AED", payment.amountAed, payment.status);

  // Verify NO dummy seed data leaked
  const allText = JSON.stringify(application);
  if (allText.includes("Daniel Reyes") || allText.includes("DEMO-TR-001")) {
    throw new Error("CRITICAL: Dummy mockup data leaked into database!");
  }
  console.log("✓ Verified ZERO mockup dummy data exists in database record");

  // Cleanup test records
  console.log("\n3. Cleaning up test records...");
  await prisma.payment.deleteMany({ where: { applicationId } });
  await prisma.will.deleteMany({ where: { applicationId } });
  await prisma.person.deleteMany({ where: { applicationId } });
  await prisma.application.delete({ where: { id: applicationId } });
  await prisma.account.delete({ where: { id: account.id } });
  console.log("✓ Test records cleaned up successfully");

  console.log("\n=== [SUCCESS] All Pre-Payment E2E & Database Verification Checks Passed! ===");
}

runPrepaymentE2ETest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

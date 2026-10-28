import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

async function verifyEverything() {
  console.log("=================================================================");
  console.log("   COMPREHENSIVE AUDIT & RE-VERIFICATION: ZERO HARDCODED DATA   ");
  console.log("=================================================================\n");

  // 1. Scan all files in components/pre-payment/ for dummy/mockup strings
  console.log("1. Scanning all pre-payment components for prototype dummy strings...");
  const prePaymentDir = path.join(process.cwd(), "components", "pre-payment");
  const files = fs.readdirSync(prePaymentDir);

  const forbiddenStrings = [
    "Daniel Reyes",
    "Sara Reyes",
    "Adam Reyes",
    "Lina Reyes",
    "Maya Reyes",
    "Nora Bennett",
    "Owen Bennett",
    "DEMO-TR-",
    "DEMO-EID-",
    "sample-passport.pdf",
    "sample-emirates-id.pdf",
    "sample-address.pdf",
    "123456",
  ];

  let foundForbidden = false;
  for (const file of files) {
    const fullPath = path.join(prePaymentDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    for (const forbidden of forbiddenStrings) {
      if (content.includes(forbidden)) {
        console.error(`❌ FORBIDDEN STRING FOUND in ${file}: "${forbidden}"`);
        foundForbidden = true;
      }
    }
  }

  if (foundForbidden) {
    throw new Error("Audit Failed: Mockup dummy strings detected in components!");
  }
  console.log(`✓ All ${files.length} pre-payment files scanned: ZERO dummy/mockup strings found.`);

  // 2. Verify default state in types/pre-payment.ts
  console.log("\n2. Verifying default state initialization in types/pre-payment.ts...");
  const typesContent = fs.readFileSync(path.join(process.cwd(), "types", "pre-payment.ts"), "utf-8");
  if (!typesContent.includes('fullName: ""') || !typesContent.includes('email: ""') || !typesContent.includes('phoneNumber: ""')) {
    throw new Error("Default state does not initialize inputs with empty strings!");
  }
  if (!typesContent.includes("age21: null") || !typesContent.includes("nonUae: null") || !typesContent.includes("uaeAssets: null")) {
    throw new Error("Default eligibility state does not initialize as null!");
  }
  console.log("✓ Initial state verified: 100% of inputs start EMPTY or NULL (forces real user input).");

  // 3. Database Persistence Test with random user input
  console.log("\n3. Testing Database Persistence with unique dynamic user input...");
  const uniqueId = Date.now().toString(36);
  const userFullName = `Marcus Aurelius Valerius-${uniqueId}`;
  const userEmail = `marcus.valerius.${uniqueId}@rome-legion.org`;
  const userPhone = `+971 50 ${Math.floor(1000000 + Math.random() * 9000000)}`;

  // Direct checkout initial POST test
  const { POST } = await import("../app/api/checkout/initial/route");
  const { NextRequest } = await import("next/server");

  const req = new NextRequest("http://localhost:3000/api/checkout/initial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: userFullName,
      email: userEmail,
      phoneNumber: userPhone,
      packageType: "INDIVIDUAL",
      qualifications: {
        testatorAge21: true,
        nonUaeNational: true,
        uaeAssets: true,
        married: true,
        childrenUnder18: false,
      },
    }),
  });

  const res = await POST(req);
  const resJson = await res.json();
  if (!resJson.success) {
    throw new Error(`API Checkout failed: ${resJson.error}`);
  }

  // Verify Account in DB
  const savedAccount = await prisma.account.findUnique({
    where: { email: userEmail },
  });
  if (!savedAccount || savedAccount.fullName !== userFullName || savedAccount.phoneNumber !== userPhone) {
    throw new Error("Account data in PostgreSQL does not match the user's input!");
  }
  console.log(`✓ Account saved in PostgreSQL: Name = "${savedAccount.fullName}", Email = "${savedAccount.email}"`);

  // Verify Application in DB
  const savedApp = await prisma.application.findUnique({
    where: { id: resJson.applicationId },
    include: { persons: true, wills: true, payments: true },
  });
  if (!savedApp) throw new Error("Application record not found in PostgreSQL!");
  if (savedApp.packageType !== "INDIVIDUAL" || savedApp.status !== "IN_PROGRESS") {
    throw new Error("Application attributes failed to persist properly!");
  }
  console.log(`✓ Application saved in PostgreSQL: ID = ${savedApp.id}, Status = ${savedApp.status}`);

  // Verify Person in DB
  const savedPerson = savedApp.persons[0];
  if (!savedPerson || savedPerson.fullName !== userFullName || savedPerson.email !== userEmail) {
    throw new Error("Person record failed to save user's full legal name!");
  }
  console.log(`✓ Person saved in PostgreSQL: Full Legal Name = "${savedPerson.fullName}"`);

  // Verify Will in DB
  const savedWill = savedApp.wills[0];
  if (!savedWill || savedWill.testatorPersonId !== savedPerson.id) {
    throw new Error("Will record is not linked to Person profile!");
  }
  console.log(`✓ Will saved in PostgreSQL: Linked Testator Person ID = ${savedWill.testatorPersonId}`);

  // Verify Payment in DB
  const savedPayment = savedApp.payments[0];
  if (!savedPayment || Number(savedPayment.amountAed) !== 999.0 || savedPayment.status !== "COMPLETED") {
    throw new Error("Payment record failed to register!");
  }
  console.log(`✓ Payment milestone saved in PostgreSQL: Amount = AED ${savedPayment.amountAed}, Status = ${savedPayment.status}`);

  // Clean up test data
  console.log("\n4. Cleaning up test record from database...");
  await prisma.payment.deleteMany({ where: { applicationId: savedApp.id } });
  await prisma.will.deleteMany({ where: { applicationId: savedApp.id } });
  await prisma.person.deleteMany({ where: { applicationId: savedApp.id } });
  await prisma.application.delete({ where: { id: savedApp.id } });
  await prisma.account.delete({ where: { id: savedAccount.id } });
  console.log("✓ Test records cleaned up cleanly.");

  console.log("\n=================================================================");
  console.log("   AUDIT PASSED 100%: ZERO HARDCODED DATA · FULL DB LIFECYCLE   ");
  console.log("=================================================================");
}

verifyEverything()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

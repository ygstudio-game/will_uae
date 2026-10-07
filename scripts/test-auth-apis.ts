import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../lib/auth";

async function runAuthTests() {
  console.log("Starting Auth & Session Core Tests on Neon Postgres...");

  // 1. Test Password Hashing
  const rawPass = "SecretSecurePass123!";
  const hash = await hashPassword(rawPass);
  const isMatch = await verifyPassword(rawPass, hash);
  const isFalseMatch = await verifyPassword("WrongPassword", hash);

  if (!isMatch || isFalseMatch) {
    throw new Error("Password hash verification failed");
  }
  console.log("✓ Password hashing & verification passed.");

  // 2. Test HMAC Session Token Creation & Verification
  const testUser = {
    id: "test-user-id-01",
    email: "test.auth@example.com",
    name: "Test Auth User",
  };
  const token = await createSessionToken(testUser);
  const verifiedPayload = await verifySessionToken(token);

  if (!verifiedPayload || verifiedPayload.userId !== testUser.id) {
    throw new Error("Session token verification failed");
  }
  console.log("✓ HMAC session token signing & verification passed.");

  // 3. Test Demo User in Neon DB
  const demoEmail = "daniel@example.com";
  const demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!demoUser) {
    throw new Error("Demo user daniel@example.com not found in Neon DB");
  }
  console.log(`✓ Demo user verified in Neon DB: ${demoUser.name} (${demoUser.email})`);

  // 4. Test Demo Will & Relations
  const demoWill = await prisma.will.findFirst({
    where: { userId: demoUser.id },
    include: { parties: true, children: true, assets: true },
  });

  if (!demoWill) {
    throw new Error("Demo will record not found in Neon DB");
  }

  console.log(`✓ Demo Will #${demoWill.willNumber} verified:`);
  console.log(`  - Status: ${demoWill.status}, Step: ${demoWill.currentStep}`);
  console.log(`  - Parties: ${demoWill.parties.length}`);
  console.log(`  - Children: ${demoWill.children.length}`);
  console.log(`  - Assets: ${demoWill.assets.length}`);

  console.log("\nALL AUTH & SESSION TESTS PASSED SUCCESSFULLY! ✓\n");
}

runAuthTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

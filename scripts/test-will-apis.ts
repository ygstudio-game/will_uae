import { prisma } from "../lib/prisma";
import { WillStatus, WillType, PartyType } from "@prisma/client";

async function runWillApiTests() {
  console.log("Starting Will Lifecycle & Neon DB Persistence Tests...");

  // 1. Get or create a test user
  const user = await prisma.user.upsert({
    where: { email: "test.lifecycle@example.com" },
    update: {},
    create: {
      email: "test.lifecycle@example.com",
      name: "Alex Morgan",
    },
  });

  console.log(`✓ Test user verified: ${user.name} (${user.id})`);

  // 2. Create fresh will draft
  const newWill = await prisma.will.create({
    data: {
      userId: user.id,
      willType: WillType.INDIVIDUAL,
      status: WillStatus.DRAFT,
      currentStep: 1,
      fullName: "Alex Morgan",
      emailAddress: user.email,
    },
  });

  console.log(`✓ Created new Will draft #${newWill.willNumber} (ID: ${newWill.id})`);

  // 3. Simulate PATCH step 2 & 4: Add testator details and parties
  await prisma.$transaction(async (tx) => {
    await tx.will.update({
      where: { id: newWill.id },
      data: {
        currentStep: 4,
        nationality: "Canadian",
        passportNumber: "CA998877",
        emiratesId: "784-1990-1234567-9",
        residentialAddress: "Downtown Dubai, Tower 1, Apt 401",
        declarationConfirmed: true,
      },
    });

    await tx.party.create({
      data: {
        willId: newWill.id,
        partyType: PartyType.PRIMARY_EXECUTOR,
        fullName: "Jessica Claire Morgan",
        arabicName: "جيسيكا كلير مورغان",
        isArabicApproved: true,
        nationality: "Canadian",
        passportNumber: "CA112233",
      },
    });
  });

  console.log("✓ Step 2 & 4 updates persisted atomically in Neon Postgres.");

  // 4. Retrieve full relational will
  const loadedWill = await prisma.will.findUnique({
    where: { id: newWill.id },
    include: { parties: true, children: true, assets: true },
  });

  if (!loadedWill) throw new Error("Could not retrieve created will");
  if (loadedWill.parties.length !== 1) throw new Error("Parties not synced correctly");
  if (loadedWill.parties[0].arabicName !== "جيسيكا كلير مورغان") {
    throw new Error("Arabic transliteration corrupted");
  }

  console.log(`✓ Relational Will verification successful:`);
  console.log(`  - Testator: ${loadedWill.fullName} (${loadedWill.nationality})`);
  console.log(`  - Passport: ${loadedWill.passportNumber}`);
  console.log(`  - Executor: ${loadedWill.parties[0].fullName} -> ${loadedWill.parties[0].arabicName}`);

  // 5. Clean up test will
  await prisma.will.delete({ where: { id: newWill.id } });
  const countAfterDelete = await prisma.party.count({ where: { willId: newWill.id } });
  if (countAfterDelete !== 0) throw new Error("Cascading party deletion failed");

  console.log("✓ Cascading delete verified. All relational records removed.");
  console.log("\nALL WILL MANAGEMENT & NEON PERSISTENCE TESTS PASSED! ✓\n");
}

runWillApiTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

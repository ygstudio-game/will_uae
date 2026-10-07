import { prisma } from "../lib/prisma";

async function main() {
  console.log("Testing Universal Person repository and role assignments...");

  // 1. Create test application
  const account = await prisma.account.create({
    data: {
      email: `universal.person.${Date.now()}@example.com`,
      fullName: "Sherlock Holmes",
    },
  });

  const app = await prisma.application.create({
    data: {
      accountId: account.id,
      packageType: "INDIVIDUAL",
      status: "IN_PROGRESS",
    },
  });

  const will = await prisma.will.create({
    data: {
      applicationId: app.id,
      willIndex: 1,
      versionTag: "ADJD-NM0723-07-03",
    },
  });

  // 2. Create John Watson as a Person
  const watson = await prisma.person.create({
    data: {
      applicationId: app.id,
      fullName: "Dr. John H. Watson",
      arabicName: "د. جون واطسون",
      isArabicApproved: true,
      dob: new Date("1980-07-07"),
      nationality: "British",
      passportNumber: "GB12345678",
      address: "221B Baker St, London / Abu Dhabi",
    },
  });

  // Upload passport for Watson
  const doc = await prisma.uploadedDocument.create({
    data: {
      personId: watson.id,
      documentType: "PASSPORT",
      fileName: "watson_passport.pdf",
      fileUrl: "/uploads/watson_passport.pdf",
    },
  });

  // 3. Assign Watson as EXECUTOR_PRIMARY
  const role1 = await prisma.roleAssignment.create({
    data: {
      willId: will.id,
      personId: watson.id,
      role: "EXECUTOR_PRIMARY",
      appointmentOrder: 1,
    },
  });

  // 4. ALSO assign Watson as BENEFICIARY (100% share) - zero duplicate uploads!
  const role2 = await prisma.roleAssignment.create({
    data: {
      willId: will.id,
      personId: watson.id,
      role: "BENEFICIARY",
      appointmentOrder: 1,
      sharePercentage: 100.0,
    },
  });

  console.log("Created Watson Person ID:", watson.id);
  console.log("Watson assigned as Executor (Role ID):", role1.id);
  console.log("Watson assigned as Beneficiary (Role ID):", role2.id);

  // 5. Query assignments with person and attached documents
  const fetchedAssignments = await prisma.roleAssignment.findMany({
    where: { willId: will.id },
    include: {
      person: {
        include: { documents: true },
      },
    },
  });

  if (fetchedAssignments.length !== 2) {
    throw new Error(`Expected 2 role assignments, got ${fetchedAssignments.length}`);
  }

  // Verify document reuse
  for (const assign of fetchedAssignments) {
    if (assign.person.documents.length === 0) {
      throw new Error(`Person ${assign.person.fullName} missing reused documents in role ${assign.role}`);
    }
  }

  console.log("✓ Universal Person identity profile and document reuse verified successfully!");
}

main()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

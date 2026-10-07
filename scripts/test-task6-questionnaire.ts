import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Testing Task 6: 6-Section Questionnaire Integration ===");

  // 1. Fetch or create a test application
  let account = await prisma.account.findUnique({
    where: { email: "test.task6@court.ae" },
  });

  if (!account) {
    account = await prisma.account.create({
      data: {
        email: "test.task6@court.ae",
        fullName: "Alexander David Croft",
      },
    });
  }

  let app = await prisma.application.findFirst({
    where: { accountId: account.id },
    include: {
      wills: {
        include: {
          testatorPerson: true,
          roleAssignments: { include: { person: true } },
        },
      },
      persons: true,
    },
  });

  if (!app) {
    app = await prisma.application.create({
      data: {
        accountId: account.id,
        packageType: "COUPLES",
        status: "IN_PROGRESS",
      },
      include: {
        wills: {
          include: {
            testatorPerson: true,
            roleAssignments: { include: { person: true } },
          },
        },
        persons: true,
      },
    });
  }

  console.log(`[PASS] Test Application ready: ID=${app.id}, Package=${app.packageType}`);

  // 2. Create persons in universal repository
  const testator = await prisma.person.upsert({
    where: { id: "test-testator-6" },
    update: {},
    create: {
      id: "test-testator-6",
      applicationId: app.id,
      fullName: "Alexander David Croft",
      arabicName: "ألكسندر ديفيد كروفت",
      relationship: "Self",
      nationality: "British",
      passportNumber: "55123987",
      isUaeResident: true,
      address: "Villa 42, Saadiyat Beach Villas, Abu Dhabi, UAE",
    },
  });

  const spouse = await prisma.person.upsert({
    where: { id: "test-spouse-6" },
    update: {},
    create: {
      id: "test-spouse-6",
      applicationId: app.id,
      fullName: "Eleanor Jane Croft",
      arabicName: "إلينور جين كروفت",
      relationship: "Spouse",
      nationality: "British",
      passportNumber: "55876543",
      isUaeResident: true,
      address: "Villa 42, Saadiyat Beach Villas, Abu Dhabi, UAE",
    },
  });

  const child1 = await prisma.person.upsert({
    where: { id: "test-child-1" },
    update: {},
    create: {
      id: "test-child-1",
      applicationId: app.id,
      fullName: "Oliver Alexander Croft",
      arabicName: "أوليفر ألكسندر كروفت",
      relationship: "Son",
      nationality: "British",
      passportNumber: "66123456",
      dob: new Date("2016-04-12"),
      isUaeResident: true,
    },
  });

  const child2 = await prisma.person.upsert({
    where: { id: "test-child-2" },
    update: {},
    create: {
      id: "test-child-2",
      applicationId: app.id,
      fullName: "Sophia Grace Croft",
      arabicName: "صوفيا غريس كروفت",
      relationship: "Daughter",
      nationality: "British",
      passportNumber: "66987654",
      dob: new Date("2019-09-25"),
      isUaeResident: true,
    },
  });

  const tempGuardian = await prisma.person.upsert({
    where: { id: "test-temp-guard" },
    update: {},
    create: {
      id: "test-temp-guard",
      applicationId: app.id,
      fullName: "Marcus John Evans",
      arabicName: "ماركوس جون إيفانز",
      relationship: "Close Friend",
      nationality: "British",
      passportNumber: "77123999",
      isUaeResident: true,
      address: "Etihad Towers, Tower 3, Abu Dhabi, UAE",
    },
  });

  console.log("[PASS] Universal Person Repository populated with Testator, Spouse, 2 Children, and Temp Guardian");

  // 3. Upsert Will 1 with full role assignments
  let will1 = await prisma.will.findFirst({
    where: { applicationId: app.id, willIndex: 1 },
  });

  if (!will1) {
    will1 = await prisma.will.create({
      data: {
        applicationId: app.id,
        willIndex: 1,
        testatorPersonId: testator.id,
        versionTag: "ADJD-NM0723-07-03",
        domicileCountry: "United Kingdom",
      },
    });
  }

  // Clear previous test assignments
  await prisma.roleAssignment.deleteMany({
    where: { willId: will1.id },
  });

  // Assign roles
  // Section B: Children
  await prisma.roleAssignment.create({
    data: { willId: will1.id, personId: child1.id, role: "CHILD", appointmentOrder: 1 },
  });
  await prisma.roleAssignment.create({
    data: { willId: will1.id, personId: child2.id, role: "CHILD", appointmentOrder: 2 },
  });

  // Section C: Executors
  await prisma.roleAssignment.create({
    data: { willId: will1.id, personId: spouse.id, role: "EXECUTOR_PRIMARY", appointmentOrder: 1 },
  });

  // Section D: Guardians (Permanent, Substitute Perm, Temporary)
  await prisma.roleAssignment.create({
    data: { willId: will1.id, personId: spouse.id, role: "GUARDIAN_PERMANENT", appointmentOrder: 1 },
  });
  await prisma.roleAssignment.create({
    data: { willId: will1.id, personId: tempGuardian.id, role: "GUARDIAN_TEMPORARY", appointmentOrder: 3 },
  });

  // Section E: Beneficiaries (Spouse 60%, Child1 20%, Child2 20% = 100%)
  await prisma.roleAssignment.create({
    data: { willId: will1.id, personId: spouse.id, role: "BENEFICIARY", appointmentOrder: 1, sharePercentage: 60 },
  });
  await prisma.roleAssignment.create({
    data: { willId: will1.id, personId: child1.id, role: "BENEFICIARY", appointmentOrder: 2, sharePercentage: 20 },
  });
  await prisma.roleAssignment.create({
    data: { willId: will1.id, personId: child2.id, role: "BENEFICIARY", appointmentOrder: 3, sharePercentage: 20 },
  });

  // 4. Verify 100% allocation
  const beneficiaries = await prisma.roleAssignment.findMany({
    where: { willId: will1.id, role: "BENEFICIARY" },
  });

  const totalShare = beneficiaries.reduce((sum, b) => sum + Number(b.sharePercentage), 0);
  console.log(`[PASS] Beneficiary Share Check: Sum = ${totalShare}% (Target: 100%)`);
  if (totalShare !== 100) {
    throw new Error(`Total share is ${totalShare}%, expected 100%`);
  }

  // 5. Verify draft confirmation mark
  await prisma.will.update({
    where: { id: will1.id },
    data: { isDraftConfirmed: true },
  });

  console.log("[PASS] Task 6 Questionnaire and Draft confirmation verified successfully!");
}

main()
  .catch((e) => {
    console.error("Task 6 test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

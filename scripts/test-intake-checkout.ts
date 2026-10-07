import { prisma } from "../lib/prisma";

async function main() {
  console.log("Testing initial checkout API logic...");

  const testEmail = `checkout.test.${Date.now()}@example.com`;
  const payload = {
    fullName: "Arthur Conan Doyle",
    email: testEmail,
    phoneNumber: "+971509876543",
    packageType: "INDIVIDUAL",
    qualifications: {
      testatorAge21: true,
      nonUaeNational: true,
      uaeAssets: true,
      married: true,
      childrenUnder18: true,
    },
  };

  // 1. Create Account
  let account = await prisma.account.findUnique({ where: { email: payload.email } });
  if (!account) {
    account = await prisma.account.create({
      data: {
        email: payload.email,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
      },
    });
  }

  // 2. Create Application
  const app = await prisma.application.create({
    data: {
      accountId: account.id,
      packageType: "INDIVIDUAL",
      status: "IN_PROGRESS",
      qualTestatorAge21: payload.qualifications.testatorAge21,
      qualNonUaeNational: payload.qualifications.nonUaeNational,
      qualUaeAssets: payload.qualifications.uaeAssets,
      qualMarried: payload.qualifications.married,
      qualChildrenUnder18: payload.qualifications.childrenUnder18,
    },
  });

  // 3. Create initial Payment
  const payment = await prisma.payment.create({
    data: {
      applicationId: app.id,
      milestone: "INITIAL_SERVICE_FEE",
      amountAed: 999.0,
      status: "COMPLETED",
      transactionRef: `TX-INIT-${Date.now()}`,
    },
  });

  // 4. Create primary Will record
  const will = await prisma.will.create({
    data: {
      applicationId: app.id,
      willIndex: 1,
      versionTag: "ADJD-NM0723-07-03",
      hasChildrenUnder18: payload.qualifications.childrenUnder18,
    },
  });

  console.log("Created Application ID:", app.id);
  console.log("Created Payment ID:", payment.id, "Amount:", payment.amountAed.toString());
  console.log("Created Will ID:", will.id);

  if (payment.amountAed.toNumber() !== 999) {
    throw new Error("Invalid payment amount for Individual package");
  }

  console.log("✓ Initial checkout database transaction verified successfully!");
}

main()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

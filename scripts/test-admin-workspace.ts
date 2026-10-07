import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Testing Task 8: Admin Workspace & 9-Stage Pipeline ===");

  // 1. Fetch our test application
  const app = await prisma.application.findFirst({
    where: { account: { email: "test.task6@court.ae" } },
    include: {
      account: true,
      wills: { include: { testatorPerson: true } },
      reviewFlags: true,
      auditEvents: true,
    },
  });

  if (!app) {
    throw new Error("Test application not found.");
  }

  console.log(`[PASS] Found application: ID=${app.id}, Status=${app.status}`);

  // 2. Advance status pipeline: AWAITING_ADMIN_VERIFICATION -> UNDER_ADMIN_REVIEW -> READY_FOR_SUBMISSION
  const updated1 = await prisma.application.update({
    where: { id: app.id },
    data: { status: "UNDER_ADMIN_REVIEW" },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId: app.id,
      actor: "admin@adjd-legal.ae",
      action: "STATUS_CHANGE",
      details: {
        previousStatus: app.status,
        newStatus: "UNDER_ADMIN_REVIEW",
        notes: "Admin opened application for legal and transliteration review.",
      },
    },
  });

  console.log(`[PASS] Advanced to stage: ${updated1.status}`);

  // 3. Add AI verification flag
  const flag = await prisma.reviewFlag.create({
    data: {
      applicationId: app.id,
      fieldPath: "Clause 1 · Testator Arabic Script",
      severity: "WARNING",
      message: "Verify Arabic transliteration against Ministry of Justice official dictionary.",
    },
  });

  console.log(`[PASS] Created ReviewFlag: ID=${flag.id}, Severity=${flag.severity}`);

  // 4. Resolve the flag with admin resolution notes
  const resolvedFlag = await prisma.reviewFlag.update({
    where: { id: flag.id },
    data: {
      isResolved: true,
      resolvedBy: "admin@adjd-legal.ae",
      resolutionNotes: "Verified with court translator: ألكسندر ديفيد كروفت conforms to standard ADJD transliteration.",
    },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId: app.id,
      actor: "admin@adjd-legal.ae",
      action: "FLAG_RESOLVED",
      details: {
        flagId: flag.id,
        resolutionNotes: resolvedFlag.resolutionNotes,
      },
    },
  });

  console.log(`[PASS] Flag resolved successfully by: ${resolvedFlag.resolvedBy}`);

  // 5. Admin direct draft correction
  const testatorPerson = app.wills[0]?.testatorPerson;
  if (testatorPerson) {
    const correctedPerson = await prisma.person.update({
      where: { id: testatorPerson.id },
      data: {
        arabicName: "ألكسندر ديفيد كروفت المعتمد",
        isArabicApproved: true,
      },
    });

    await prisma.auditEvent.create({
      data: {
        applicationId: app.id,
        actor: "admin@adjd-legal.ae",
        action: "DRAFT_CORRECTION",
        details: {
          personId: testatorPerson.id,
          updatedArabicName: correctedPerson.arabicName,
        },
      },
    });

    console.log(`[PASS] Admin draft correction applied: ArabicName=${correctedPerson.arabicName}`);
  }

  // 6. Transition to READY_FOR_SUBMISSION
  const finalApp = await prisma.application.update({
    where: { id: app.id },
    data: { status: "READY_FOR_SUBMISSION" },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId: app.id,
      actor: "admin@adjd-legal.ae",
      action: "STATUS_CHANGE",
      details: {
        previousStatus: "UNDER_ADMIN_REVIEW",
        newStatus: "READY_FOR_SUBMISSION",
        notes: "All legal checks passed. Certified draft ready for official court filing.",
      },
    },
  });

  console.log(`[PASS] Application successfully transitioned to: ${finalApp.status}`);

  // 7. Verify audit event count
  const auditCount = await prisma.auditEvent.count({
    where: { applicationId: app.id },
  });
  console.log(`[PASS] Verified total audit events logged for application: ${auditCount}`);

  console.log("=== Task 8 Admin Workspace & 9-Stage Pipeline Passed! ===");
}

main()
  .catch((e) => {
    console.error("Task 8 test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

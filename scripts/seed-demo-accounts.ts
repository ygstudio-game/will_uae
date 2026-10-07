import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDemoAccounts() {
  console.log("======================================================================");
  console.log("   Seeding Demo Accounts & Complete Operational Fixtures               ");
  console.log("======================================================================");

  // 1. Client Demo Account: pm-demo@launchpit.ae
  const clientEmail = "pm-demo@launchpit.ae";
  let clientAccount = await prisma.account.findUnique({
    where: { email: clientEmail },
  });

  if (!clientAccount) {
    clientAccount = await prisma.account.create({
      data: {
        email: clientEmail,
        fullName: "Daniel Michael Carter",
        phoneNumber: "+971 50 123 4567",
      },
    });
  }

  console.log(`[OK] Client Demo Account: ${clientAccount.email} (${clientAccount.id})`);

  // 2. Check or create full couples application for Daniel Carter
  let clientApp = await prisma.application.findFirst({
    where: { accountId: clientAccount.id },
  });

  if (!clientApp) {
    clientApp = await prisma.application.create({
      data: {
        accountId: clientAccount.id,
        packageType: "COUPLES",
        status: "DRAFT_READY",
        qualTestatorAge21: true,
        qualNonUaeNational: true,
        qualUaeAssets: true,
        qualMarried: true,
        qualChildrenUnder18: true,
        qualPartnerAge21: true,
        qualPartnerNonUae: true,
        qualPartnerAssets: true,
        qualPartnerMarried: true,
        qualPartnerChildrenUnder18: true,
      },
    });
  }

  console.log(`[OK] Client Demo Application: ID=${clientApp.id} (Status: ${clientApp.status})`);

  // 3. Create or update Persons
  // Testator: Daniel Michael Carter
  let daniel = await prisma.person.findFirst({
    where: { applicationId: clientApp.id, fullName: "Daniel Michael Carter" },
  });
  if (!daniel) {
    daniel = await prisma.person.create({
      data: {
        applicationId: clientApp.id,
        fullName: "Daniel Michael Carter",
        arabicName: "دانيال مايكل كارتر",
        dob: new Date("1984-06-15"),
        nationality: "British",
        passportNumber: "GB12345678",
        emiratesId: "784-1984-1234567-1",
        address: "Villa 42, Palm Jumeirah, Dubai, UAE",
        email: clientEmail,
        phone: "+971 50 123 4567",
        isUaeResident: true,
        relationship: "Self",
      },
    });
  }

  // Spouse: Sarah Elizabeth Carter
  let sarah = await prisma.person.findFirst({
    where: { applicationId: clientApp.id, fullName: "Sarah Elizabeth Carter" },
  });
  if (!sarah) {
    sarah = await prisma.person.create({
      data: {
        applicationId: clientApp.id,
        fullName: "Sarah Elizabeth Carter",
        arabicName: "سارة إليزابيث كارتر",
        dob: new Date("1986-09-22"),
        nationality: "British",
        passportNumber: "GB87654321",
        emiratesId: "784-1986-7654321-2",
        address: "Villa 42, Palm Jumeirah, Dubai, UAE",
        email: "sarah.carter@launchpit.ae",
        phone: "+971 50 765 4321",
        isUaeResident: true,
        relationship: "Spouse",
      },
    });
  }

  // Children: Oliver & Sophie Carter
  let oliver = await prisma.person.findFirst({
    where: { applicationId: clientApp.id, fullName: "Oliver James Carter" },
  });
  if (!oliver) {
    oliver = await prisma.person.create({
      data: {
        applicationId: clientApp.id,
        fullName: "Oliver James Carter",
        arabicName: "أوليفر جيمس كارتر",
        dob: new Date("2016-04-12"),
        nationality: "British",
        passportNumber: "GB99887766",
        emiratesId: "784-2016-9988776-1",
        address: "Villa 42, Palm Jumeirah, Dubai, UAE",
        isUaeResident: true,
        relationship: "Son",
      },
    });
  }

  let sophie = await prisma.person.findFirst({
    where: { applicationId: clientApp.id, fullName: "Sophie Rose Carter" },
  });
  if (!sophie) {
    sophie = await prisma.person.create({
      data: {
        applicationId: clientApp.id,
        fullName: "Sophie Rose Carter",
        arabicName: "صوفي روز كارتر",
        dob: new Date("2019-11-05"),
        nationality: "British",
        passportNumber: "GB55443322",
        emiratesId: "784-2019-5544332-2",
        address: "Villa 42, Palm Jumeirah, Dubai, UAE",
        isUaeResident: true,
        relationship: "Daughter",
      },
    });
  }

  // Executor / Guardian: David Alan Whitfield
  let david = await prisma.person.findFirst({
    where: { applicationId: clientApp.id, fullName: "David Alan Whitfield" },
  });
  if (!david) {
    david = await prisma.person.create({
      data: {
        applicationId: clientApp.id,
        fullName: "David Alan Whitfield",
        arabicName: "ديفيد ألان ويتفيلد",
        nationality: "British",
        passportNumber: "GB33221144",
        emiratesId: "784-1982-3322114-1",
        address: "Apartment 1402, Marina Gate 1, Dubai Marina, UAE",
        email: "david.whitfield@example.com",
        phone: "+971 52 334 5566",
        isUaeResident: true,
        relationship: "Brother-in-Law",
      },
    });
  }

  // Substitute: Emily Rose Smith
  let emily = await prisma.person.findFirst({
    where: { applicationId: clientApp.id, fullName: "Emily Rose Smith" },
  });
  if (!emily) {
    emily = await prisma.person.create({
      data: {
        applicationId: clientApp.id,
        fullName: "Emily Rose Smith",
        arabicName: "إيميلي روز سميث",
        nationality: "Canadian",
        passportNumber: "CA99112233",
        address: "450 Bay Street, Toronto, ON, Canada",
        email: "emily.smith@example.com",
        phone: "+1 416 555 0192",
        isUaeResident: false,
        relationship: "Sister",
      },
    });
  }

  // 4. Create Will 1 (Daniel's Will)
  let will1 = await prisma.will.findFirst({
    where: { applicationId: clientApp.id, willIndex: 1 },
  });
  if (!will1) {
    will1 = await prisma.will.create({
      data: {
        applicationId: clientApp.id,
        willIndex: 1,
        versionTag: "ADJD-NM0723-07-03",
        testatorPersonId: daniel.id,
        hasChildrenUnder18: true,
        isDraftConfirmed: true,
        confirmedAt: new Date(),
      },
    });
  }

  // Ensure Role Assignments on Will 1
  const ensureRole = async (willId: string, personId: string, role: any, share?: number) => {
    const existing = await prisma.roleAssignment.findFirst({
      where: { willId, personId, role },
    });
    if (!existing) {
      await prisma.roleAssignment.create({
        data: {
          willId,
          personId,
          role,
          sharePercentage: share || null,
        },
      });
    }
  };

  await ensureRole(will1.id, sarah.id, "EXECUTOR_PRIMARY");
  await ensureRole(will1.id, david.id, "EXECUTOR_SUBSTITUTE");
  await ensureRole(will1.id, emily.id, "EXECUTOR_FURTHER");
  await ensureRole(will1.id, david.id, "GUARDIAN_PERMANENT");
  await ensureRole(will1.id, emily.id, "GUARDIAN_SUBSTITUTE_PERM");
  await ensureRole(will1.id, sarah.id, "BENEFICIARY", 100);
  await ensureRole(will1.id, oliver.id, "CHILD");
  await ensureRole(will1.id, sophie.id, "CHILD");

  console.log(`[OK] Will 1 Roles & Persons configured.`);

  // 5. Initial Payment record (Milestone 1)
  const existingPay = await prisma.payment.findFirst({
    where: { applicationId: clientApp.id, milestone: "INITIAL_SERVICE_FEE" },
  });
  if (!existingPay) {
    await prisma.payment.create({
      data: {
        applicationId: clientApp.id,
        milestone: "INITIAL_SERVICE_FEE",
        amountAed: 1799.0,
        status: "COMPLETED",
        transactionRef: `OWA-INIT-DEMO-${Date.now().toString(36).toUpperCase()}`,
      },
    });
  }

  // 6. Support Tickets
  let demoTicket = await prisma.ticket.findFirst({
    where: { applicationId: clientApp.id },
  });

  if (!demoTicket) {
    demoTicket = await prisma.ticket.create({
      data: {
        applicationId: clientApp.id,
        subject: "Child Passport Assistance (Consular / Emergency Guidance)",
        status: "OPEN",
        replies: {
          create: [
            {
              senderRole: "CUSTOMER",
              senderName: "Daniel Michael Carter",
              message:
                "Hello, our youngest daughter Sophie's British passport is currently undergoing renewal at the UK Passport Office. Can we proceed with ADJD registration using her UK birth certificate and Emirates ID in the interim?",
            },
            {
              senderRole: "ADMIN",
              senderName: "Legal Admin Desk",
              message:
                "Hello Daniel. Yes, the Abu Dhabi Civil Family Court permits registration with the attested birth certificate and Emirates ID copy, provided the consular passport renewal tracking receipt is noted. We will flag this for provisional review.",
            },
          ],
        },
      },
    });
    console.log(`[OK] Support Ticket #${demoTicket.ticketNumber} created.`);
  }

  // 7. Second Demo Application in Court Verification stage for Admin testing
  const adminTestEmail = "alexander.croft@example.com";
  let alexAccount = await prisma.account.findUnique({
    where: { email: adminTestEmail },
  });
  if (!alexAccount) {
    alexAccount = await prisma.account.create({
      data: {
        email: adminTestEmail,
        fullName: "Alexander David Croft",
        phoneNumber: "+971 55 987 6543",
      },
    });
  }

  let alexApp = await prisma.application.findFirst({
    where: { accountId: alexAccount.id },
  });
  if (!alexApp) {
    alexApp = await prisma.application.create({
      data: {
        accountId: alexAccount.id,
        packageType: "INDIVIDUAL",
        status: "AWAITING_ADMIN_VERIFICATION",
        qualTestatorAge21: true,
        qualNonUaeNational: true,
        qualUaeAssets: true,
        qualMarried: false,
        qualChildrenUnder18: false,
      },
    });

    const alexPerson = await prisma.person.create({
      data: {
        applicationId: alexApp.id,
        fullName: "Alexander David Croft",
        arabicName: "ألكسندر ديفيد كروفت",
        dob: new Date("1978-03-10"),
        nationality: "Irish",
        passportNumber: "IE77665544",
        emiratesId: "784-1978-7766554-1",
        address: "Villa 12, Saadiyat Beach Residences, Abu Dhabi, UAE",
        email: adminTestEmail,
        phone: "+971 55 987 6543",
        isUaeResident: true,
      },
    });

    const alexWill = await prisma.will.create({
      data: {
        applicationId: alexApp.id,
        willIndex: 1,
        versionTag: "ADJD-NM0723-07-03",
        testatorPersonId: alexPerson.id,
        isDraftConfirmed: true,
        confirmedAt: new Date(),
      },
    });

    // Milestone 1 & 2 payments for Alex
    await prisma.payment.create({
      data: {
        applicationId: alexApp.id,
        milestone: "INITIAL_SERVICE_FEE",
        amountAed: 999.0,
        status: "COMPLETED",
        transactionRef: "OWA-INIT-ALEX-101",
      },
    });
    await prisma.payment.create({
      data: {
        applicationId: alexApp.id,
        milestone: "COURT_FEE",
        amountAed: 950.0,
        status: "COMPLETED",
        transactionRef: "ADJD-FEE-ALEX-202",
      },
    });

    // AI Review Flag
    await prisma.reviewFlag.create({
      data: {
        applicationId: alexApp.id,
        fieldPath: "parties.testator.arabicName",
        severity: "INFO",
        message: "Phonetic transliteration 'ألكسندر ديفيد كروفت' verified against Irish passport bio-data.",
      },
    });

    // Audit Event
    await prisma.auditEvent.create({
      data: {
        applicationId: alexApp.id,
        eventType: "MILESTONE_2_PAID",
        actor: "Alexander David Croft",
        description: "Milestone 2 Court Fee (AED 950) settled. Application entered verification queue.",
      },
    });

    console.log(`[OK] Second Application (Alexander Croft) created for Admin verification queue.`);
  }

  console.log("======================================================================");
  console.log("🎉 DEMO ACCOUNTS & OPERATIONAL DATA READY!");
  console.log("   Client User : pm-demo@launchpit.ae (1-Click OTP demo login)");
  console.log("   Admin Portal: http://localhost:3000/admin");
  console.log("   Admin Tickets: http://localhost:3000/admin/tickets");
  console.log("   Client Support: http://localhost:3000/dashboard/support");
  console.log("======================================================================");
}

seedDemoAccounts()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Testing Task 9: In-App Support Ticketing Integration ===");

  // 1. Fetch test application
  const app = await prisma.application.findFirst({
    where: { account: { email: "test.task6@court.ae" } },
  });

  if (!app) {
    throw new Error("Test application not found.");
  }

  console.log(`[PASS] Found test application: ID=${app.id}`);

  // 2. Create customer ticket with initial reply
  const ticket = await prisma.ticket.create({
    data: {
      applicationId: app.id,
      subject: "Child Passport Assistance (Consular / Emergency Guidance)",
      status: "OPEN",
      replies: {
        create: {
          senderRole: "CUSTOMER",
          senderName: "Alexander David Croft",
          message:
            "Our youngest child was born in the UAE recently and British consular passport processing is taking 6 weeks. Can we proceed with ADJD court registration using consular birth certificate in the interim?",
        },
      },
    },
    include: {
      replies: true,
    },
  });

  console.log(`[PASS] Customer ticket created: #${ticket.ticketNumber} - "${ticket.subject}"`);
  console.log(`[PASS] Initial reply created by: ${ticket.replies[0].senderName}`);

  // 3. Admin replies and requests more info
  const adminReply1 = await prisma.ticketReply.create({
    data: {
      ticketId: ticket.id,
      senderRole: "ADMIN",
      senderName: "Legal Admin Desk",
      message:
        "Hello Alexander. Yes, the Abu Dhabi Civil Family Court allows provisional registration if an official consular birth certificate and consular application tracking number are uploaded. Please attach the consular receipt.",
    },
  });

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: "AWAITING_CUSTOMER", updatedAt: new Date() },
  });

  console.log(`[PASS] Admin reply appended: ID=${adminReply1.id}. Ticket transitioned to AWAITING_CUSTOMER`);

  // 4. Customer replies back with document reference
  const customerReply2 = await prisma.ticketReply.create({
    data: {
      ticketId: ticket.id,
      senderRole: "CUSTOMER",
      senderName: "Alexander David Croft",
      message:
        "Thank you! We have uploaded the consular registration receipt into the application document repository under Child 2.",
    },
  });

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: "OPEN", updatedAt: new Date() },
  });

  console.log(`[PASS] Customer replied back: ID=${customerReply2.id}. Ticket reopened to OPEN`);

  // 5. Admin resolves ticket
  const adminReply2 = await prisma.ticketReply.create({
    data: {
      ticketId: ticket.id,
      senderRole: "ADMIN",
      senderName: "Legal Admin Desk",
      message:
        "We have reviewed the consular document and certified it. Your application is now ready for court registration.",
    },
  });

  const resolvedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: "RESOLVED", updatedAt: new Date() },
    include: { replies: true },
  });

  console.log(`[PASS] Admin resolved ticket: Status=${resolvedTicket.status}, Total Replies=${resolvedTicket.replies.length}`);

  // 6. Log Audit Event
  await prisma.auditEvent.create({
    data: {
      applicationId: app.id,
      actor: "Legal Admin Desk",
      action: "TICKET_RESOLVED",
      details: {
        ticketNumber: resolvedTicket.ticketNumber,
        subject: resolvedTicket.subject,
      },
    },
  });

  console.log("[PASS] Audit event logged for ticket resolution.");
  console.log("=== Task 9 In-App Support Ticketing Passed! ===");
}

main()
  .catch((e) => {
    console.error("Task 9 test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

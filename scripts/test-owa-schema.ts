import { prisma } from "../lib/prisma";

async function main() {
  console.log("Checking OWA models in Prisma...");

  // Test Application model
  const apps = await prisma.application.findMany({ take: 1 });
  console.log("Application model exists, count:", apps.length);

  // Test Person model
  const persons = await prisma.person.findMany({ take: 1 });
  console.log("Person model exists, count:", persons.length);

  // Test Payment model
  const payments = await prisma.payment.findMany({ take: 1 });
  console.log("Payment model exists, count:", payments.length);

  // Test Ticket model
  const tickets = await prisma.ticket.findMany({ take: 1 });
  console.log("Ticket model exists, count:", tickets.length);

  // Test Will model
  const wills = await prisma.will.findMany({ take: 1 });
  console.log("Will model exists, count:", wills.length);

  console.log("✓ All OWA models verified in database!");
}

main()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

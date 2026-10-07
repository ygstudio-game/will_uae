import { PrismaClient, WillStatus, WillType, PartyType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to Neon Postgres...");

  // 1. Create or upsert test user
  const user = await prisma.user.upsert({
    where: { email: "daniel@example.com" },
    update: {},
    create: {
      email: "daniel@example.com",
      name: "Daniel Michael Carter",
      passwordHash: "demo_hash_secure",
    },
  });

  console.log(`User seeded: ${user.name} (${user.id})`);

  // 2. Check if a will exists or create one
  const existingWill = await prisma.will.findFirst({
    where: { userId: user.id },
  });

  if (!existingWill) {
    const will = await prisma.will.create({
      data: {
        userId: user.id,
        status: WillStatus.REVIEW,
        currentStep: 15,
        willType: WillType.INDIVIDUAL,
        fullName: "Daniel Michael Carter",
        arabicName: "دانيال مايكل كارتر",
        dob: new Date("1984-05-14"),
        nationality: "British",
        passportNumber: "P987654321",
        emiratesId: "784-1984-1234567-1",
        isUaeResident: true,
        residentialAddress: "Villa 42, Palm Jumeirah, Dubai, UAE",
        emailAddress: "daniel@example.com",
        contactNumber: "+971 50 123 4567",
        domicileCountry: "United Arab Emirates",
        hasChildren: true,
        hasTitledAssets: true,
        declarationConfirmed: true,
        debtsConfirmed: true,
        wishesConfirmed: true,
        jurisdictionConfirmed: true,
        insuranceConfirmed: true,
        powersConfirmed: true,
        executionConfirmed: true,
        parties: {
          create: [
            {
              partyType: PartyType.PRIMARY_EXECUTOR,
              fullName: "Sarah Elizabeth Carter",
              arabicName: "سارة إليزابيث كارتر",
              nationality: "British",
              passportNumber: "P112233445",
              emiratesId: "784-1986-7654321-2",
              address: "Villa 42, Palm Jumeirah, Dubai, UAE",
              email: "sarah.carter@example.com",
              phone: "+971 50 765 4321",
              isArabicApproved: true,
            },
            {
              partyType: PartyType.SUBSTITUTE_EXECUTOR,
              fullName: "Robert William Smith",
              arabicName: "روبرت ويليام سميث",
              nationality: "British",
              passportNumber: "P998877665",
              emiratesId: "784-1980-9988776-3",
              address: "Apt 1204, Downtown Views, Dubai, UAE",
              email: "robert.smith@example.com",
              phone: "+971 52 987 6543",
              isArabicApproved: true,
            },
            {
              partyType: PartyType.PRIMARY_BENEFICIARY,
              fullName: "Sarah Elizabeth Carter",
              arabicName: "سارة إليزابيث كارتر",
              sharePercentage: 100,
              isArabicApproved: true,
            },
          ],
        },
        children: {
          create: [
            {
              fullName: "Oliver James Carter",
              arabicName: "أوليفر جيمس كارتر",
              dob: new Date("2015-08-20"),
              nationality: "British",
              passportNumber: "P554433221",
            },
            {
              fullName: "Emma Grace Carter",
              arabicName: "إيما غريس كارتر",
              dob: new Date("2018-03-12"),
              nationality: "British",
              passportNumber: "P665544332",
            },
          ],
        },
        assets: {
          create: [
            {
              assetType: "Immovable Property",
              description: "Villa 42, Palm Jumeirah, Frond M",
              emirate: "Dubai",
              titleDeedNumber: "102938475",
            },
            {
              assetType: "Bank Account",
              description: "Emirates NBD Current Account (AED)",
              emirate: "Dubai",
              titleDeedNumber: "AE120260001234567890123",
            },
          ],
        },
      },
    });

    console.log(`Will record created successfully: Will #${will.willNumber} (ID: ${will.id})`);
  } else {
    console.log(`Will record already exists: Will #${existingWill.willNumber} (ID: ${existingWill.id})`);
  }

  const countWills = await prisma.will.count();
  const countUsers = await prisma.user.count();
  const countParties = await prisma.party.count();
  const countChildren = await prisma.child.count();
  const countAssets = await prisma.asset.count();

  console.log(`\n========================================`);
  console.log(`✓ Neon Serverless PostgreSQL is fully synced & connected!`);
  console.log(`- Users: ${countUsers}`);
  console.log(`- Wills: ${countWills}`);
  console.log(`- Parties (Executors/Beneficiaries): ${countParties}`);
  console.log(`- Children: ${countChildren}`);
  console.log(`- Assets: ${countAssets}`);
  console.log(`========================================\n`);
}

main()
  .catch((e) => {
    console.error("Error connecting to Neon database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

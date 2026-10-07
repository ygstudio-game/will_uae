import { prisma } from "../lib/prisma";
import { generateOtp, verifyOtpCode, createSessionToken, verifySessionToken } from "../lib/auth-otp";

async function main() {
  console.log("Testing OTP generation and verification...");

  const testEmail = "test.otp.user@example.com";
  const testName = "Jane Doe";

  // 1. Create or find test account
  let account = await prisma.account.findUnique({ where: { email: testEmail } });
  if (!account) {
    account = await prisma.account.create({
      data: {
        email: testEmail,
        fullName: testName,
      },
    });
  }

  // 2. Generate OTP
  const otpCode = await generateOtp(account.id);
  console.log("Generated OTP code:", otpCode);
  if (!otpCode || otpCode.length !== 6) {
    throw new Error("Invalid OTP code generated");
  }

  // 3. Verify OTP
  const isValid = await verifyOtpCode(account.id, otpCode);
  if (!isValid) {
    throw new Error("OTP verification failed for valid code");
  }
  console.log("✓ Valid OTP code verified successfully!");

  // 4. Test wrong OTP
  const isWrongValid = await verifyOtpCode(account.id, "000000");
  if (isWrongValid) {
    throw new Error("Wrong OTP unexpectedly passed verification");
  }
  console.log("✓ Invalid OTP code rejected successfully!");

  // 5. Test session token creation and verification
  const token = await createSessionToken({
    accountId: account.id,
    email: account.email,
    name: account.fullName,
  });
  const session = await verifySessionToken(token);
  if (!session || session.accountId !== account.id) {
    throw new Error("Session token verification failed");
  }
  console.log("✓ Session token verified successfully!");

  console.log("✓ All OTP Auth tests passed!");
}

main()
  .catch((err) => {
    console.error("Test failed:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

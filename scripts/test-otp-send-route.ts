import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

async function testOtpSend() {
  console.log("Testing POST /api/auth/otp/send logic with live Hostinger SMTP...");
  const { prisma } = await import("../lib/prisma");
  const { generateOtp, verifyOtpCode } = await import("../lib/auth-otp");
  const { sendOTPEmail } = await import("../lib/email");

  const testEmail = "support@onlinewillsadvisor.com";
  console.log(`Target email: ${testEmail}`);

  let account = await prisma.account.findUnique({
    where: { email: testEmail },
  });

  if (!account) {
    account = await prisma.account.create({
      data: {
        email: testEmail,
        fullName: "OWA Support Account",
      },
    });
    console.log("Created test account:", account.id);
  } else {
    console.log("Found existing account:", account.id);
  }

  const code = await generateOtp(account.id);
  console.log(`Generated OTP code: ${code}`);

  console.log("Sending OTP email via Hostinger SMTP...");
  const sent = await sendOTPEmail(testEmail, code);
  if (!sent) {
    throw new Error("Failed to send OTP email via Hostinger SMTP");
  }
  console.log("✅ OTP Email dispatched successfully via Hostinger SMTP!");

  console.log("Verifying OTP code in database...");
  const isValid = await verifyOtpCode(account.id, code);
  if (!isValid) {
    throw new Error("OTP verification in DB failed");
  }
  console.log("✅ OTP verified and consumed from DB successfully!");
}

testOtpSend()
  .then(() => {
    console.log("All OTP tests passed!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });


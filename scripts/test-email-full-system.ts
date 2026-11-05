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

async function runFullSystemTest() {
  console.log("==================================================");
  console.log("🚀 Running Complete Email Subsystem Smoke Tests");
  console.log("==================================================");

  const {
    sendOTPEmail,
    sendOnboardingWelcomeEmail,
    sendPaymentReceiptEmail,
    sendTicketAlertToSupport,
    sendTicketReplyToUser,
  } = await import("../lib/email");

  const targetEmail = "support@onlinewillsadvisor.com";

  // 1. Test OTP
  console.log("\n[1/5] Testing sendOTPEmail...");
  const otpRes = await sendOTPEmail(targetEmail, "482910");
  if (!otpRes) throw new Error("sendOTPEmail failed");
  console.log("✓ OTP email delivered.");

  // 2. Test Welcome Onboarding
  console.log("\n[2/5] Testing sendOnboardingWelcomeEmail...");
  const welcomeRes = await sendOnboardingWelcomeEmail(targetEmail, "David Alan Whitfield");
  if (!welcomeRes) throw new Error("sendOnboardingWelcomeEmail failed");
  console.log("✓ Welcome email delivered.");

  // 3. Test Payment Receipt
  console.log("\n[3/5] Testing sendPaymentReceiptEmail...");
  const receiptRes = await sendPaymentReceiptEmail({
    email: targetEmail,
    name: "David Alan Whitfield",
    amountAed: 1799,
    transactionRef: `TEST-REF-${Date.now()}`,
    packageType: "COUPLES",
  });
  if (!receiptRes) throw new Error("sendPaymentReceiptEmail failed");
  console.log("✓ Payment receipt email delivered.");

  // 4. Test Support Ticket Alert
  console.log("\n[4/5] Testing sendTicketAlertToSupport...");
  const alertRes = await sendTicketAlertToSupport({
    ticketNumber: 1042,
    subject: "Arabic Phonetic Transliteration Review",
    message: "Kindly verify the phonetic transliteration of my partner's middle name for the ADJD court form.",
    senderName: "David Alan Whitfield",
    senderEmail: targetEmail,
    applicationId: "app-test-couples-01",
  });
  if (!alertRes) throw new Error("sendTicketAlertToSupport failed");
  console.log("✓ Support ticket alert delivered.");

  // 5. Test Support Ticket Reply
  console.log("\n[5/5] Testing sendTicketReplyToUser...");
  const replyRes = await sendTicketReplyToUser({
    userEmail: targetEmail,
    userName: "David Alan Whitfield",
    ticketNumber: 1042,
    subject: "Arabic Phonetic Transliteration Review",
    replyMessage: "Your transliteration has been certified by our bilingual legal consultant and synced to your Section Two draft.",
    senderRole: "ADMIN",
  });
  if (!replyRes) throw new Error("sendTicketReplyToUser failed");
  console.log("✓ Staff ticket reply delivered.");

  console.log("\n==================================================");
  console.log("🎉 ALL 5 EMAIL SUBSYSTEM MODULES PASSED WITH 100% SUCCESS!");
  console.log("==================================================");
}

runFullSystemTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});


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

async function testTemplates() {
  console.log("Loading lib/email...");
  const emailModule = await import("../lib/email");

  console.log("Verifying exported email functions:");
  console.log("- sendOTPEmail:", typeof emailModule.sendOTPEmail);
  console.log("- sendOnboardingWelcomeEmail:", typeof emailModule.sendOnboardingWelcomeEmail);
  console.log("- sendPaymentReceiptEmail:", typeof emailModule.sendPaymentReceiptEmail);
  console.log("- sendTicketAlertToSupport:", typeof emailModule.sendTicketAlertToSupport);
  console.log("- sendTicketReplyToUser:", typeof emailModule.sendTicketReplyToUser);

  if (
    typeof emailModule.sendOTPEmail !== "function" ||
    typeof emailModule.sendOnboardingWelcomeEmail !== "function" ||
    typeof emailModule.sendPaymentReceiptEmail !== "function" ||
    typeof emailModule.sendTicketAlertToSupport !== "function" ||
    typeof emailModule.sendTicketReplyToUser !== "function"
  ) {
    throw new Error("One or more email functions are not exported correctly!");
  }

  console.log("✅ All email methods and templates imported successfully!");
}

testTemplates().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});


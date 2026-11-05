import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

// Simple zero-dependency .env.local loader
try {
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
} catch (e) {
  console.warn("Could not read .env.local", e);
}

async function main() {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "noreply@onlinewillsadvisor.com";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.SMTP_FROM || `"Online Wills Advisor" <${user}>`;
  const targetEmail = process.env.SUPPORT_EMAIL || "support@onlinewillsadvisor.com";

  console.log("--------------------------------------------------");
  console.log("Testing Hostinger SMTP Connectivity & Auth...");
  console.log(`Host: ${host}:${port} (SSL/TLS: ${secure})`);
  console.log(`User: ${user}`);
  console.log(`Recipient: ${targetEmail}`);
  console.log("--------------------------------------------------");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  try {
    console.log("Verifying connection credentials with SMTP server...");
    await transporter.verify();
    console.log("✅ SMTP Server connection & authentication successful!");

    console.log(`Sending live test email to ${targetEmail}...`);
    const info = await transporter.sendMail({
      from,
      to: targetEmail,
      subject: "Test: Hostinger Business Email Integration Verification",
      text: "Hello! This is a test email sent from the Online Wills Advisor platform using Hostinger SMTP. Everything is working correctly.",
      html: `
        <div style="font-family: Arial, sans-serif; background: #FBF9F5; padding: 32px 16px;">
          <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 12px; padding: 28px;">
            <h2 style="color: #0B1528; margin-top: 0;">Online Wills Advisor</h2>
            <p style="color: #333; font-size: 15px; line-height: 1.5;">
              This is a test notification confirming that <strong>Hostinger SMTP</strong> (<code>${host}:${port}</code>) is operational and authenticated for <strong>${user}</strong>.
            </p>
            <div style="background: #F5F1E9; border-left: 4px solid #A37E44; padding: 12px 16px; margin: 20px 0; font-size: 14px; color: #4A4036;">
              Timestamp: ${new Date().toISOString()}<br/>
              Status: Ready for OTP, Onboarding & Support
            </div>
            <p style="color: #777; font-size: 12px; margin-bottom: 0;">
              SP LEGAL FZ LLE · Online Wills Advisor Platform
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (error: any) {
    console.error("❌ SMTP Error:", error);
    process.exit(1);
  }
}

main();

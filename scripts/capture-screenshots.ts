import { chromium } from "playwright-core";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { createSessionToken } from "../lib/auth-otp";

const prisma = new PrismaClient();

async function captureAllScreenshots() {
  const screenshotsDir = path.join(process.cwd(), "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log("======================================================================");
  console.log("   Capturing High-Resolution Screenshots for All Platform Pages       ");
  console.log(`   Destination: ${screenshotsDir}`);
  console.log("======================================================================");

  // Find system browser executable
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  console.log(`[OK] Using browser binary: ${executablePath}`);

  // Fetch client demo account
  const client = await prisma.account.findUnique({
    where: { email: "pm-demo@launchpit.ae" },
    include: {
      applications: {
        include: { wills: true },
      },
    },
  });

  if (!client) {
    throw new Error("Client demo account not found. Run scripts/seed-demo-accounts.ts first.");
  }

  const app = client.applications[0];
  const sessionToken = await createSessionToken({
    accountId: client.id,
    email: client.email,
    name: client.fullName,
  });

  // Launch browser
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Retina 2x quality
  });

  // Set session cookie
  await context.addCookies([
    {
      name: "will_session",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();

  const take = async (urlPath: string, filename: string, title: string, waitSelector?: string) => {
    console.log(`--> Capturing [${title}] -> ${filename}...`);
    await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: "networkidle", timeout: 30000 });
    if (waitSelector) {
      await page.waitForSelector(waitSelector, { timeout: 10000 }).catch(() => {});
    }
    await page.waitForTimeout(1500); // Wait for animations / fonts
    await page.screenshot({
      path: path.join(screenshotsDir, filename),
      fullPage: true,
    });
    console.log(`    [DONE] Saved: screenshots/${filename}`);
  };

  try {
    // 1. Landing Page
    await take("/", "01-landing-page.png", "Landing Page (Hero & Legal Overview)");

    // 2. Pre-Payment 7-Question Qualification Intake
    await take("/start", "02-qualification-intake.png", "Qualification Intake (/start)");

    // 3. Email OTP Login
    await take("/auth/otp", "03-email-otp-login.png", "Passwordless OTP Login (/auth/otp)");

    // 4. Questionnaire Wizard: Section A (Details)
    await take(`/wizard/details?applicationId=${app.id}`, "04-wizard-section-a-details.png", "Wizard: Section A Details");

    // 5. Questionnaire Wizard: Section B (Children)
    await take(`/wizard/children?applicationId=${app.id}`, "05-wizard-section-b-children.png", "Wizard: Section B Children");

    // 6. Questionnaire Wizard: Section C (Executors)
    await take(`/wizard/executors?applicationId=${app.id}`, "06-wizard-section-c-executors.png", "Wizard: Section C Executors");

    // 7. Questionnaire Wizard: Section D (Guardians)
    await take(`/wizard/guardians?applicationId=${app.id}`, "07-wizard-section-d-guardians.png", "Wizard: Section D Guardians");

    // 8. Questionnaire Wizard: Section E (Beneficiaries)
    await take(`/wizard/beneficiaries?applicationId=${app.id}`, "08-wizard-section-e-beneficiaries.png", "Wizard: Section E Beneficiaries");

    // 9. Questionnaire Wizard: Section F (Review & Court Draft Preview)
    await take(`/wizard/review?applicationId=${app.id}`, "09-wizard-section-f-review-draft.png", "Wizard: Section F Review Draft");

    // 10. Customer Lifecycle Dashboard
    await take(`/dashboard?applicationId=${app.id}`, "10-customer-dashboard.png", "Customer Dashboard 9-Stage Tracker");

    // 11. Milestone 2 Court Fee Checkout
    await take(`/checkout/court-fee?applicationId=${app.id}`, "11-court-fee-milestone-checkout.png", "Court Fee Checkout");

    // 12. Customer Legal Support Desk
    await take(`/dashboard/support`, "12-customer-support-ticketing.png", "Customer Support Ticketing Desk");

    // 13. Admin Dashboard & 9-Stage Queue
    await take("/admin", "13-admin-dashboard-queue.png", "Admin Applications Queue");

    // 14. Admin Application Review & Draft In-Place Corrections
    await take(`/admin/applications/${app.id}`, "14-admin-application-review.png", "Admin Application Review & Draft Corrections");

    // 15. Admin Support Resolution Desk
    await take("/admin/tickets", "15-admin-tickets-desk.png", "Admin Support Tickets Desk");

    console.log("======================================================================");
    console.log("🎉 ALL 15 HIGH-RESOLUTION SCREENSHOTS SUCCESSFULLY CAPTURED!");
    console.log(`📁 Saved in: ${screenshotsDir}`);
    console.log("======================================================================");
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

captureAllScreenshots().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});

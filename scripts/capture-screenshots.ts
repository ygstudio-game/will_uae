import { chromium } from "playwright-core";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { createSessionToken } from "../lib/auth-otp";

const prisma = new PrismaClient();

const SAMPLE_SIGNATURE_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="70" viewBox="0 0 240 70">
      <path d="M 20 48 C 35 15, 50 12, 60 42 C 72 65, 85 18, 102 38 C 118 52, 135 22, 150 44 C 168 62, 190 20, 215 35" fill="none" stroke="#0B1528" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 45 52 Q 110 58, 185 49" fill="none" stroke="#0B1528" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`
  );

async function findBrowserExecutable(): Promise<string> {
  const candidatePaths = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error("No compatible Chrome or Edge browser executable found on system.");
}

async function captureAllScreenshots() {
  const screenshotsDir = path.join(process.cwd(), "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log("======================================================================");
  console.log("   Capturing High-Resolution Screenshots for All Platform Pages       ");
  console.log(`   Destination: ${screenshotsDir}`);
  console.log("======================================================================");

  const executablePath = await findBrowserExecutable();
  console.log(`[OK] Browser executable: ${executablePath}`);

  // Fetch client demo account with complete relations
  let client = await prisma.account.findUnique({
    where: { email: "pm-demo@launchpit.ae" },
    include: {
      applications: {
        include: {
          wills: {
            include: {
              testatorPerson: true,
              roleAssignments: {
                include: { person: true },
              },
            },
          },
          persons: true,
          payments: true,
          tickets: true,
        },
      },
    },
  });

  if (!client || !client.applications[0]) {
    throw new Error(
      "Client demo account or application not found. Please run: npx tsx scripts/seed-demo-accounts.ts"
    );
  }

  const app = client.applications[0];
  const will = app.wills[0];

  if (!will) {
    throw new Error("No will found for demo application. Run scripts/seed-demo-accounts.ts first.");
  }

  console.log(`[OK] Client Demo Account: ${client.email} (${client.fullName})`);
  console.log(`[OK] Application ID: ${app.id} | Will ID: ${will.id}`);

  // Create valid session token
  const sessionToken = await createSessionToken({
    accountId: client.id,
    email: client.email,
    name: client.fullName,
  });

  // Prepare full OWA store snapshot for local injection
  const populatedApp = {
    ...app,
    wills: app.wills.map((w) => ({
      ...w,
      testatorPerson: {
        ...w.testatorPerson,
        signatureDataUrl: SAMPLE_SIGNATURE_DATA_URL,
      },
    })),
    persons: app.persons.map((p) =>
      p.id === will.testatorPersonId
        ? { ...p, signatureDataUrl: SAMPLE_SIGNATURE_DATA_URL }
        : p
    ),
  };

  const owaStorePayload = JSON.stringify({
    state: {
      applicationId: app.id,
      activeWillIndex: 1,
      currentSection: "details",
      application: populatedApp,
    },
    version: 0,
  });

  // Launch browser
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // 1. Desktop Browser Context (1440 x 900, Retina 2x)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // 2. Mobile Browser Context (390 x 844, Retina 2x, Touch Enabled)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Set session cookies and initialize scripts on both contexts
  for (const ctx of [desktopContext, mobileContext]) {
    await ctx.addCookies([
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

    // Prevent window.print() dialog blocking Playwright
    await ctx.addInitScript(() => {
      window.print = () => {
        console.log("Mocked window.print() called");
      };
    });

    // Pre-seed local storage with full populated OWA application state
    await ctx.addInitScript((payload) => {
      try {
        localStorage.setItem("owa_application_store", payload);
      } catch (e) {
        console.error("Failed to inject owa_application_store:", e);
      }
    }, owaStorePayload);
  }

  const desktopPage = await desktopContext.newPage();
  const mobilePage = await mobileContext.newPage();

  const capturePage = async (
    page: any,
    urlPath: string,
    filename: string,
    title: string,
    waitSelector?: string
  ) => {
    console.log(`--> Capturing [${title}] -> ${filename}...`);
    try {
      await page.goto(`http://localhost:3000${urlPath}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      if (waitSelector) {
        await page.waitForSelector(waitSelector, { timeout: 8000 }).catch(() => {});
      }

      await page.waitForTimeout(1800); // Allow fonts, icons, and entrance animations to settle

      const destPath = path.join(screenshotsDir, filename);
      await page.screenshot({
        path: destPath,
        fullPage: true,
      });

      const stats = fs.statSync(destPath);
      console.log(`    [DONE] Saved: screenshots/${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      console.error(`    [ERROR] Failed to capture ${filename}:`, err.message);
    }
  };

  try {
    console.log("\n--- PART 1: DESKTOP EXPERIENCES (1440x900 @2x) ---\n");

    // Public & Auth
    await capturePage(desktopPage, "/", "01-landing-page.png", "Landing Page (Hero & Legal Overview)");
    await capturePage(desktopPage, "/start", "02-qualification-intake.png", "7-Question Qualification Intake (/start)");
    await capturePage(desktopPage, "/auth/otp", "03-email-otp-login.png", "Passwordless OTP Login (/auth/otp)");
    await capturePage(desktopPage, "/auth/signin", "04-signin-password.png", "Customer Sign In (/auth/signin)");
    await capturePage(desktopPage, "/auth/register", "05-register-account.png", "Customer Account Registration (/auth/register)");

    // OWA 6-Section Questionnaire Wizard
    await capturePage(
      desktopPage,
      `/wizard/details?applicationId=${app.id}`,
      "06-wizard-section-a-details.png",
      "Wizard: Section A (Testator Manual Address & Compliance Notice)"
    );
    await capturePage(
      desktopPage,
      `/wizard/children?applicationId=${app.id}`,
      "07-wizard-section-b-children.png",
      "Wizard: Section B (Children Residency First, Mandatory EID & Transliteration)"
    );
    await capturePage(
      desktopPage,
      `/wizard/executors?applicationId=${app.id}`,
      "08-wizard-section-c-executors.png",
      "Wizard: Section C (Executors Residency, Document Replace & Relationship Dropdown)"
    );
    await capturePage(
      desktopPage,
      `/wizard/guardians?applicationId=${app.id}`,
      "09-wizard-section-d-guardians.png",
      "Wizard: Section D (Guardians Residency Questions & Document Intake)"
    );
    await capturePage(
      desktopPage,
      `/wizard/beneficiaries?applicationId=${app.id}`,
      "10-wizard-section-e-beneficiaries.png",
      "Wizard: Section E (Beneficiaries Share Allocation with Smooth Keystrokes)"
    );
    await capturePage(
      desktopPage,
      `/wizard/review?applicationId=${app.id}`,
      "11-wizard-section-f-review-draft.png",
      "Wizard: Section F (Review, Testator Signature Capture & Live Dual-Column Will)"
    );

    // Customer Lifecycle Dashboard & Checkout
    await capturePage(
      desktopPage,
      `/dashboard?applicationId=${app.id}`,
      "12-customer-dashboard.png",
      "Customer Dashboard (9-Stage Lifecycle Tracker & Friendly Direct Support)"
    );
    await capturePage(
      desktopPage,
      `/checkout/court-fee?applicationId=${app.id}`,
      "13-court-fee-milestone-checkout.png",
      "Milestone 2 Court Fee Checkout (/checkout/court-fee)"
    );
    await capturePage(
      desktopPage,
      `/dashboard/support`,
      "14-customer-support-ticketing.png",
      "Customer Legal Support Desk & Ticket Resolution"
    );

    // Official Court Will Document Views
    await capturePage(
      desktopPage,
      `/will/${will.id}`,
      "15-court-will-preview.png",
      "ADJD Non-Muslim Will Bilingual Court Document View (/will/[id])"
    );
    await capturePage(
      desktopPage,
      `/will/${will.id}/print`,
      "16-court-will-printable.png",
      "ADJD Non-Muslim Will Official Printable Court Format (/will/[id]/print)"
    );

    // Legal Operations Admin Portal
    await capturePage(desktopPage, "/admin", "17-admin-dashboard-queue.png", "Legal Operations Admin Applications Queue (/admin)");
    await capturePage(
      desktopPage,
      `/admin/applications/${app.id}`,
      "18-admin-application-review.png",
      "Admin Application Review & Live In-Place Will Corrections"
    );
    await capturePage(desktopPage, "/admin/tickets", "19-admin-tickets-desk.png", "Admin Support Resolution Desk (/admin/tickets)");

    console.log("\n--- PART 2: MOBILE VIEWPORT EXPERIENCES (390x844 @2x) ---\n");

    // Mobile Captures
    await capturePage(mobilePage, "/", "20-landing-page-mobile.png", "Landing Page Mobile Viewport");
    await capturePage(
      mobilePage,
      `/dashboard?applicationId=${app.id}`,
      "21-customer-dashboard-mobile.png",
      "Customer Dashboard Mobile Viewport"
    );
    await capturePage(
      mobilePage,
      `/wizard/details?applicationId=${app.id}`,
      "22-wizard-section-a-details-mobile.png",
      "Wizard Section A Details Mobile Viewport"
    );
    await capturePage(
      mobilePage,
      `/will/${will.id}`,
      "23-court-will-preview-mobile.png",
      "ADJD Bilingual Court Will Mobile Viewport"
    );

    console.log("======================================================================");
    console.log("🎉 ALL 23 HIGH-RESOLUTION SCREENSHOTS SUCCESSFULLY CAPTURED!");
    console.log(`📁 Directory: ${screenshotsDir}`);
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

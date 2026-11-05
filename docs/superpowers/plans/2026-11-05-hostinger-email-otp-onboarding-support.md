# Hostinger Business Email (SMTP), Pre-Payment OTP, Onboarding, and Support Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full email dispatch capability via Hostinger SMTP (`noreply@onlinewillsadvisor.com` and `support@onlinewillsadvisor.com`) powering pre-payment Step 3 OTP verification, post-payment onboarding receipts, and two-way legal support desk notifications.

**Architecture:** A centralized Node.js email service (`lib/email.ts`) powered by Nodemailer connects to Hostinger's secure SMTP server (`smtp.hostinger.com:465`). This service renders luxury editorial-styled HTML emails matching ADJD court aesthetic and dispatches transactional emails for OTP authentication, onboarding welcome, Nomod payment confirmations, and support desk tickets.

**Tech Stack:** Next.js 14 App Router, TypeScript, Nodemailer, Prisma / Neon PostgreSQL, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-11-05-hostinger-email-otp-onboarding-support.md`

## Global Constraints
- Design Tokens: Canvas `#FBF9F5`, Obsidian Navy `#0B1528`, Warm Bronze `#A37E44`, Card border `#E5E0D8`.
- Transporter: Hostinger SMTP on port `465` (SSL, `secure: true`), sender `noreply@onlinewillsadvisor.com`.
- Safe Fallbacks: Non-production environments must log emails/OTPs to console if SMTP is unreachable or unconfigured.
- Security: Never expose `SMTP_PASS` on client-side React components or commit `.env.local` to git.

## Review Focus
1. **Hostinger SMTP Connectivity:** Verifying SSL/TLS handshake with `smtp.hostinger.com:465` succeeds without certificate rejection.
2. **OTP Delivery & Expiry:** 6-digit code received via email matches DB `OtpToken` and expires in 15 minutes.
3. **Step 3 Review Gate:** Checkout button is guarded until email OTP is verified (with dev bypass available).
4. **Payment Receipt Accuracy:** Webhook dispatches receipt with correct AED currency formatting and transaction ref.
5. **Support Ticket Routing:** New support tickets notify `support@onlinewillsadvisor.com`; admin replies notify the user.

---

### Task 1: Environment & Dependency Setup

**Files:**
- Modify: `.env.local`
- Modify: `package.json`
- Create: `scripts/test-smtp.ts`

**Steps:**
- [x] Step 1: Install `nodemailer` and `@types/nodemailer` via `npm install nodemailer && npm install -D @types/nodemailer`.
- [x] Step 2: Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `SUPPORT_EMAIL` to `.env.local`.
- [x] Step 3: Write standalone test script `scripts/test-smtp.ts` to verify SMTP credentials and socket connection to `smtp.hostinger.com:465`.
- [x] Step 4: Run `npx tsx scripts/test-smtp.ts` and verify connection success.

---

### Task 2: Core Email Module & Editorial Luxury Templates (`lib/email.ts`)

**Files:**
- Create: `lib/email.ts`
- Create: `scripts/test-email-templates.ts`

**Steps:**
- [x] Step 1: Create `lib/email.ts` with singleton `nodemailer.createTransport` targeting Hostinger SMTP.
- [x] Step 2: Implement responsive, editorial luxury HTML layout wrapper with OWA logo/header and Fujairah legal consultancy footer.
- [x] Step 3: Implement `sendOTPEmail(email, otp)` with 6-digit highlighted code block and 15-minute validity note.
- [x] Step 4: Implement `sendOnboardingWelcomeEmail(email, name)` with guidance on the 3 stages (questionnaire, bilingual draft, court submission).
- [x] Step 5: Implement `sendPaymentReceiptEmail(params)` with transaction ID, amount (AED 999 or AED 1,799), package type, and document preparation checklist.
- [x] Step 6: Implement `sendTicketAlertToSupport(params)` and `sendTicketReplyToUser(params)`.
- [x] Step 7: Create `scripts/test-email-templates.ts` and verify HTML rendering without syntax errors.

---

### Task 3: Connect Live Email to OTP Send Endpoint

**Files:**
- Modify: `app/api/auth/otp/send/route.ts`
- Test: `scripts/test-otp-send-route.ts`

**Steps:**
- [x] Step 1: Import `sendOTPEmail` from `@/lib/email` inside `app/api/auth/otp/send/route.ts`.
- [x] Step 2: Trigger `await sendOTPEmail(cleanEmail, code)` upon OTP creation.
- [x] Step 3: Ensure graceful error handling if SMTP fails so the API response reports meaningful feedback while logging errors server-side.
- [x] Step 4: Run test to dispatch OTP to a test mailbox and verify 200 OK response with email dispatched.

---

### Task 4: Step 3 Review Pre-Payment Inline OTP Verification

**Files:**
- Modify: `components/pre-payment/Step3ReviewCheckout.tsx`
- Modify: `types/pre-payment.ts` (if needed for verification state)

**Steps:**
- [x] Step 1: Add email verification state (`isEmailVerified`, `otpCode`, `otpSent`, `otpLoading`, `otpError`, `cooldown`) to `Step3ReviewCheckout.tsx`.
- [x] Step 2: Build the inline **Account & Email Security** card directly below the contact inputs with "Send 6-digit code" button.
- [x] Step 3: Add the 6-digit input with auto-focus, paste support, and 60-second resend countdown.
- [x] Step 4: Call `POST /api/auth/otp/verify` upon submission to authenticate user, set session cookie, and set `isEmailVerified = true`.
- [x] Step 5: Ensure clicking "Continue to payment" checks that the email is verified or prompts user to verify first (with a bypass for demo/dev).

---

### Task 5: Post-Payment Onboarding & Receipt Notifications

**Files:**
- Modify: `app/api/webhooks/nomod/route.ts`
- Modify: `app/api/checkout/status/route.ts`

**Steps:**
- [x] Step 1: Import `sendPaymentReceiptEmail` and `sendOnboardingWelcomeEmail` from `@/lib/email`.
- [x] Step 2: In `app/api/webhooks/nomod/route.ts`, after payment transaction is completed, call `sendPaymentReceiptEmail`.
- [x] Step 3: In `app/api/checkout/status/route.ts`, ensure synchronous checkout verification triggers receipt dispatch if not already processed by webhook.
- [x] Step 4: Verify idempotency so multiple webhook calls do not send duplicate receipt emails.

---

### Task 6: Support Desk Two-Way Notifications & Contact Updates

**Files:**
- Modify: `app/api/tickets/route.ts`
- Modify: `app/api/tickets/[id]/replies/route.ts`
- Modify: `components/common/OwaFooter.tsx`

**Steps:**
- [x] Step 1: In `POST /api/tickets`, after ticket creation, dispatch `sendTicketAlertToSupport` to `support@onlinewillsadvisor.com`.
- [x] Step 2: In `POST /api/tickets/[id]/replies`, when admin replies, dispatch `sendTicketReplyToUser` to the client's email address.
- [x] Step 3: Update `components/common/OwaFooter.tsx` email link from `info@onlinewillsadvisor.com` to `support@onlinewillsadvisor.com`.

---

### Task 7: Full System Verification

**Files:**
- Create: `scripts/test-email-full-system.ts`

**Steps:**
- [x] Step 1: Execute `scripts/test-email-full-system.ts` testing OTP generation, template compilation, and SMTP delivery.
- [x] Step 2: Run `npm run lint` and `npm run build` to verify no TypeScript or build regressions.


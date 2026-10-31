# Nomod Payment Gateway Integration & Reconciliation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete Nomod payment gateway handoff, webhook verification, application reconciliation, and real-time payment status detection so pre-payment transitions securely into the paid questionnaire.

**Architecture:** The customer fills the 3-step intake, creating a pending application and account draft in Neon PostgreSQL. On Step 4, clicking the primary Pay button records an unverified handoff (`opened_not_verified`) and opens Nomod hosted checkout in a new secure tab. Nomod fires a secure webhook to `/api/webhooks/nomod` upon payment success, which idempotently reconciles the transaction, updates the payment record to `COMPLETED`, and unlocks the application. The frontend polls `/api/checkout/status` to detect payment confirmation when the user returns, smoothly transitioning them to the questionnaire.

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma ORM, Neon Serverless PostgreSQL, Nomod Hosted Checkout URLs.

**Spec:** `docs/client-specs/prepayment/OWA_Developer_Handbook_and_Assets (1)/OWA_Developer_Handoff/OWA_Developer_Handbook.md` (Sections 2, 8, and 12).

## Global Constraints
- **Individual Will Fee:** Exactly AED 999.00 (`https://pay.nomodapp.com/en/l/3de8ba889b5942b8`).
- **Wills for Couples Fee:** Exactly AED 1,799.00 (`https://pay.nomodapp.com/en/l/d5c977670ef34c97`).
- **Court Fee Exclusion:** Court fee (AED 950 / AED 1,900) is never charged through OWA or Nomod.
- **Merchant Entity:** Juris Zone Corporate Services Provider (CSP) CO. LLC.
- **No PII in URLs:** Never append email or customer query params to Nomod checkout links.
- **No Premature Unlock:** Opening the link never marks an application as paid.
- **Idempotency:** Webhook processing must deduplicate duplicate callbacks cleanly.

## Review Focus
1. **Network drop or tab close during checkout:** Customer returns later; system detects payment via email lookup without requiring repayment.
2. **Webhook arriving before user returns:** Application status updates in DB; when user returns to OWA tab, status check immediately recognizes payment.
3. **Webhook arriving after user returns:** Frontend gracefully polls with a clean checking spinner and auto-advances as soon as webhook lands.
4. **Duplicate webhook delivery:** Idempotency guard ensures multiple webhook retries do not create duplicate payment records.
5. **Couples package identification:** Correctly sets up two wills for couples and charges AED 1,799, versus one will for individual at AED 999.

---

### Task 1: Payment Helper & Intent Creation in `/api/checkout/initial`

**Files:**
- Create: `lib/nomod.ts`
- Modify: `app/api/checkout/initial/route.ts`
- Test: `scripts/test-nomod-intent.ts`

**Interfaces:**
- Produces: `createPaymentIntent(data)` helper and updated `POST /api/checkout/initial` returning `applicationId`, `paymentId`, and status `PENDING`.

- [ ] **Step 1: Write test script for pending intent creation**
  Create `scripts/test-nomod-intent.ts` verifying that calling `/api/checkout/initial` saves the account and application with payment status `PENDING` rather than falsely marking it `COMPLETED`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx tsx scripts/test-nomod-intent.ts`
  Expected: Fails because status is currently hardcoded as `COMPLETED`.

- [ ] **Step 3: Implement `lib/nomod.ts` and update `app/api/checkout/initial/route.ts`**
  - Implement `lib/nomod.ts` with package amounts, Nomod URLs, and payment helper functions.
  - In `app/api/checkout/initial/route.ts`, create the payment record with status `PENDING` and link it to the application.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx tsx scripts/test-nomod-intent.ts`
  Expected: PASS with status `PENDING` and correct fee amounts.

- [ ] **Step 5: Commit**
  ```bash
  git add lib/nomod.ts app/api/checkout/initial/route.ts scripts/test-nomod-intent.ts
  git commit -m "feat(payment): create pending payment intent on intake submission"
  ```

---

### Task 2: Nomod Webhook Receiver (`/api/webhooks/nomod`)

**Files:**
- Create: `app/api/webhooks/nomod/route.ts`
- Test: `scripts/test-nomod-webhook.ts`

**Interfaces:**
- Consumes: Nomod webhook payload (email, amount, transactionId, status).
- Produces: `POST /api/webhooks/nomod` updating `Payment` to `COMPLETED` and unlocking `Application`.

- [ ] **Step 1: Write test script for webhook processing**
  Create `scripts/test-nomod-webhook.ts` simulating a Nomod webhook payload for an existing pending application and verifying the database updates to `COMPLETED`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx tsx scripts/test-nomod-webhook.ts`
  Expected: FAIL with 404 Route not found.

- [ ] **Step 3: Implement `/api/webhooks/nomod/route.ts`**
  - Validate webhook secret / signature if configured.
  - Extract email, transaction reference, amount, and status.
  - Idempotently find the matching application and update `Payment.status = 'COMPLETED'`.
  - Record audit event for payment verification.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx tsx scripts/test-nomod-webhook.ts`
  Expected: PASS with 200 OK and database record marked `COMPLETED`.

- [ ] **Step 5: Commit**
  ```bash
  git add app/api/webhooks/nomod/route.ts scripts/test-nomod-webhook.ts
  git commit -m "feat(payment): add Nomod webhook reconciliation route"
  ```

---

### Task 3: Payment Status Check Route (`/api/checkout/status`)

**Files:**
- Create: `app/api/checkout/status/route.ts`
- Test: `scripts/test-nomod-status.ts`

**Interfaces:**
- Consumes: `applicationId` or `email`.
- Produces: JSON `{ paid: boolean, status: string, applicationId: string }`.

- [ ] **Step 1: Write test script for status check**
  Create `scripts/test-nomod-status.ts` testing both unpaid and paid application status lookups.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx tsx scripts/test-nomod-status.ts`
  Expected: FAIL with 404 Route not found.

- [ ] **Step 3: Implement `/api/checkout/status/route.ts`**
  - Accept `GET /api/checkout/status?applicationId=...&email=...`.
  - Query database for `Payment` records where `status = 'COMPLETED'`.
  - Return `{ paid: true/false, paymentStatus: 'COMPLETED' | 'PENDING' }`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx tsx scripts/test-nomod-status.ts`
  Expected: PASS with accurate real-time payment status.

- [ ] **Step 5: Commit**
  ```bash
  git add app/api/checkout/status/route.ts scripts/test-nomod-status.ts
  git commit -m "feat(payment): add payment status polling endpoint"
  ```

---

### Task 4: Frontend Payment Handoff & Polling in Step 4

**Files:**
- Modify: `components/pre-payment/Step4Payment.tsx`
- Modify: `components/pre-payment/PrePaymentFlow.tsx`

**Interfaces:**
- Consumes: `/api/checkout/initial` and `/api/checkout/status`.
- Produces: Automated detection when user returns from Nomod tab, with fallback manual "I have completed payment" refresh button and test simulation mode.

- [ ] **Step 1: Connect Nomod checkout button and polling in `Step4Payment.tsx`**
  - When the user clicks the Pay button, open the Nomod tab.
  - Automatically begin polling `/api/checkout/status` every 3 seconds for 2 minutes to detect webhook arrival.
  - Show status indicator: "Awaiting confirmation from Nomod..." with "Check status now" button.
  - Provide developer test simulation toggle in dev mode.

- [ ] **Step 2: Handle successful payment in `PrePaymentFlow.tsx`**
  - When payment is confirmed, update state to `paid`, establish session, and smoothly advance to questionnaire dashboard.

- [ ] **Step 3: Test in browser / run TypeScript check**
  Run: `npx tsc --noEmit`
  Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add components/pre-payment/Step4Payment.tsx components/pre-payment/PrePaymentFlow.tsx
  git commit -m "feat(frontend): connect Nomod payment handoff and status detection"
  ```

---

### Task 5: End-to-End Test & Regression Verification

**Files:**
- Create: `scripts/test-nomod-full-journey.ts`

- [ ] **Step 1: Write full journey E2E test**
  - Test intake creation -> pending status -> webhook arrival -> status check verification -> session establishment.

- [ ] **Step 2: Run E2E test**
  Run: `npx tsx scripts/test-nomod-full-journey.ts`
  Expected: PASS all assertions.

- [ ] **Step 3: Final build verification**
  Run: `npm run build`
  Expected: Next.js build succeeds with zero errors.

- [ ] **Step 4: Commit**
  ```bash
  git add scripts/test-nomod-full-journey.ts
  git commit -m "test: add comprehensive Nomod payment integration E2E test"
  ```

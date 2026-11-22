# UX Audit & Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all verified security vulnerabilities, UX flaws, misleading dashboard statuses, pricing transparency gaps, and legal compliance issues identified in the UX audit (`OWA-UX-Audit-Annotated-v3.pdf`) and code investigation.

**Architecture:** Next.js 14 App Router, TypeScript (strict mode), Prisma ORM with Neon PostgreSQL, Tailwind CSS with OWA editorial legal luxury design tokens (`#FBF9F5` canvas, `#0B1528` obsidian navy, `#A37E44` warm bronze).

**Tech Stack:** Next.js 14, React 18, TypeScript, Prisma, Neon, Tailwind CSS, Lucide React, Zod.

**Spec:** `docs/client-specs/Fix/OWA-UX-Audit-Annotated-v3.pdf`, `PROJECT_CONTEXT.md`, `AGENTS.md`.

---

## Global Constraints
- Legal Compliance: ADJD court form standard `ADJD-NM1221-06-01` must remain strictly respected.
- Aesthetic Standards: Minimalist, warm, editorial legal luxury. Canvas `#FBF9F5`, Obsidian Navy `#0B1528`, Warm Bronze `#A37E44`.
- Security & Privacy: No unauthenticated access to support tickets, customer data, or internal admin links.
- Production Readiness: Remove all prototype disclaimers, test toggles, and demo bypasses from public customer-facing view.
- Zero Type Errors: Must pass `npx tsc --noEmit` and `npm run build` cleanly.

## Review Focus
1. Ticket Security: Visiting `GET /api/tickets` without a session or admin credentials must return empty list `[]` (never leak other customers' tickets).
2. Dashboard Authentication & Real Statuses: Unauthenticated visitors to `/dashboard` must redirect to `/auth/signin`; authenticated users must see real payment/completion state rather than hardcoded success badges.
3. Pricing Transparency: Total fee breakdown (OWA preparation fee + ADJD court fee = Total) must be clearly shown on `/start` Steps 3 & 4.
4. Legal Pages & Footer: `/terms` and `/privacy` must exist as real, informative pages; entity name corrected to `SP LEGAL FZ LLC`; remove `/handbook` from public footer.
5. Form Validation & UX Polish: Inline error messaging, phone format standardized to `+971 50 000 0000`, simplified signature copy, and correct pluralization.

---

### Task 1: Ticket Security & Access Control Hardening
**Files:**
- Modify: `app/api/tickets/route.ts`
- Modify: `app/dashboard/support/page.tsx`
- Modify: `components/Navbar.tsx`

**Interfaces:**
- Consumes: `getCurrentSession()` from `lib/auth-otp.ts`, Prisma `ticket` model.
- Produces: Safe `GET /api/tickets` and `POST /api/tickets` with strict access control; protected `/dashboard/support` redirecting unauthenticated users to `/auth/signin`.

- [ ] **Step 1: Secure `GET /api/tickets` in `app/api/tickets/route.ts`**
  - If `!isAdmin && !session && (!appId || appId.startsWith("draft-"))`, immediately return `NextResponse.json({ success: true, tickets: [] })`.
  - In `POST /api/tickets`, remove the fallback `prisma.application.findFirst` that attached tickets to other users' applications. If no session and no valid existing app, reject with 401/400.
- [ ] **Step 2: Protect `/dashboard/support` page (`app/dashboard/support/page.tsx`)**
  - Add session authentication check on mount: if `!session && !applicationId`, redirect to `/auth/signin?redirect=/dashboard/support`.
  - Fix top layout spacing to prevent any overlap with navigation.
- [ ] **Step 3: Remove Admin Portal link from customer `components/Navbar.tsx`**
  - Remove public link to `/admin` from customer navigation menu (lines 80-86 and 260-266). Keep admin accessible directly via URL `/admin` for authenticated administrators.

---

### Task 2: Legal Compliance & Public Footer Pages
**Files:**
- Create: `app/terms/page.tsx`
- Create: `app/privacy/page.tsx`
- Create: `app/auth/signup/route.ts`
- Modify: `components/common/OwaFooter.tsx`

**Interfaces:**
- Consumes: OWA brand layout and styling tokens.
- Produces: Dedicated `/terms` (Service & Refund Terms for SP LEGAL FZ LLC) and `/privacy` (Data Protection & 1-Year Retention Policy) pages; route handler redirecting `/auth/signup` to `/auth/register`.

- [ ] **Step 1: Create `app/terms/page.tsx`**
  - Add official service terms covering: SP LEGAL FZ LLC (Fujairah license), scope of preparation service, ADJD court submission role, refund terms (full refund if cancellation before draft generation; preparation fee non-refundable once draft is generated and legal review begins; court fees paid directly to ADJD).
- [ ] **Step 2: Create `app/privacy/page.tsx`**
  - Add comprehensive privacy policy covering: data minimization, end-to-end encryption of identity scans (passport, Emirates ID), non-Muslim civil court compliance, 1-year document retention policy, and deletion upon request.
- [ ] **Step 3: Create `app/auth/signup/route.ts`**
  - Redirect `GET /auth/signup` to `/auth/register` to eliminate 404 errors when visitors type `/auth/signup`.
- [ ] **Step 4: Update `components/common/OwaFooter.tsx`**
  - Fix typo: Change `SP LEGAL FZ LLE` to `SP LEGAL FZ LLC`.
  - Update navigation links: Point "Privacy policy" to `/privacy` and "Service terms" to `/terms`.
  - Remove "Developer Handbook" (`/handbook`) from customer-facing footer.

---

### Task 3: Pre-Payment Start Flow Polish & Pricing Transparency
**Files:**
- Modify: `components/pre-payment/PrePaymentFlow.tsx`
- Modify: `components/pre-payment/Step1ChoosePackage.tsx`
- Modify: `components/pre-payment/Step2AboutYou.tsx`
- Modify: `components/pre-payment/Step3ReviewCheckout.tsx`
- Modify: `components/pre-payment/Step4Payment.tsx`

**Interfaces:**
- Consumes: Pre-payment state, Nomod payment URLs.
- Produces: Production-grade checkout flow without prototype disclaimers or bypasses, with transparent total pricing and inline validation.

- [ ] **Step 1: Clean up `PrePaymentFlow.tsx`**
  - Remove prototype disclaimer at line 357 (`Pre-payment review · Use fictional details. Payments and verification are simulated...`).
  - Sync current step with browser URL using `window.history.pushState` on step changes.
- [ ] **Step 2: Form validation & phone standardization in `Step1ChoosePackage.tsx` & `Step2AboutYou.tsx`**
  - Add inline field error indicators and scroll-to-error behavior.
  - Standardize phone format placeholder and guidance to `+971 50 000 0000`.
- [ ] **Step 3: Remove test bypasses & show full transparent pricing in `Step3ReviewCheckout.tsx`**
  - Remove "Demo bypass: Verify instantly without email" (line 485).
  - Remove "About this test" (line 530).
  - Update FAQ answer: "Your progress is saved securely to your account so you can return at any time."
  - Show transparent price breakdown:
    - Individual: OWA preparation fee AED 999 + ADJD court fee AED 950 = Total AED 1,949.
    - Couples: OWA preparation fee AED 1,799 + ADJD court fee AED 1,900 = Total AED 3,699.
- [ ] **Step 4: Production Nomod checkout in `Step4Payment.tsx`**
  - Set `is1AedTestMode` to `false` by default; ensure live checkout links to the official package URLs (AED 999 / AED 1,799).
  - Guard simulation controls so they only show in development environment (`process.env.NODE_ENV !== "production"`).

---

### Task 4: Auth Flow Polish
**Files:**
- Modify: `app/auth/signin/page.tsx`
- Modify: `app/auth/register/page.tsx`

**Interfaces:**
- Consumes: Auth context and email OTP routes.
- Produces: Polished signin and register screens with clear copy and ADJD reference standard.

- [ ] **Step 1: Polish `app/auth/signin/page.tsx`**
  - Change tab copy `Passwordless Email OTP (OWA Standard)` to `Email Code (Passwordless)`.
  - Add security reassurance badges (ADJD Civil Family Court compliant, encrypted documents).
- [ ] **Step 2: Standardize court reference in `app/auth/register/page.tsx`**
  - Reference court template `ADJD-NM1221-06-01` under Abu Dhabi Law No. 14 of 2021.

---

### Task 5: Dashboard Authentication Wall & Real State Integrity
**Files:**
- Modify: `app/dashboard/page.tsx`

**Interfaces:**
- Consumes: Session from `getCurrentSession()`, application status, payments table.
- Produces: Authenticated dashboard reflecting real user data, real payment records, and honest draft progress.

- [ ] **Step 1: Auth check & redirection**
  - If user is not authenticated and has no active DB application, redirect to `/auth/signin?redirect=/dashboard`.
- [ ] **Step 2: Fix hardcoded status badges**
  - Show `OWA fee paid` ONLY if `initialPayment?.status === "COMPLETED"` or `activeApp.isPaid === true`. Otherwise show `Payment pending`.
  - Replace `✓ Saved to Abu Dhabi Civil Registry` with `✓ Saved locally` / `✓ Draft saved` while in progress; show `✓ Saved to Abu Dhabi Civil Registry` ONLY when `stage === "SUBMITTED_TO_ADJD"` or `stage === "REGISTRATION_COMPLETED"`.
  - Update draft ready card: If questionnaire sections are not yet complete, show `Draft in preparation (${completedCount} of 6 sections complete)` instead of prematurely claiming `Your bilingual court draft is ready`.
- [ ] **Step 3: Fix greeting**
  - Change `"Welcome back, You."` to `"Welcome back, {testatorFirstName}"` or `"Welcome back to your workspace"`.

---

### Task 6: Questionnaire Polish (Sidebar, Details, Children, Review)
**Files:**
- Modify: `components/owa-wizard/OwaSidebar.tsx`
- Modify: `components/owa-wizard/SectionA_Details.tsx`
- Modify: `components/owa-wizard/SectionB_Children.tsx`
- Modify: `components/owa-wizard/SectionF_ReviewDraft.tsx`
- Modify: `components/signature/TestatorSignatureCard.tsx`

**Interfaces:**
- Consumes: Zustand store `useOwaStore`.
- Produces: Smooth questionnaire ergonomics, conditional Emirates ID, date format hint, and simplified signature card copy.

- [ ] **Step 1: `OwaSidebar.tsx`**
  - Replace fallback `"Your Name"` with `"Your Will"` or the user's email/name.
- [ ] **Step 2: `SectionA_Details.tsx`**
  - Ensure Emirates ID is marked as optional for non-UAE residents (`isUaeResident === false`).
  - Add date format hint `DD/MM/YYYY` to the Date of Birth field.
  - Guard validation error displays from flashing before user interaction.
- [ ] **Step 3: `SectionB_Children.tsx`**
  - Ensure clean pluralization ("1 child listed" vs "2 children listed").
- [ ] **Step 4: `SectionF_ReviewDraft.tsx` & `TestatorSignatureCard.tsx`**
  - Align Section A check with `isSectionComplete("details")`.
  - Fix pluralization: "1 person appointed" (not "1 persons appointed").
  - In `TestatorSignatureCard.tsx`, change jargon `Testator Digital Signature (Clause 14 & Attestation)` to `Your Signature`.
  - Guard final submission if prerequisite sections 1–5 are incomplete.

---

### Task 7: Verification & Build Quality Gate
- [ ] **Step 1: Run type checking**
  - `npx tsc --noEmit`
- [ ] **Step 2: Run production Next.js build**
  - `npm run build`
- [ ] **Step 3: Test API security endpoints**
  - Test `GET /api/tickets` unauthenticated to confirm zero data leakage.


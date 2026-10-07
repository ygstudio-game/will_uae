# OWA Questionnaire & Admin Platform Evolution — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the UAE Will platform into the commercial OWA system featuring the official 8-page `ADJD-NM0723-07-03` court template (`Will Form (3).pdf`), two-stage milestone payments (AED 999/1,799 + AED 950/1,900), Stage 1 7-question qualification intake, passwordless Email OTP auth, 6-section consolidated questionnaire with universal person profiles, and an Admin verification workspace with in-app support ticketing.

**Architecture:** Next.js 14 App Router full-stack web application backed by Neon Serverless PostgreSQL with Prisma ORM. Relational data model for `Account`, `Application`, `Will`, `Person`, `RoleAssignment`, `Payment`, `Ticket`, and `ReviewFlag`. Zustand client store with persistent auto-save to Neon DB. Synchronized dual-column court template component matching `Will Form (3).pdf`.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Prisma ORM, Neon PostgreSQL, Lucide React, Web Crypto API.

**Spec:** `docs/superpowers/specs/2026-10-07-owa-questionnaire-and-admin-evolution-design.md`

---

## Global Constraints
- Target court template is strictly `Will Form (3).pdf` (`ADJD-NM0723-07-03`).
- All names in foreign languages must be phonetically transliterated into Arabic, never translated.
- Synchronized two-column layout: English left (`dir="ltr"`), Arabic right (`dir="rtl"`).
- Pricing milestones: Individual (AED 999 + AED 950 = AED 1,949), Couples (AED 1,799 + AED 1,900 = AED 3,699).
- Customer draft access is view-only (no public share or customer download buttons).
- Customer editing locked after court fee payment.
- Scale-to-zero serverless database with zero idle cost.

## Review Focus
1. **Scope Boundaries**: Testator under 21 or non-UAE resident attempting to check out displays clear guidance rather than crashing.
2. **Beneficiary Share Allocation**: Sum must strictly total 100%; prevents draft generation if unequal, displaying remaining percentage.
3. **Child Passport Assistance**: Missing child passport triggers ticket creation with pre-filled details while preserving user progress without prematurely unblocking draft generation.
4. **Couples Partner Swaps**: Copying Will 1 to Will 2 mirrors shared information while cleanly swapping spouse beneficiary roles without self-referential assignments.
5. **Draft Confirmation Invalidation**: Editing any field after draft confirmation automatically invalidates the confirmation, requiring re-review before court checkout.

---

### Task 1: Prisma Schema & Database Migration (Milestone 1)

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `types/owa.ts`
- Create: `scripts/test-owa-schema.ts`
- Modify: `lib/prisma.ts`

**Interfaces:**
- Consumes: Neon PostgreSQL connection string (`DATABASE_URL`).
- Produces: Updated Prisma Client with models: `Account`, `OtpToken`, `Application`, `Will`, `Person`, `RoleAssignment`, `UploadedDocument`, `Payment`, `Ticket`, `TicketReply`, `ReviewFlag`, `GeneratedDraft`, `AuditEvent`.

- [ ] **Step 1: Write schema test script**
  Create `scripts/test-owa-schema.ts` that imports Prisma Client and attempts to query `application.findMany()`, asserting the new models exist.

- [ ] **Step 2: Run test script to verify failure**
  Run: `npx tsx scripts/test-owa-schema.ts`  
  Expected: FAIL (models not found in current schema).

- [ ] **Step 3: Update `prisma/schema.prisma` & generate client**
  Add the complete model definitions matching Section 2 of the spec. Run `npx prisma db push` and `npx prisma generate`.

- [ ] **Step 4: Define TypeScript domain interfaces in `types/owa.ts`**
  Export application, person, role assignment, ticket, and court template data structures.

- [ ] **Step 5: Run test script to verify success**
  Run: `npx tsx scripts/test-owa-schema.ts`  
  Expected: PASS (Successfully connected and verified models).

- [ ] **Step 6: Commit**
  ```bash
  git add prisma/schema.prisma types/owa.ts scripts/test-owa-schema.ts lib/prisma.ts
  git commit -m "feat(schema): implement OWA domain models in Prisma for Neon Postgres"
  ```

---

### Task 2: Official Court Template Engine (`Will Form (3).pdf` / `ADJD-NM0723-07-03`) (Milestone 1)

**Files:**
- Create: `components/court/ADJDBilingualWillDocument.tsx`
- Create: `components/court/ADJDCourtHeader.tsx`
- Create: `components/court/ADJDCourtFooter.tsx`
- Modify: `app/will/[id]/page.tsx`
- Modify: `app/will/[id]/print/page.tsx`
- Create: `scripts/test-court-template.ts`

**Interfaces:**
- Consumes: `Will` and relational `Person` / `RoleAssignment` data.
- Produces: React component rendering the synchronized 8-page `ADJD-NM0723-07-03` bilingual court document.

- [ ] **Step 1: Write court template unit/render verification test**
  Create `scripts/test-court-template.ts` verifying that statutory clauses 1 through 10, headers, footers with `ADJD-NM0723-07-03`, and removal of the survivorship clause from Section 7 render accurately.

- [ ] **Step 2: Run test to verify failure**
  Run: `npx tsx scripts/test-court-template.ts`  
  Expected: FAIL (`ADJDBilingualWillDocument` not found).

- [ ] **Step 3: Implement `ADJDCourtHeader` and `ADJDCourtFooter`**
  Implement the exact Abu Dhabi Civil Family Court seal, Judicial Department banner, hotline `600 599 799`, `CivilFamilyCourt@adjd.gov.ae`, and `ADJD-NM0723-07-03` footers.

- [ ] **Step 4: Implement `ADJDBilingualWillDocument`**
  Implement the exact 8-page layout:
  - Page 1: Preamble & Section ONE Declaration
  - Page 2: Section TWO Executors (a, b, c, d conditional structure)
  - Page 3: Sections THREE (Debts), FOUR (Wishes), FIVE (Jurisdiction), SIX (Insurance)
  - Page 4: Section SEVEN Distribution (Residue + 1–5 simultaneous beneficiaries; NO introductory survivorship condition)
  - Page 5: Section SEVEN (Minor trust & pro-rata) + Section EIGHT Trustee Powers (a–e)
  - Page 6: Section NINE Guardianship Part 1 (Permanent guardian & 1–5 children)
  - Page 7: Section NINE Guardianship Part 2 (Substitute permanent guardian & temporary guardian; omitted 4th backup)
  - Page 8: Section TEN Execution & Attestation (Domicile, Residence, Legal responsibility, Signatures, Court stamp area)

- [ ] **Step 5: Run test to verify passing**
  Run: `npx tsx scripts/test-court-template.ts`  
  Expected: PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add components/court/ app/will/ scripts/test-court-template.ts
  git commit -m "feat(court): implement official ADJD-NM0723-07-03 bilingual 8-page will engine"
  ```

---

### Task 3: Passwordless Email OTP Authentication & Session Engine (Milestone 2)

**Files:**
- Create: `lib/auth-otp.ts`
- Create: `app/api/auth/otp/send/route.ts`
- Create: `app/api/auth/otp/verify/route.ts`
- Create: `app/auth/otp/page.tsx`
- Create: `components/auth/OtpVerificationCard.tsx`
- Modify: `components/Navbar.tsx`
- Create: `scripts/test-otp-auth.ts`

**Interfaces:**
- Consumes: `Account` and `OtpToken` in Neon DB.
- Produces: Signed session cookie (`will_session`), `getCurrentSession(req)`, `createOtp(email)`, `verifyOtp(email, code)`.

- [ ] **Step 1: Write OTP test script**
  Create `scripts/test-otp-auth.ts` testing sending an OTP, verifying the code, expiring codes, and testing 1-click PM demo bypass.

- [ ] **Step 2: Run test to verify failure**
  Run: `npx tsx scripts/test-otp-auth.ts`  
  Expected: FAIL (modules missing).

- [ ] **Step 3: Implement `lib/auth-otp.ts` & API routes**
  Implement cryptographic 6-digit OTP generation, session HMAC signing, and routes `/api/auth/otp/send` & `/api/auth/otp/verify`. Include a 1-click PM Demo shortcut.

- [ ] **Step 4: Implement `app/auth/otp/page.tsx` & `OtpVerificationCard.tsx`**
  Clean, warm ivory styling matching design tokens with quick-fill banner for testing.

- [ ] **Step 5: Run test to verify passing**
  Run: `npx tsx scripts/test-otp-auth.ts`  
  Expected: PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add lib/auth-otp.ts app/api/auth/otp/ app/auth/otp/ components/auth/OtpVerificationCard.tsx components/Navbar.tsx scripts/test-otp-auth.ts
  git commit -m "feat(auth): add passwordless email OTP authentication with PM demo bypass"
  ```

---

### Task 4: Stage 1 Pre-Payment Qualification Intake & Order Checkout (Milestone 2)

**Files:**
- Create: `app/start/page.tsx`
- Create: `components/intake/QualificationForm.tsx`
- Create: `components/intake/OrderSummaryCard.tsx`
- Create: `app/checkout/page.tsx`
- Create: `app/api/checkout/initial/route.ts`
- Create: `scripts/test-intake-checkout.ts`

**Interfaces:**
- Consumes: Qualification answers and customer contact information.
- Produces: Created `Account`, `Application` in `IN_PROGRESS`, `Payment` record, and session redirect to `/dashboard`.

- [ ] **Step 1: Write intake & checkout test script**
  Create `scripts/test-intake-checkout.ts` testing individual package checkout (AED 999), couples checkout (AED 1,799), and qualification scope guards.

- [ ] **Step 2: Run test to verify failure**
  Run: `npx tsx scripts/test-intake-checkout.ts`  
  Expected: FAIL (`/api/checkout/initial` not implemented).

- [ ] **Step 3: Implement `QualificationForm.tsx` & `app/start/page.tsx`**
  Build the 7 questions: Full name, target package (Myself / My partner and me), age 21+, non-UAE national, UAE assets, married, children under 18. Tabbed for Couples.

- [ ] **Step 4: Implement `OrderSummaryCard.tsx` & `app/checkout/page.tsx`**
  Display milestone pricing (AED 999 / AED 1,799 now; AED 950 / AED 1,900 later). Collect email, phone with country code, terms agreement, and test checkout simulator.

- [ ] **Step 5: Implement `app/api/checkout/initial/route.ts`**
  Atomically create account, application, will(s), and payment records. Set session cookie.

- [ ] **Step 6: Run test to verify passing**
  Run: `npx tsx scripts/test-intake-checkout.ts`  
  Expected: PASS.

- [ ] **Step 7: Commit**
  ```bash
  git add app/start/ components/intake/ app/checkout/ app/api/checkout/initial/ scripts/test-intake-checkout.ts
  git commit -m "feat(intake): implement pre-payment 7-question qualification and checkout flow"
  ```

---

### Task 5: Universal Person Repository & Client State Store (Milestone 3)

**Files:**
- Create: `store/useOwaStore.ts`
- Create: `app/api/persons/route.ts`
- Create: `app/api/applications/[id]/route.ts`
- Create: `scripts/test-owa-store.ts`

**Interfaces:**
- Consumes: `Application` and `Person` models in Neon DB.
- Produces: Shared state manager providing person CRUD, role assignments, autosave indicators, and cross-role document reuse.

- [ ] **Step 1: Write store & persons API test**
  Create `scripts/test-owa-store.ts` verifying that creating a person and assigning them to multiple roles shares the same profile and documents without duplication.

- [ ] **Step 2: Run test to verify failure**
  Run: `npx tsx scripts/test-owa-store.ts`  
  Expected: FAIL (`/api/persons` not implemented).

- [ ] **Step 3: Implement `/api/persons` and `/api/applications/[id]` routes**
  CRUD handlers supporting atomic updates, role attachments, and application status checks.

- [ ] **Step 4: Implement `store/useOwaStore.ts`**
  Zustand store with persistent cloud auto-save, visual "Saving..." / "Saved" status, and couples copy/swap logic.

- [ ] **Step 5: Run test to verify passing**
  Run: `npx tsx scripts/test-owa-store.ts`  
  Expected: PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add store/useOwaStore.ts app/api/persons/ app/api/applications/ scripts/test-owa-store.ts
  git commit -m "feat(store): implement universal person repository and persistent OWA store"
  ```

---

### Task 6: 6-Section Guided Questionnaire (Sections A through F) (Milestone 3)

**Files:**
- Create: `app/wizard/[section]/page.tsx`
- Create: `components/owa-wizard/SectionA_Details.tsx`
- Create: `components/owa-wizard/SectionB_Children.tsx`
- Create: `components/owa-wizard/SectionC_Executors.tsx`
- Create: `components/owa-wizard/SectionD_Guardians.tsx`
- Create: `components/owa-wizard/SectionE_Beneficiaries.tsx`
- Create: `components/owa-wizard/SectionF_ReviewDraft.tsx`
- Create: `components/owa-wizard/OwaNavigation.tsx`
- Create: `scripts/test-wizard-sections.ts`

**Interfaces:**
- Consumes: `useOwaStore` and `ADJDBilingualWillDocument`.
- Produces: The 6-section guided questionnaire with field validation and draft confirmation.

- [ ] **Step 1: Write wizard validation test script**
  Create `scripts/test-wizard-sections.ts` verifying:
  - 100% beneficiary sum check.
  - Compulsory passport check for testators and children.
  - Fallback order for executors (1, 2, 3).
  - Draft confirmation locks and unlocks.

- [ ] **Step 2: Run test to verify failure**
  Run: `npx tsx scripts/test-wizard-sections.ts`  
  Expected: FAIL.

- [ ] **Step 3: Implement Section A (Details) and Section B (Children)**
  Section A: Testator fields, compulsory passport upload, proof of address, residential address, country of domicile.  
  Section B: Reuses pre-payment answer; up to 5 children; compulsory passport; "Submit support request" button when passport missing.

- [ ] **Step 4: Implement Section C (Executors) and Section D (Guardians)**
  Section C: Executor 1, 2, 3 ordered fallback.  
  Section D: Permanent Guardian, Substitute Permanent Guardian, Temporary Guardian; spouse suggestion; no 4th backup appointment.

- [ ] **Step 5: Implement Section E (Beneficiaries) and Section F (Review & Draft Viewer)**
  Section E: 1–5 beneficiaries with real-time Allocated/Remaining share badges; 100% total rule.  
  Section F: Audit checklist, bilingual draft viewer, and "Confirm and continue" button that timestamps confirmation and directs to Court-Fee Checkout.

- [ ] **Step 6: Run test to verify passing**
  Run: `npx tsx scripts/test-wizard-sections.ts`  
  Expected: PASS.

- [ ] **Step 7: Commit**
  ```bash
  git add app/wizard/ components/owa-wizard/ scripts/test-wizard-sections.ts
  git commit -m "feat(wizard): implement 6-section consolidated questionnaire and draft viewer"
  ```

---

### Task 7: Milestone 2 Court-Fee Checkout & Customer Draft Locking (Milestone 4)

**Files:**
- Create: `app/checkout/court-fee/page.tsx`
- Create: `app/api/checkout/court-fee/route.ts`
- Create: `scripts/test-court-fee-checkout.ts`

**Interfaces:**
- Consumes: Confirmed draft and application ID.
- Produces: `Payment` record (AED 950 / AED 1,900), updates application status to `AWAITING_ADMIN_VERIFICATION`, and locks customer questionnaire editing.

- [ ] **Step 1: Write court fee checkout test**
  Create `scripts/test-court-fee-checkout.ts` testing that paying court fee transitions status to `AWAITING_ADMIN_VERIFICATION` and subsequent customer questionnaire updates are rejected with HTTP 403 Forbidden.

- [ ] **Step 2: Run test to verify failure**
  Run: `npx tsx scripts/test-court-fee-checkout.ts`  
  Expected: FAIL.

- [ ] **Step 3: Implement `app/api/checkout/court-fee/route.ts`**
  Validate current draft confirmation, create payment record, transition status, and enforce editing lock.

- [ ] **Step 4: Implement `app/checkout/court-fee/page.tsx`**
  Checkout interface displaying confirmed will details, payable court fee amount, and test payment confirmation.

- [ ] **Step 5: Run test to verify passing**
  Run: `npx tsx scripts/test-court-fee-checkout.ts`  
  Expected: PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add app/checkout/court-fee/ app/api/checkout/court-fee/ scripts/test-court-fee-checkout.ts
  git commit -m "feat(checkout): implement milestone 2 court fee checkout and draft locking"
  ```

---

### Task 8: Admin Workspace & Verification Pipeline (Milestone 4)

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/applications/[id]/page.tsx`
- Create: `app/api/admin/applications/[id]/route.ts`
- Create: `components/admin/ApplicationQueueTable.tsx`
- Create: `components/admin/AiVerificationFlagsCard.tsx`
- Create: `components/admin/StatusPipelineController.tsx`
- Create: `scripts/test-admin-workspace.ts`

**Interfaces:**
- Consumes: Applications, payments, documents, and review flags in Neon DB.
- Produces: Full admin operational workspace with status transitions (9 stages), flag resolutions, and draft exports.

- [ ] **Step 1: Write admin workspace test script**
  Create `scripts/test-admin-workspace.ts` verifying application queue filtering, advancing status along the 9 stages, and resolving AI flags with notes.

- [ ] **Step 2: Run test to verify failure**
  Run: `npx tsx scripts/test-admin-workspace.ts`  
  Expected: FAIL.

- [ ] **Step 3: Implement `/api/admin/applications/[id]` route**
  Add status update, flag resolution, draft correction, and audit logging handlers.

- [ ] **Step 4: Implement `ApplicationQueueTable.tsx` & `app/admin/page.tsx`**
  Filterable table by status, package type, customer name, date, and unresolved AI flags.

- [ ] **Step 5: Implement `app/admin/applications/[id]/page.tsx`**
  Application detail view displaying payments received, people/documents, AI flags card, draft viewer with DOCX/PDF export, and status pipeline controller.

- [ ] **Step 6: Run test to verify passing**
  Run: `npx tsx scripts/test-admin-workspace.ts`  
  Expected: PASS.

- [ ] **Step 7: Commit**
  ```bash
  git add app/admin/ components/admin/ app/api/admin/ scripts/test-admin-workspace.ts
  git commit -m "feat(admin): implement admin workspace, application queue, and 9-stage pipeline"
  ```

---

### Task 9: In-App Support Ticketing System (Milestone 4)

**Files:**
- Create: `app/dashboard/support/page.tsx`
- Create: `app/admin/tickets/page.tsx`
- Create: `app/api/tickets/route.ts`
- Create: `app/api/tickets/[id]/replies/route.ts`
- Create: `components/support/TicketThreadView.tsx`
- Create: `scripts/test-ticketing.ts`

**Interfaces:**
- Consumes: Customer support inquiries and admin responses.
- Produces: In-app support ticket threads, file attachments, and status tracking (`OPEN`, `AWAITING_CUSTOMER`, `RESOLVED`).

- [ ] **Step 1: Write ticketing test script**
  Create `scripts/test-ticketing.ts` verifying customer ticket creation, admin reply, attachment handling, and ticket resolution.

- [ ] **Step 2: Run test to verify failure**
  Run: `npx tsx scripts/test-ticketing.ts`  
  Expected: FAIL.

- [ ] **Step 3: Implement `/api/tickets` and `/api/tickets/[id]/replies` routes**
  Secure endpoints linking tickets to authenticated applications.

- [ ] **Step 4: Implement Customer Support View (`app/dashboard/support/page.tsx`)**
  Ticket creation form, active tickets list, and thread viewer with document upload capability.

- [ ] **Step 5: Implement Admin Tickets Inbox (`app/admin/tickets/page.tsx`)**
  Central ticket queue filterable by status, with reply and resolve actions.

- [ ] **Step 6: Run test to verify passing**
  Run: `npx tsx scripts/test-ticketing.ts`  
  Expected: PASS.

- [ ] **Step 7: Commit**
  ```bash
  git add app/dashboard/support/ app/admin/tickets/ app/api/tickets/ components/support/ scripts/test-ticketing.ts
  git commit -m "feat(support): implement in-app customer support ticketing and admin inbox"
  ```

---

### Task 10: End-to-End System Integration & Acceptance Verification (Milestone 5)

**Files:**
- Create: `scripts/verify-e2e-acceptance.ts`
- Modify: `app/dashboard/page.tsx`
- Modify: `components/Navbar.tsx`
- Modify: `components/Footer.tsx`

**Interfaces:**
- Consumes: All integrated modules from Tasks 1 through 9.
- Produces: Full production build and automated end-to-end verification passing all 18 acceptance criteria from Section 11 of the PM specification.

- [ ] **Step 1: Write acceptance verification script**
  Create `scripts/verify-e2e-acceptance.ts` running through:
  1. Pre-payment intake & initial payment.
  2. OTP sign-in.
  3. 6-section questionnaire completion with shared person profiles.
  4. Draft confirmation & Court fee payment.
  5. Questionnaire locking.
  6. Admin verification & status advancement to `REGISTRATION_COMPLETED`.
  7. Support ticket creation & reply.

- [ ] **Step 2: Run verification script & production build**
  Run: `npx tsx scripts/verify-e2e-acceptance.ts` and `npm run build`.  
  Expected: 0 errors across all routes.

- [ ] **Step 3: Update Dashboard & Navigation**
  Integrate application status banner, support links, and Admin portal switch.

- [ ] **Step 4: Run production build and verify pass**
  Run: `npm run build`  
  Expected: PASS (Compiled static and dynamic routes cleanly).

- [ ] **Step 5: Commit**
  ```bash
  git add app/dashboard/ components/ scripts/verify-e2e-acceptance.ts
  git commit -m "feat(integration): complete end-to-end acceptance verification for OWA platform"
  ```

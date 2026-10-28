# Pre-Payment Intake & Checkout Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete 4-step pre-payment onboarding funnel (Choose Package, About You, Review Inclusions & Contact, Payment Checkout) and interactive modals matching `docs/client-specs/OWA_Full_Journey_User_Test (2).html`, styled in the high-contrast Obsidian Navy & Warm Bronze luxury palette and saving user-entered data to PostgreSQL via `/api/checkout/initial`.

**Architecture:** A modular React component architecture in `components/pre-payment/` managed by a central flow orchestrator (`PrePaymentFlow.tsx`) with client-side `localStorage` autosave, step-by-step validation, and seamless database persistence on initial checkout.

**Tech Stack:** Next.js 14+ App Router, React 18, TypeScript, Tailwind CSS + custom scoped `pre-payment.css`, Prisma ORM with PostgreSQL.

**Spec:** [`docs/superpowers/specs/2026-10-28-prepayment-sections-design.md`](file:///d:/COding/InternShip%20Work/E-STUDYPAL/LAUNCHPIT/Will/docs/superpowers/specs/2026-10-28-prepayment-sections-design.md)

## Global Constraints
- Preserve exact layout, CSS grid, microcopy, and interactive mechanics from `docs/client-specs/OWA_Full_Journey_User_Test (2).html`.
- Avoid "AI slop": no generic gradients, rounded bloated SaaS cards, or synthetic icons; use crisp editorial legal styling.
- Zero dummy data in production: all inputs start empty; user-entered data saves directly to `Account`, `Application`, `Person`, and `Will` database tables.
- Luxury Palette tokens: Canvas `#FBF9F5`, Obsidian Navy `#0B1528`, Warm Bronze `#A37E44` / `#B38D48`, Border `#E5E0D8`, Emerald `#1E6B4A`.

## Review Focus
- **Empty input validation**: Prevent advancing past Step 1 or Step 2 if required legal eligibility questions or passport names are blank.
- **Partner conditional display**: When "Wills for Couples" is chosen, partner eligibility and questions must dynamically render and be validated.
- **LocalStorage sync resilience**: Ensure corrupted or missing `localStorage` degrades gracefully to clean initial state without crashing.
- **Bilingual alignment in Sample Modal**: Ensure left English (`dir="ltr"`) and right Arabic (`dir="rtl"`) align cleanly side-by-side on all viewports.
- **Database record creation**: Verify that submitting on Step 4 creates linked `Account`, `Application`, `Person`, and `Will` records in PostgreSQL and sets session cookie.

---

### Task 1: Type Definitions and Scoped CSS Styling

**Files:**
- Create: `types/pre-payment.ts`
- Create: `components/pre-payment/pre-payment.css`

**Interfaces:**
- Produces: `PrePaymentApplicant`, `PrePaymentJourneyState`, `DEFAULT_PREPAYMENT_STATE` in `types/pre-payment.ts`

- [ ] **Step 1: Create `types/pre-payment.ts`**
Define the complete TypeScript interfaces for applicant eligibility, journey state, and modal controller.

- [ ] **Step 2: Create `components/pre-payment/pre-payment.css`**
Port the exact CSS classes from `docs/client-specs/OWA_Full_Journey_User_Test (2).html` (`.pre-main`, `.pre-progress`, `.pre-package`, `.pre-radio`, `.cro-checkout`, `.cro-order`, `.saas-checkout`, `.inclusions`, `.bilingual`, `.modalback`), mapping colors to `#0B1528`, `#A37E44`, `#FBF9F5`, `#E5E0D8`, and `#1E6B4A`.

- [ ] **Step 3: Verification**
Run: `npx tsc --noEmit` to verify type definitions.

- [ ] **Step 4: Commit**
`git add types/pre-payment.ts components/pre-payment/pre-payment.css`
`git commit -m "feat(pre-payment): add types and luxury-contrast css design system"`

---

### Task 2: Brand Header and 4-Step Stepper Components

**Files:**
- Create: `components/pre-payment/PrePaymentHeader.tsx`
- Create: `components/pre-payment/PrePaymentProgress.tsx`

**Interfaces:**
- Consumes: `PrePaymentJourneyState['step']`
- Produces: `PrePaymentHeader({ onOpenHelp, onOpenResume, onGoToStart })`
- Produces: `PrePaymentProgress({ currentStep: number, onStepClick?: (step: number) => void })`

- [ ] **Step 1: Implement `PrePaymentHeader.tsx`**
Render the `.topbar.cro-header` with brand logo (`owa Online Wills Advisor`), "Questions before you continue? Get help →" button, and "Resume application" link.

- [ ] **Step 2: Implement `PrePaymentProgress.tsx`**
Render the `<ol class="pre-progress">` with 4 steps: `1 Choose your Will`, `2 About you`, `3 Review`, `4 Payment`. Include completed checkmarks (`✓`) and active bronze highlights.

- [ ] **Step 3: Verification**
Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**
`git add components/pre-payment/PrePaymentHeader.tsx components/pre-payment/PrePaymentProgress.tsx`
`git commit -m "feat(pre-payment): implement header and progress bar stepper"`

---

### Task 3: Step 1 (Choose Your Will) & Eligibility Screening

**Files:**
- Create: `components/pre-payment/Step1ChoosePackage.tsx`

**Interfaces:**
- Consumes: `PrePaymentJourneyState`
- Produces: `Step1ChoosePackage({ state, onUpdatePackage, onUpdateEligibility, onNext, onShowSample })`

- [ ] **Step 1: Implement Package Selection Cards**
Side-by-side cards for `Individual Will` (AED 999) and `Wills for Couples` (AED 1,799) with direct ADJD court fee transparency (AED 950 / 1,900). Active card uses Obsidian Navy border and Warm Bronze selection pill.

- [ ] **Step 2: Implement Eligibility Radios (`.pre-question`)**
Fieldsets for Age 21+, Non-UAE national, UAE assets. If "Wills for Couples" is selected, dynamically render Partner's eligibility fieldset.

- [ ] **Step 3: Add Validation & Next Trigger**
Display clear court restriction note if any answer is "No". Disable `Continue to your details →` until all questions are answered.

- [ ] **Step 4: Verification**
Run: `npx tsc --noEmit`

- [ ] **Step 5: Commit**
`git add components/pre-payment/Step1ChoosePackage.tsx`
`git commit -m "feat(pre-payment): implement step 1 package selection and eligibility checks"`

---

### Task 4: Step 2 (About You)

**Files:**
- Create: `components/pre-payment/Step2AboutYou.tsx`

**Interfaces:**
- Consumes: `PrePaymentJourneyState`
- Produces: `Step2AboutYou({ state, onUpdateName, onUpdateMarital, onUpdateChildren, onBack, onNext })`

- [ ] **Step 1: Implement Legal Passport Name Input**
Input field with clear note: *"As shown on your passport. This will be registered with ADJD."*

- [ ] **Step 2: Implement Marital Status & Children Radios**
Yes/No radios for legally married and minor children under 18. If "Wills for Couples", render partner's marital and children questions.

- [ ] **Step 3: Add Navigation Actions**
`← Back to package choice` and `Continue to review →`. Validate non-empty name and completed radios before proceeding.

- [ ] **Step 4: Verification**
Run: `npx tsc --noEmit`

- [ ] **Step 5: Commit**
`git add components/pre-payment/Step2AboutYou.tsx`
`git commit -m "feat(pre-payment): implement step 2 about you questions"`

---

### Task 5: Step 3 (Review Details, Inclusions & Contact)

**Files:**
- Create: `components/pre-payment/Step3ReviewCheckout.tsx`

**Interfaces:**
- Consumes: `PrePaymentJourneyState`
- Produces: `Step3ReviewCheckout({ state, onUpdateContact, onEditDetails, onOpenSample, onOpenHelp, onNext })`

- [ ] **Step 1: Implement 2-Column Review Grid (`.cro-checkout`)**
Left: Package banner with `Edit details` link, Interactive Inclusion Explorer tabs (Questionnaire, Bilingual Draft, Support, Court), and `See a sample bilingual Will →` button.

- [ ] **Step 2: Implement Contact Input Fields**
Email address and phone number (with country code validation).

- [ ] **Step 3: Implement Pre-Payment FAQ Accordions**
`<details>` accordions answering *"Do I need my documents now?"*, *"Can I finish later?"*, *"What happens after I pay?"*.

- [ ] **Step 4: Implement Sticky Order Card (`.cro-order`)**
Display `PAYABLE TO OWA TODAY`, Price (`AED 999` / `1,799`), transparent ADJD court fee line, and `Continue to payment →` CTA.

- [ ] **Step 5: Verification**
Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**
`git add components/pre-payment/Step3ReviewCheckout.tsx`
`git commit -m "feat(pre-payment): implement step 3 review and inclusion explorer"`

---

### Task 6: Step 4 (Complete Checkout & Payment Simulation)

**Files:**
- Create: `components/pre-payment/Step4Payment.tsx`

**Interfaces:**
- Consumes: `PrePaymentJourneyState`
- Produces: `Step4Payment({ state, onToggleTerms, onOpenTerms, onOpenPrivacy, onEditContact, onPay, loading, error })`

- [ ] **Step 1: Implement 2-Column Payment Grid (`.saas-checkout`)**
Left: Order summary card, package title, inclusions list, sample will trigger, and court fee callout.

- [ ] **Step 2: Implement Payment Method & Terms Acceptance**
Contact review bar with edit link, Card Payment simulation indicator, Terms checkbox (`I agree to the OWA Service Terms and Privacy Policy`), and links to terms modals.

- [ ] **Step 3: Implement Primary Pay CTA with State Handling**
Button: `Pay AED 999 →` / `Pay AED 1,799 →` with loading spinner, disabled state if terms unchecked, and retry alert if previous attempt failed.

- [ ] **Step 4: Verification**
Run: `npx tsc --noEmit`

- [ ] **Step 5: Commit**
`git add components/pre-payment/Step4Payment.tsx`
`git commit -m "feat(pre-payment): implement step 4 payment checkout"`

---

### Task 7: Interactive Modals (Sample Will, Help, Terms, Resume)

**Files:**
- Create: `components/pre-payment/PrePaymentModals.tsx`

**Interfaces:**
- Produces: `PrePaymentModals({ activeModal, onClose, onResumeEmail, onOpenDashboard })`

- [ ] **Step 1: Implement `SampleWillModal`**
Two-column bilingual ADJD legal template format: left English (`dir="ltr"`) statutory clauses with Roman numerals, right Arabic (`dir="rtl"`) calligraphy text. Includes watermark banner: `SAMPLE — COURT TEMPLATE FORMAT`.

- [ ] **Step 2: Implement `PreHelpModal`**
Clear guidance modal on eligibility, document timing, and court registration process.

- [ ] **Step 3: Implement `TermsModal`**
Scrollable legal terms viewer for OWA preparation services and ADJD court fee policies.

- [ ] **Step 4: Implement `ResumeModal`**
Email lookup input allowing returning users to restore their local application draft or navigate to their paid dashboard.

- [ ] **Step 5: Verification**
Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**
`git add components/pre-payment/PrePaymentModals.tsx`
`git commit -m "feat(pre-payment): implement sample will, help, terms, and resume modals"`

---

### Task 8: Master Orchestrator & `/start` Page Integration

**Files:**
- Create: `components/pre-payment/PrePaymentFlow.tsx`
- Modify: `app/start/page.tsx`

**Interfaces:**
- Consumes: All `components/pre-payment/*` components and `/api/checkout/initial`
- Produces: Integrated pre-payment onboarding page at `/start`

- [ ] **Step 1: Implement `PrePaymentFlow.tsx`**
Coordinate steps 1 to 4, error banner (`.errorbox`), `localStorage` autosave/hydration, modal state management, and POST submission to `/api/checkout/initial`.

- [ ] **Step 2: Connect to `app/start/page.tsx`**
Replace the old 2-step `QualificationForm` with `PrePaymentFlow`. Handle post-checkout redirect to `/dashboard?appId={applicationId}`.

- [ ] **Step 3: Verification & Build Check**
Run: `npm run build` or `npx next build` to guarantee zero TypeScript or Next.js build errors across all routes.

- [ ] **Step 4: Commit**
`git add components/pre-payment/PrePaymentFlow.tsx app/start/page.tsx`
`git commit -m "feat(start): wire full 4-step pre-payment journey into start page"`

---

### Task 9: End-to-End Verification & Database Assurance

**Files:**
- Create: `scripts/test-prepayment-e2e.ts`

- [ ] **Step 1: Write E2E test script**
Automate POST request to `/api/checkout/initial` with realistic non-mockup user input. Query Prisma directly to verify `Account`, `Application`, `Person`, `Will`, and `Payment` records are created and correctly linked.

- [ ] **Step 2: Run verification script**
Run: `npx tsx scripts/test-prepayment-e2e.ts`
Expected: PASS with 100% database verification.

- [ ] **Step 3: Commit**
`git add scripts/test-prepayment-e2e.ts`
`git commit -m "test(pre-payment): verify e2e checkout and database persistence"`

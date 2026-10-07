# UAE Will Preparation Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, court-ready Next.js 14+ (App Router) web application for UAE Non-Muslim Will Preparation conforming strictly to the Abu Dhabi Judicial Department (ADJD) Civil Family Court template (`ADJD-NM1221-06-01`), replicating the 18 reference screenshots in `Reference YB WILLS/SS/`.

**Architecture:** Next.js App Router with TypeScript and Tailwind CSS. Client-side state managed via Zustand with local persistence for the 16-step wizard, backed by Server Actions and Prisma ORM connecting to Neon Serverless PostgreSQL ($0 compute cost when idle). Verbatim dual-column bilingual court document renderer with `@media print` styling for pixel-perfect PDF export.

**Tech Stack:** Next.js 14+/15 (App Router), TypeScript, Tailwind CSS, Prisma ORM, Neon PostgreSQL, Zustand, Lucide React, Google Fonts (`Playfair Display`, `Inter`, `Amiri`).

**Spec:** [`docs/superpowers/specs/2026-10-03-uae-will-preparation-platform-design.md`](file:///d:/COding/InternShip%20Work/E-STUDYPAL/LAUNCHPIT/Will/docs/superpowers/specs/2026-10-03-uae-will-preparation-platform-design.md)

---

## Global Constraints

- **Canvas Background**: `#FBF9F5` (Warm Alabaster / Ivory Stone) project-wide.
- **Obsidian Navy**: `#0B1528` (Header bar, hero sections, primary action buttons).
- **Warm Court Bronze**: `#A37E44` / `#B38D48` (Progress bars, Roman numerals, CTAs).
- **Card Surfaces**: `#FFFFFF` with border `#E5E0D8` and soft elevation (`shadow-sm`).
- **Accent Header Band**: `#C5A880` / `#D4B896` / `#E2CEB7` for court table headers.
- **Typography**: Headings & Court Preview in Serif (`Playfair Display`), UI in Sans (`Inter`), Arabic in Classical Calligraphic (`Amiri` / `Noto Naskh Arabic`) with native `dir="rtl"`.
- **Database**: Neon Serverless PostgreSQL with Prisma ORM; zero idle compute cost.
- **Document Retention**: 1 year secure storage, then auto-delete.
- **Privacy**: LLM Vision document extraction handled server-side without intrusive client popups.
- **Arabic Names**: Phonetic transliteration from passports (never semantic translation); read directly from Emirates ID if present; reviewed on Step 15.
- **Court Submission**: Platform ends at downloadable/printable court-ready bilingual PDF/HTML draft; submission to court is manual.
- **Will Types**: Support both Individual Wills and Mirror Wills for married couples.
- **No Empty Placeholders**: Use rich legal sample data based on `Daniel Michael Carter` test fixture.

---

## Review Focus

1. **Beneficiary share allocation sum mismatch**: User specifies percentages that do not equal strictly 100.00%. Wizard must disable progression and highlight remainder error.
2. **Missing minor guardianship branches**: Testator has minor children (<18) but fails to designate both permanent and temporary guardians. Wizard must block generation.
3. **Arabic script reversal / improper ligatures**: Dual-column preview must preserve authentic Arabic ligatures (`dir="rtl"`, `lang="ar"`) without character mirroring or punctuation displacement.
4. **Print layout page breaks**: Browser "Save to PDF" via `@media print` must cleanly page-break after major sections without orphaned table headers or broken dual-column rows.
5. **Session persistence across wizard refresh**: User refreshes browser mid-way through Step 9; all entered testator details, executors, and beneficiary allocations must be instantly rehydrated.

---

## Tasks

### Task 1: Next.js Scaffolding & Design System Tokens Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.mjs`
- Create: `app/layout.tsx`, `app/globals.css`
- Test: Scaffolding build and token inspection

**Interfaces:**
- Produces: Tailwind color tokens (`alabaster`, `obsidian`, `court-bronze`, `court-tan`, `court-border`), Font classes (`font-serif`, `font-sans`, `font-arabic`).

- [ ] **Step 1: Check create-next-app options**
  Run: `npx -y create-next-app@latest --help`
  Verify supported flags for non-interactive app creation in the current directory.

- [ ] **Step 2: Scaffold Next.js in current directory**
  Run: `npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm`
  Install additional dependencies: `npm install lucide-react clsx tailwind-merge zustand @prisma/client` and dev dependency `prisma`.

- [ ] **Step 3: Configure Tailwind CSS tokens matching PROJECT_CONTEXT.md**
  Update `tailwind.config.ts` to define:
  - `colors.alabaster`: `#FBF9F5`
  - `colors.obsidian`: `#0B1528`
  - `colors['court-bronze']`: `#A37E44`
  - `colors['court-bronze-dark']`: `#8F6B34`
  - `colors['court-tan']`: `#C5A880`
  - `colors['court-border']`: `#E5E0D8`
  - Fonts: `serif: ['Playfair Display', 'serif']`, `sans: ['Inter', 'sans-serif']`, `arabic: ['Amiri', 'serif']`

- [ ] **Step 4: Configure `app/globals.css` with Google Fonts and Print Rules**
  Import Google Fonts for `Playfair Display`, `Inter`, and `Amiri`. Add base styles (`body { background-color: #FBF9F5; color: #111827; }`) and `@media print` base rules.

- [ ] **Step 5: Verify build passes**
  Run: `npm run build`
  Expected: Successful compilation with 0 errors.

---

### Task 2: Database Schema & Prisma ORM Setup (Neon Serverless PostgreSQL)

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `prisma/seed-data.ts`
- Test: Prisma schema validation

**Interfaces:**
- Consumes: Neon DB connection string from `.env`
- Produces: Prisma Client with `User`, `Will`, `Party`, `Child`, `Asset`, `UploadedDocument`, `GeneratedDocument` models.

- [ ] **Step 1: Write Prisma schema**
  Define `prisma/schema.prisma` with:
  - Enums: `WillStatus` (`DRAFT`, `REVIEW`, `GENERATED`), `WillType` (`INDIVIDUAL`, `MIRROR`), `PartyType` (Executors, Beneficiaries, Guardians), `DocumentType`.
  - Models: `User`, `Will`, `Party`, `Child`, `Asset`, `UploadedDocument`, `GeneratedDocument` with foreign keys and cascading deletes.

- [ ] **Step 2: Create Prisma client singleton**
  Write `lib/prisma.ts` providing global singleton instance for Next.js App Router hot-reloading safety.

- [ ] **Step 3: Create fixture test data**
  Write `prisma/seed-data.ts` incorporating the `Daniel Michael Carter` test data from `Reference YB WILLS/Wills_Questionnaire_ADJD_2026_FILLED_DUMMY.docx.pdf`.

- [ ] **Step 4: Verify Prisma generation**
  Run: `npx prisma generate`
  Expected: Generated Prisma Client successfully.

---

### Task 3: Shared Navigation & Layout Components

**Files:**
- Create: `components/Navbar.tsx`
- Create: `components/Footer.tsx`
- Modify: `app/layout.tsx`
- Test: Responsive header and footer rendering

**Interfaces:**
- Produces: `<Navbar />` (Obsidian Navy `#0B1528` with gold emblem, title, language indicator, auth buttons) and `<Footer />` (court disclaimer, ADJD notice).

- [ ] **Step 1: Implement `<Navbar />`**
  Build navigation header with:
  - Brand logo with court balance scale icon and text: "UAE Non-Muslim Will Preparation"
  - Subtitle: "Abu Dhabi Civil Family Court (ADJD)"
  - Navigation links: "Dashboard", "My Wills", "Help & Guidance"
  - User profile / Sign in button

- [ ] **Step 2: Implement `<Footer />`**
  Build legal footer with:
  - Abu Dhabi Judicial Department Civil Family Court disclaimer
  - Legal compliance note (`ADJD-NM1221-06-01`)
  - 1-Year privacy document retention notice

- [ ] **Step 3: Integrate into root layout**
  Update `app/layout.tsx` to wrap children with `<Navbar />` and `<Footer />` inside the ivory alabaster background.

- [ ] **Step 4: Verify responsive view**
  Run dev server and inspect mobile toggle and desktop layout.

---

### Task 4: High-Converting Landing Page (`19-landing-page-mobile.png`)

**Files:**
- Create: `app/page.tsx`
- Create: `components/landing/HeroSection.tsx`
- Create: `components/landing/HowItWorksSection.tsx`
- Create: `components/landing/LegalFeaturesSection.tsx`
- Test: Visual alignment with `19-landing-page-mobile.png`

**Interfaces:**
- Produces: Complete landing page with hero, step breakdown, ADJD badges, and direct CTAs (`Start Your Will`).

- [ ] **Step 1: Implement `HeroSection.tsx`**
  Build hero matching screenshot 19:
  - Eyebrow: "Abu Dhabi Judicial Department (ADJD) Compliant"
  - Serif headline: "Protect Your Family & UAE Assets with an Official Non-Muslim Will"
  - Value propositions: "100% Online · Dual-Column English & Arabic · Court Ready · $0 Maintenance"
  - Primary CTA: "Start Your Will" (links to `/dashboard` or `/wizard`)

- [ ] **Step 2: Implement `HowItWorksSection.tsx`**
  4-step process cards:
  1. Upload ID & Extract Details (OCR)
  2. Nominate Executors & Beneficiaries
  3. Review Arabic Transliterations
  4. Download Court-Ready Bilingual Will

- [ ] **Step 3: Implement `LegalFeaturesSection.tsx`**
  Showcase ADJD Civil Family Court statutory alignment, mirror will support, and minor guardianship trust clauses.

- [ ] **Step 4: Assemble `app/page.tsx`**
  Integrate sections with smooth transitions and responsive design using `responsive-craft`.

---

### Task 5: Authentication Screens (`02-sign-in.png`, `03-create-account.png`)

**Files:**
- Create: `app/auth/signin/page.tsx`
- Create: `app/auth/register/page.tsx`
- Create: `components/auth/AuthCard.tsx`
- Test: Form validation and routing

**Interfaces:**
- Produces: Clean minimalist auth cards on warm ivory canvas with email/password inputs and tab switching.

- [ ] **Step 1: Build `AuthCard.tsx`**
  Card container on `#FFFFFF` with `#E5E0D8` border, subtle elevation, court badge, and serif title.

- [ ] **Step 2: Build `app/auth/signin/page.tsx`**
  Sign in form matching `02-sign-in.png`: Email input, password input, "Remember me" checkbox, "Sign In" button, link to Register.

- [ ] **Step 3: Build `app/auth/register/page.tsx`**
  Create account form matching `03-create-account.png`: Full Name, Email, Password, Confirm Password, "Create Account" button.

- [ ] **Step 4: Verify navigation**
  Verify toggling between Sign In and Register works smoothly.

---

### Task 6: User Dashboard (`04-dashboard.png`, `18-dashboard-mobile.png`)

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `components/dashboard/DraftWillCard.tsx`
- Create: `components/dashboard/GeneratedWillCard.tsx`
- Create: `components/dashboard/DocumentAlertBanner.tsx`
- Test: Desktop and mobile responsiveness matching `04-dashboard.png` and `18-dashboard-mobile.png`

**Interfaces:**
- Produces: Complete dashboard with active drafts, progress bars, document review alerts, and generated court wills.

- [ ] **Step 1: Implement `DocumentAlertBanner.tsx`**
  Display "Documents to confirm" notification banner with count and direct `Review` links.

- [ ] **Step 2: Implement `DraftWillCard.tsx`**
  Display Testator name, will ID (`Will #7 · Started 19 Sep 2026`), progress percentage bar in `#A37E44`, current step label (`Step 16 of 16: Generate Will`), and actions (`Continue`, `Delete`).

- [ ] **Step 3: Implement `GeneratedWillCard.tsx`**
  Display completed will badge (`GENERATED`), list of confirmed parties (Executors, Beneficiaries, Guardians), and primary action (`Open will`).

- [ ] **Step 4: Implement `app/dashboard/page.tsx`**
  Welcome banner (`Good afternoon, Daniel`), "+ Start a new will" primary button, draft section, and finalized documents section. Mobile layout matching `18-dashboard-mobile.png`.

---

### Task 7: 16-Step Guided Wizard Engine & State Store

**Files:**
- Create: `store/useWillStore.ts`
- Create: `types/will.ts`
- Create: `components/wizard/WizardStepper.tsx`
- Create: `components/wizard/WizardNavigation.tsx`
- Create: `app/wizard/[step]/page.tsx`
- Test: Step transitions and local storage rehydration

**Interfaces:**
- Produces: `useWillStore` state machine tracking all 16 steps, validation rules, and rehydration.

- [ ] **Step 1: Define TypeScript models in `types/will.ts`**
  Define strict interfaces for Testator, Executors, Beneficiaries, Children, Guardians, Assets, Documents, and Transliterations.

- [ ] **Step 2: Implement Zustand store in `store/useWillStore.ts`**
  State management with `persist` middleware (local storage fallback) for:
  - `currentStep` (1-16)
  - `willType` (`INDIVIDUAL` vs `MIRROR`)
  - `testator`, `executors`, `beneficiaries`, `children`, `guardians`, `assets`, `documents`
  - Step completion checks (`isStepValid(stepNumber)`)
  - Actions: `updateTestator`, `addParty`, `removeParty`, `setSharePercentage`, `approveArabicName`, etc.

- [ ] **Step 3: Build `WizardStepper.tsx`**
  Display Roman numeral step indicators, current step name, and `#A37E44` progress bar.

- [ ] **Step 4: Build `WizardNavigation.tsx`**
  "Back" and "Save & Continue" buttons with disabled states when validation fails.

---

### Task 8: Wizard Steps 1–4 (Identity & Personal Setup)

**Files:**
- Create: `components/wizard/steps/Step1Documents.tsx`
- Create: `components/wizard/steps/Step2YourDetails.tsx`
- Create: `components/wizard/steps/Step3Declaration.tsx`
- Create: `components/wizard/steps/Step4Executors.tsx`
- Test: Form state updates and document extraction mock

**Interfaces:**
- Consumes: `useWillStore`
- Produces: Steps 1 through 4 UI matching screenshots 05, 06, 07, 08.

- [ ] **Step 1: Implement Step 1 Documents (`05-step-documents.png`)**
  UAE resident toggle (`Yes`/`No`), file dropzone for Passport, Emirates ID, Utility Bill, Visa. Summary card with extraction status.

- [ ] **Step 2: Implement Step 2 Your Details (`06-step-your-details.png`)**
  Testator Full Legal Name, Arabic Name, Date of Birth, Nationality, Passport Number, Emirates ID, Current Residential Address, Email, Phone. Source verification badges (`Source: Passport · 99%`).

- [ ] **Step 3: Implement Step 3 Declaration (`07-step-declaration.png`)**
  Section ONE statutory declaration: sound mind, age 21+, no duress, UAE assets only, cancellation of previous wills. Bilingual text display with mandatory confirmation checkbox.

- [ ] **Step 4: Implement Step 4 Executors (`08-step-executors.png`)**
  Section TWO Appointment of Executors & Trustees: Primary Executor (required), Substitute Executor (optional), Further Substitute Executor (optional). Name, DOB, nationality, passport, Arabic transliteration.

---

### Task 9: Wizard Steps 5–8 (Estate Provisions & Wishes)

**Files:**
- Create: `components/wizard/steps/Step5Debts.tsx`
- Create: `components/wizard/steps/Step6Wishes.tsx`
- Create: `components/wizard/steps/Step7Jurisdiction.tsx`
- Create: `components/wizard/steps/Step8Insurance.tsx`
- Test: Statutory clause confirmations

**Interfaces:**
- Consumes: `useWillStore`
- Produces: Steps 5 through 8 with official ADJD statutory legal wording.

- [ ] **Step 1: Implement Step 5 Debts (Section THREE)**
  Payment of debts, funeral expenses, and administration costs clause. Bilingual preview with statutory confirmation checkbox.

- [ ] **Step 2: Implement Step 6 Wishes (Section FOUR)**
  Letter of Wishes clause: binding trustees to consider any signed letter of wishes. Bilingual preview with statutory confirmation checkbox.

- [ ] **Step 3: Implement Step 7 Jurisdiction (Section FIVE)**
  Jurisdiction clause: UAE law applicability to substantive testamentary provisions. Bilingual preview with statutory confirmation checkbox.

- [ ] **Step 4: Implement Step 8 Insurance (Section SIX)**
  Insurance policy proceeds clause: distribution according to policy nomination or Will residue. Bilingual preview with statutory confirmation checkbox.

---

### Task 10: Wizard Steps 9–12 (Beneficiaries, Property & Powers)

**Files:**
- Create: `components/wizard/steps/Step9Beneficiaries.tsx`
- Create: `components/wizard/steps/Step10Property.tsx`
- Create: `components/wizard/steps/Step11Minors.tsx`
- Create: `components/wizard/steps/Step12Powers.tsx`
- Test: 100% share allocation validation and asset listing

**Interfaces:**
- Consumes: `useWillStore`
- Produces: Steps 9 through 12 matching screenshots 09, 10, 11, 12.

- [ ] **Step 1: Implement Step 9 Beneficiaries (`09-step-beneficiaries.png`)**
  Section SEVEN Estate Distribution: Primary Beneficiary (100% whole residue) + Substitute Beneficiaries. Dynamic percentage share allocator with live total calculation (must strictly equal 100.00%).

- [ ] **Step 2: Implement Step 10 Property (`10-step-property.png`)**
  General residue clause + Optional specific titled assets list (Immovable Property, Bank Accounts, Vehicles, Shares) with Emirate, Title Deed Number, and file attachment.

- [ ] **Step 3: Implement Step 11 Minors (`11-step-minors.png`)**
  Section SEVEN Clauses c & d: Trust provisions for beneficiaries under 21 years old (income accumulation, advancement, maintenance, education).

- [ ] **Step 4: Implement Step 12 Powers (`12-step-powers.png`)**
  Section EIGHT Powers of Executors & Trustees: Full statutory administrative powers (management, sale, retention, professional advisor appointment).

---

### Task 11: Wizard Steps 13–16 (Guardianship, Execution, Review & Generation)

**Files:**
- Create: `components/wizard/steps/Step13Guardianship.tsx`
- Create: `components/wizard/steps/Step14Execution.tsx`
- Create: `components/wizard/steps/Step15Review.tsx`
- Create: `components/wizard/steps/Step16Generate.tsx`
- Test: Step 15 audit checklist and Step 16 generation triggers

**Interfaces:**
- Consumes: `useWillStore`
- Produces: Steps 13 through 16 matching screenshots 13, 14, 15, 16.

- [ ] **Step 1: Implement Step 13 Guardianship (`12-step-guardianship.png`)**
  Minor children toggle ("Do you have children?"). If yes: Children list (Name, DOB, Nationality, Passport), Permanent Guardian, Temporary Guardian, Interim Guardian, and Substitutes.

- [ ] **Step 2: Implement Step 14 Execution (`13-step-execution.png`)**
  Country of Domicile declaration, UAE residency declaration at execution time, legal responsibility acknowledgment checkbox.

- [ ] **Step 3: Implement Step 15 Review (`14-step-review.png`)**
  Comprehensive pre-generation checklist: Section-by-section audit (`✓ Complete`), edit triggers, and **Arabic Name Approval Table** with inline phonetic editing and confirmation checkmark.

- [ ] **Step 4: Implement Step 16 Generate (`15-step-generate.png`)**
  Preview triggers (`Preview English`, `Preview Arabic`, `Preview Bilingual`), `Generate Will` primary action, version stamp (`non-muslim-v1`), generation timestamp history, and print/download trigger.

---

### Task 12: Document OCR Review Modal Component (`17-document-review.png`)

**Files:**
- Create: `components/documents/DocumentReviewModal.tsx`
- Create: `app/api/ocr/route.ts`
- Test: Modal trigger, field editing, and confirmation

**Interfaces:**
- Produces: `<DocumentReviewModal />` displaying side-by-side extracted fields against document image with confidence pills (`Source: Passport · 99%`).

- [ ] **Step 1: Implement OCR API Route Handler (`app/api/ocr/route.ts`)**
  Endpoint accepting uploaded file and returning extracted JSON fields (Full Name, Arabic Name, DOB, Nationality, Passport/EID number, Expiry Date, Confidence scores).

- [ ] **Step 2: Implement `DocumentReviewModal.tsx`**
  Side-by-side modal matching screenshot 17:
  - Left panel: Document image preview (e.g. passport photo page)
  - Right panel: "Information found" list with editable input fields and confidence tags
  - Actions: "Cancel" and "Confirm & Apply"

- [ ] **Step 3: Connect modal to Step 1 and Dashboard**
  Allow clicking "Review and confirm" on any uploaded document card to open the modal.

---

### Task 13: Court-Ready Bilingual Will Renderer & Print Engine (`16-generated-will-bilingual.png`)

**Files:**
- Create: `components/court/BilingualWillDocument.tsx`
- Create: `components/court/CourtHeader.tsx`
- Create: `components/court/CourtFooter.tsx`
- Create: `app/will/[id]/print/page.tsx`
- Test: Dual-column LTR/RTL synchronization and `@media print` layout

**Interfaces:**
- Consumes: Complete will state or database record
- Produces: Side-by-side bilingual court-ready will matching official template `ADJD-NM1221-06-01`.

- [ ] **Step 1: Implement `CourtHeader.tsx` & `CourtFooter.tsx`**
  Header with Abu Dhabi Judicial Department emblem and bilingual title ("LAST WILL AND TESTAMENT / وصية وتصرف في التركة"). Footer with form code `ADJD-NM1221-06-01`, page numbers (`Page X of 8`), and official disclaimer.

- [ ] **Step 2: Implement `BilingualWillDocument.tsx`**
  Two-column synchronized table layout:
  - Left Column: English verbatim statutory text (`dir="ltr"`, `font-serif`).
  - Right Column: Arabic verbatim statutory text (`dir="rtl"`, `font-arabic`).
  - Sections: Opening Preamble, Section ONE through Section NINE, Execution, and Attestation clauses.
  - Dynamically populated with testator, executors, beneficiaries, children, and guardians.

- [ ] **Step 3: Configure Print Engine (`@media print`)**
  Add print stylesheet rules in `app/will/[id]/print/page.tsx`:
  - Margins: `@page { margin: 15mm 20mm; size: A4; }`
  - Page breaks: `page-break-after: always;` after major sections.
  - Omit navigation headers, footers, and buttons from print output.

- [ ] **Step 4: Verify print preview**
  Inspect print layout in browser print dialog to confirm page alignment and table formatting.

---

### Task 14: End-to-End Verification, Responsive Auditing & Polishing

**Files:**
- Modify: `app/page.tsx`, `app/dashboard/page.tsx`, `components/wizard/*`
- Test: Responsive audit and impeccable craft review

**Interfaces:**
- Verifies: Complete flow from Landing Page ➔ Dashboard ➔ 16-Step Wizard ➔ Review ➔ Bilingual Court Will Generation.

- [ ] **Step 1: Load test fixture (`Daniel Michael Carter`)**
  Verify complete end-to-end form fill using test data from `Reference YB WILLS/Wills_Questionnaire_ADJD_2026_FILLED_DUMMY.docx.pdf`.

- [ ] **Step 2: Responsive craft audit via `responsive-craft`**
  Test all views across breakpoints:
  - Mobile (`375px` - `414px`) matching `18-dashboard-mobile.png` and `19-landing-page-mobile.png`
  - Tablet (`768px`)
  - Desktop (`1280px`+)

- [ ] **Step 3: Impeccable design quality check**
  Verify all colors adhere strictly to palette tokens (`#FBF9F5`, `#0B1528`, `#A37E44`, `#E5E0D8`), typography proportions, and micro-interactions.

- [ ] **Step 4: Commit and finalize**
  Run linter and build check: `npm run lint && npm run build`

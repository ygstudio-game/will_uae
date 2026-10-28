# Design Specification: Pre-Payment Intake & Checkout Journey

## 1. Overview & Objective
This specification formalizes the implementation of the pre-payment onboarding funnel for the UAE Non-Muslim Will Preparation Platform (ADJD Civil Family Court). It replaces the initial two-step intake in `app/start/page.tsx` with the complete, highly refined 4-step client journey defined in [`docs/client-specs/OWA_Full_Journey_User_Test (2).html`](file:///d:/COding/InternShip%20Work/E-STUDYPAL/LAUNCHPIT/Will/docs/client-specs/OWA_Full_Journey_User_Test%20%282%29.html).

### Core Principles
- **Strict Adherence to Client Prototype**: Preserve the exact DOM hierarchy, responsive CSS grid layouts, form mechanics, interactive inclusion tabs, and microcopy from the HTML specification. Avoid generic "AI slop" or synthetic design elements.
- **Editorial Legal Luxury Palette**: Substitute the prototype's pastel purple/lavender tones with our project's high-contrast, WCAG AAA-compliant palette:
  - Canvas: `#FBF9F5` (Warm Alabaster)
  - Primary / Text: `#0B1528` (Obsidian Navy)
  - Eyebrow / Progress / Accents: `#A37E44` / `#B38D48` (Warm Bronze)
  - Card Surfaces: `#FFFFFF` with `#E5E0D8` borders and subtle elevation
  - Verification & Badges: `#1E6B4A` (Court Verified Emerald)
- **Zero Dummy Data in Production**: All input fields initialize empty without placeholder seed entities (e.g. no mockup names like "Daniel Reyes"). Data entered by the user is validated and permanently committed to PostgreSQL via Prisma to seed the future 16-step wizard and court documents.

---

## 2. Architecture & File Structure

All pre-payment components reside in `@/components/pre-payment/` to maintain clean boundaries and testability:

```text
components/pre-payment/
├── pre-payment.css            # Scoped CSS directly adapted from the client prototype with luxury tokens
├── PrePaymentFlow.tsx         # Root client orchestrator (steps, validation, localStorage sync, API dispatch)
├── PrePaymentHeader.tsx       # Brand header with owa logo, help link ("Get help →"), and draft resume
├── PrePaymentProgress.tsx     # 4-step breadcrumb progress bar (.pre-progress)
├── Step1ChoosePackage.tsx     # Package selection (Individual vs Couples) & court eligibility radio checks
├── Step2AboutYou.tsx          # Full legal name, marital status, minor children screening
├── Step3ReviewCheckout.tsx    # 2-column review grid with inclusion explorer, contact details, and sticky summary
├── Step4Payment.tsx           # 2-column payment confirmation, card simulation, and service terms acceptance
└── PrePaymentModals.tsx       # Modals: Sample Bilingual Will, Pre-Payment Help, Service Terms, Resume Draft
```

---

## 3. Data Flow & Database Integration

### 3.1 State Schema (`PrePaymentJourneyState`)
```typescript
export interface PrePaymentApplicant {
  age21: boolean | null;
  nonUae: boolean | null;
  uaeAssets: boolean | null;
  married: boolean | null;
  children: boolean | null;
}

export interface PrePaymentJourneyState {
  step: 1 | 2 | 3 | 4;
  packageType: "INDIVIDUAL" | "COUPLES";
  primaryApplicant: PrePaymentApplicant;
  partnerApplicant: PrePaymentApplicant;
  fullName: string;
  email: string;
  phoneNumber: string;
  termsAccepted: boolean;
  paymentStatus: "unpaid" | "pending" | "paid" | "failed";
  activeInclusionTab: "questionnaire" | "bilingual" | "support" | "court";
}
```

### 3.2 Autosave & Resumption
- Local draft is maintained in `localStorage` under key `owa_prepayment_draft_v1`.
- Any modification instantly updates `localStorage`.
- On initial page mount, if a valid draft exists, it is restored to prevent accidental loss of user progress.
- A "Reset application" action allows starting over with empty inputs.

### 3.3 Database Handoff (`/api/checkout/initial`)
When the user clicks `Pay AED 999` or `Pay AED 1,799` on Step 4:
1. Frontend performs strict validation on all required inputs (passport name, valid email, phone with country code, all qualification booleans, terms checkbox).
2. Data is POSTed to `/api/checkout/initial`:
   - Creates or updates `Account` (`email`, `fullName`, `phoneNumber`).
   - Creates `Application` (`packageType`, qualification flags).
   - Creates `Person` for Testator (`fullName`, `email`, `phone`, `isUaeResident: true`).
   - Creates `Will` record linked via `testatorPersonId: Person.id`.
   - If `COUPLES`, creates a mirror second `Will` record.
   - Records `Payment` milestone (`INITIAL_SERVICE_FEE`, `COMPLETED`).
   - Sets secure session cookie via JWT.
3. Upon 200 OK, frontend calls `refreshUser()` and redirects to `/dashboard?appId={applicationId}`.

---

## 4. UI/UX Flow & Layout Specification

### 4.1 Step 1: Choose Your Will (`choose`)
- **Header**: Eyebrow `STEP 1 OF 4 · START YOUR APPLICATION`, Title: `Choose your Will.`
- **Package Cards**:
  - `Individual Will`: AED 999 OWA fee + explicit note: `ADJD court fee: AED 950 per Will, paid directly to ADJD later`.
  - `Wills for Couples`: AED 1,799 OWA fee + explicit note: `ADJD court fee: AED 1,900 for two Wills, paid directly to ADJD later`.
- **Eligibility Fieldsets (`.pre-question`)**:
  - Radios for Applicant:
    1. *Aged 21 or above?* (Yes / No)
    2. *Non-UAE national?* (Yes / No)
    3. *Assets or residence in the UAE?* (Yes / No)
  - If `COUPLES` selected: displays partner's qualification questions.
  - Answering "No" immediately shows the official court restriction callout: *"The ADJD Non-Muslim Wills Registry requires testators to be non-Muslim, non-UAE nationals aged 21 or older with UAE connections."*
- **Footer**: `Continue to your details →` button.

### 4.2 Step 2: About You (`about`)
- **Header**: Eyebrow `STEP 2 OF 4 · ABOUT YOU`, Title: `A few details about you.`
- **Inputs**:
  - `Full legal name *`: Clear instruction: `As shown on your passport. This will be registered with ADJD.`
  - `Marital status *`: Yes / No radio (*Are you legally married?*).
  - `Minor children *`: Yes / No radio (*Do you have children under 18?*).
  - If `COUPLES`: Partner marital status and children questions.
- **Footer**: `← Back to package choice` and `Continue to review →`.

### 4.3 Step 3: Review Details & Inclusions (`checkout`)
- **Header**: Eyebrow `STEP 3 OF 4 · REVIEW`, Title: `Review your Will.`
- **Desktop 2-Column Layout (`.cro-checkout`)**:
  - **Left Section**:
    - Package banner with `Edit details` link.
    - Interactive **Inclusion Explorer**: Tabbed switcher showing 4 feature breakdowns (Six-section questionnaire, Bilingual draft, In-app support, ADJD submission).
    - `See a sample bilingual Will →` link (opens modal).
    - **Contact Details Card**:
      - `Email address *`
      - `Phone number *` (with country code validation).
    - **Pre-Payment FAQs**: Expandable `<details>` accordions covering document requirements and timelines.
  - **Right Aside (Sticky Order Card `.cro-order`)**:
    - Sticky card with `PAYABLE TO OWA TODAY`.
    - Price: `AED 999` or `AED 1,799`.
    - Transparent court fee line: `ADJD court fee: AED 950 / 1,900 paid directly to ADJD later (not charged by OWA)`.
    - Action CTA: `Continue to payment →`.

### 4.4 Step 4: Complete Your Checkout (`payment`)
- **Header**: Eyebrow `STEP 4 OF 4 · PAYMENT`, Title: `Complete your checkout.`
- **Desktop 2-Column Layout (`.saas-checkout`)**:
  - **Left Section (Order Summary)**:
    - Package recap for `[User's Full Legal Name]`.
    - Inclusions checklist.
    - Transparent court fee notice.
  - **Right Section (Payment & Terms)**:
    - Contact review bar showing user's email and phone with an `Edit` action returning to Step 3.
    - Card Payment simulation badge (`TEST MODE / CARD PAYMENT`).
    - Service Terms Checkbox: `I agree to the OWA Service Terms and Privacy Policy.`
    - Links to view Service Terms and Privacy Policy modals.
    - Primary CTA: `Pay AED 999 →` / `Pay AED 1,799 →` with loading spinner.
    - Next step reassurance: `Next: your guided questionnaire. Verify your email after payment to access your application.`

---

## 5. Interactive Modals

1. **Sample Bilingual Will Modal (`SampleWillModal`)**:
   - Replicates official ADJD 8-page court layout format (`ADJD-NM1221-06-01`).
   - Side-by-side English (`dir="ltr"`) and Arabic (`dir="rtl"`) clauses.
   - Watermarked header: `SAMPLE — COURT TEMPLATE FORMAT`.
2. **Help Before You Pay Modal (`PreHelpModal`)**:
   - Comprehensive answers regarding required documents, court timeline, and pricing breakdown.
3. **Service Terms & Privacy Modal (`TermsModal`)**:
   - Complete, clear legal disclosure for OWA preparation services.
4. **Resume Application Modal (`ResumeModal`)**:
   - Allows users to enter their email to restore their active draft or proceed directly to their paid dashboard.

---

## 6. Testing & Quality Assurance Plan
- **Zero Mockup Leakage**: Verify no dummy test entities are written into the database.
- **Validation Suite**:
  - Step 1 cannot advance without package choice and eligibility confirmations.
  - Step 2 requires valid non-empty passport full name.
  - Step 3 requires valid RFC-compliant email and E.164 phone number.
  - Step 4 requires terms acceptance.
- **End-to-End Database Verification**:
  - Complete checkout flow on local environment.
  - Inspect PostgreSQL database records in `Account`, `Application`, `Person`, and `Will`.
  - Confirm dashboard loads with the newly created application ID and prepopulates Step 1 of the 16-step wizard.
- **Responsive Viewport Testing**:
  - Test on desktop (1280px+), tablet (768px), and mobile (375px/390px) to verify sticky sidebars convert cleanly to standard document flow per reference screenshots `18-dashboard-mobile.png` and `19-landing-page-mobile.png`.

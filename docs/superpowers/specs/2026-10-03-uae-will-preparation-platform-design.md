# Design Specification: UAE Will Preparation Platform (ADJD Non-Muslim Will)

**Date**: 2026-10-03  
**Status**: Confirmed & Approved by PM (`summary.md`)  
**Target Jurisdiction**: Abu Dhabi Judicial Department (ADJD) Civil Family Court  
**Template Specification**: Official Court Form `ADJD-NM1221-06-01`  

---

## 1. Executive Summary & Intent

The **UAE Will Preparation Platform** is a specialized, editorial legal web application that enables non-Muslim expatriates and residents in the UAE to prepare, verify, and generate a court-ready Last Will and Testament strictly compliant with the **Abu Dhabi Judicial Department (ADJD) Civil Family Court**.

The system replicates the exact visual design, typography, color palette, and multi-step wizard benchmarked across the 18 reference screenshots in `Reference YB WILLS/SS/`, incorporating automated document reading (OCR via LLM Vision), phonetic Arabic transliteration of foreign names, and a side-by-side bilingual (English LTR & Arabic RTL) court document preview and print engine.

---

## 2. Confirmed Product & Architectural Decisions

Following alignment with the Project Manager (recorded in `summary.md` and `QUESTIONS_FOR_PM.md`):

1. **Database & Zero-Cost Infrastructure**:
   - **Neon Serverless PostgreSQL** paired with **Prisma ORM**.
   - Ensures $0/month compute cost when idle (auto-suspends on zero traffic) with relational data integrity across Testators, Executors, Beneficiaries, Children, Guardians, and Assets.
2. **Document Retention Policy**:
   - Uploaded identity documents (Passports, Emirates IDs, Utility Bills, Title Deeds) are stored securely for **1 year**, then automatically purged.
3. **LLM Document Reading & User Privacy**:
   - Document extraction via LLM Vision (Gemini 1.5 Flash / GPT-4o-mini Vision) is handled transparently server-side.
   - No intrusive consent checkbox or privacy disclaimer popup is required in the UI.
4. **Arabic Name Extraction & Phonetic Transliteration**:
   - **Emirates ID**: Official Arabic name is extracted directly from the identity card.
   - **Passport**: Phonetically transliterated into Arabic script using AI (e.g., *"John Michael Smith"* ➔ *"جون مايكل سميث"*). Never translated semantically.
   - All Arabic names are presented in **Step 15 (Review)** in an interactive audit table for user verification and manual fine-tuning before document generation.
5. **Monetization & Payment Integration**:
   - Deferred to post-core phase. Checkout gateway (Stripe/Tabby/Telr) will be attached after the core bilingual drafting, wizard state engine, and preview flows are finalized.
6. **Scope of Court Submission**:
   - The platform scope ends at generating and exporting the court-ready bilingual PDF/HTML draft. Final court filing and attestation is submitted manually by the user directly on ADJD's portal.
7. **Supported Will Formats**:
   - Both **Individual Wills** (single person) and **Mirror Wills for Couples** (married spouses with linked reciprocal estates and shared children/assets) are supported by the underlying schema and workflow.
8. **Reference Data Fixture**:
   - `Reference YB WILLS/Wills_Questionnaire_ADJD_2026_FILLED_DUMMY.docx.pdf` serves as the golden questionnaire fixture (*Daniel Michael Carter* sample estate).
9. **Pending Administrative Specification**:
   - `OWA_Questionnaire_and_Admin_Specification.md` is strictly **ON HOLD** (not finalized) and is not implemented in this phase.

---

## 3. Impeccable Design System & Visual Hierarchy

The application avoids generic SaaS styling, implementing an **understated legal luxury** aesthetic benchmarked against the reference screenshots:

### 3.1 Design Tokens
- **Canvas / Background**: `#FBF9F5` (Warm Alabaster / Ivory Stone)
- **Obsidian Navy**: `#0B1528` (Header bar, hero sections, primary action buttons)
- **Warm Court Bronze**: `#A37E44` / `#B38D48` (Progress bars, eyebrow subtitles, Roman numeral markers, primary CTAs)
- **Card Surfaces**: `#FFFFFF` with ultra-fine border `#E5E0D8` and soft elevation (`shadow-sm`)
- **Accent Header Band**: `#C5A880` / `#D4B896` / `#E2CEB7` (Official court table header styling)
- **Typography Colors**:
  - Primary text: `#111827` (Near-black slate)
  - Secondary text: `#4B5563` / `#6B7280`
  - Subtle / Placeholder: `#9CA3AF`
  - Verified Badges: `#047857` (Forest emerald)

### 3.2 Typography
- **Headings & Court Template**: Serif (`Playfair Display`, `Cormorant Garamond`, or `Libre Baskerville`)
- **UI & Form Controls**: Clean Sans-Serif (`Inter` or `Plus Jakarta Sans`)
- **Arabic Script**: Classical Calligraphic (`Amiri` or `Noto Naskh Arabic`) with native ligatures and `dir="rtl"`

---

## 4. End-to-End User Experience & 16-Step Wizard Flow

```
[Landing Page] ──► [Sign In / Register] ──► [Dashboard]
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
         [Start New Will]                                              [Continue Draft]
                 │                                                             │
                 └───────────────────────┬─────────────────────────────────────┘
                                         ▼
                               [16-Step Guided Wizard]
   1. Documents (Upload & OCR Extract)     9. Beneficiaries (Primary & Substitutes)
   2. Your Details (Testator Info)        10. Property (Residue & Titled Assets)
   3. Declaration (Section ONE)           11. Minors (Trust provisions for < 21)
   4. Executors (Primary/Substitutes)     12. Powers (Executor/Trustee Powers)
   5. Debts (Section THREE)               13. Guardianship (Children & Guardians)
   6. Wishes (Section FOUR)               14. Execution (Domicile & Attestation)
   7. Jurisdiction (Section FIVE)         15. Review (Status Check & Arabic Names)
   8. Insurance (Section SIX)             16. Generate (HTML / PDF / Print)
                                         │
                                         ▼
                       [Court-Ready Bilingual Will Output]
```

### Wizard Step Specifications
1. **Step 1: Documents**: UAE residency toggle (`Yes`/`No`), drag-and-drop document upload (Passport, Proof of Address, Emirates ID, Visa Copy). Extraction summary card.
2. **Step 2: Your Details**: Testator full name, DOB, nationality, passport number, Emirates ID, Arabic transliterated name, residential address, email, phone.
3. **Step 3: Declaration (Section ONE)**: Declaration of sound mind, memory, age 21+, no duress, UAE estate only, cancellation of previous UAE wills. Legal checkbox.
4. **Step 4: Executors (Section TWO)**: Primary Executor, optional Substitute Executor, optional Further Substitute Executor. Name, DOB, Passport, Emirates ID, Arabic name, address, contact info.
5. **Step 5: Debts (Section THREE)**: Direction to trustees to pay debts, funeral expenses, administration costs. Statutory confirmation.
6. **Step 6: Wishes (Section FOUR)**: Binding clause regarding Letter of Wishes signed after this will. Statutory confirmation.
7. **Step 7: Jurisdiction (Section FIVE)**: Law of UAE applicability to substantive testamentary provisions. Statutory confirmation.
8. **Step 8: Insurance (Section SIX)**: Insurance policy proceeds distribution (nomination form or residue). Statutory confirmation.
9. **Step 9: Beneficiaries (Section SEVEN)**: Primary beneficiary (100% estate) + Substitute beneficiaries with percentage shares totaling strictly 100%.
10. **Step 10: Property (Section SEVEN Clause e)**: Residue estate clause + Optional specific titled assets (Immovable Property, Bank Accounts, Vehicles, Shares) with Emirate, Title Deed Number, and file attachments.
11. **Step 11: Minors (Section SEVEN Clauses c & d)**: Statutory trust provisions for minor beneficiaries under 21 years old (income accumulation, education, maintenance).
12. **Step 12: Powers (Section EIGHT)**: Administrative powers granted to executors/trustees (management, sale, retention, legal counsel appointment).
13. **Step 13: Guardianship (Section NINTH)**: Children declaration toggle ("Do you have children?"). If yes: Children list (Name, DOB, Nationality, Passport), Permanent Guardian, Temporary Guardian, Interim Guardian, and Substitutes.
14. **Step 14: Execution & Attestation**: Country of domicile declaration, residency confirmation, legal attestation acknowledgment.
15. **Step 15: Review**: Pre-flight audit checklist (`✓ Complete` status per section), direct edit triggers, and Arabic Name Approval Table with inline editing.
16. **Step 16: Generate**: Document preview selectors (`Preview English`, `Preview Arabic`, `Preview Bilingual`), `Generate Will` trigger, version stamp (`non-muslim-v1`), generation timestamp history, and `@media print` PDF download.

---

## 5. Technical Architecture & Data Schema

### 5.1 Tech Stack
- **Framework**: Next.js 14+ / 15 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS with custom palette tokens (`alabaster`, `obsidian`, `court-bronze`, `court-tan`)
- **Database**: Neon Serverless PostgreSQL with Prisma ORM
- **State Management**: Zustand (wizard form state with local storage persistence) + Server Actions for DB synchronization
- **Document Reading (OCR)**: LLM Vision API endpoint (Gemini 1.5 Flash / GPT-4o-mini Vision) with confidence scoring
- **Document Generation**: Side-by-side synchronized table with `@media print` court layout

### 5.2 Prisma Schema Structure
- `User`: Authentication and profile record.
- `Will`: Root document record tracking `currentStep`, `status` (`DRAFT`, `REVIEW`, `GENERATED`), `willType` (`INDIVIDUAL`, `MIRROR`), testator fields, statutory flags, and timestamps.
- `Party`: Relational records for all named individuals (`PRIMARY_EXECUTOR`, `SUBSTITUTE_EXECUTOR`, `FURTHER_EXECUTOR`, `PRIMARY_BENEFICIARY`, `SUBSTITUTE_BENEFICIARY`, `PERMANENT_GUARDIAN`, `SUBSTITUTE_PERMANENT_GUARDIAN`, `TEMPORARY_GUARDIAN`, `INTERIM_GUARDIAN`, `SUBSTITUTE_INTERIM_GUARDIAN`) with English name, Arabic transliteration, DOB, nationality, passport, Emirates ID, and share percentage.
- `Child`: Minor children records for Section NINTH guardianship appointments.
- `Asset`: Titled properties, bank accounts, vehicles, and business shares.
- `UploadedDocument`: Stored files with document type, extraction metadata, and 1-year expiry timestamp.
- `GeneratedDocument`: Versioned bilingual drafts and PDF exports.

---

## 6. Official Bilingual Court Template Fidelity

The generated will adheres strictly to the official Abu Dhabi Civil Family Court form `ADJD-NM1221-06-01`:
1. **Side-by-Side Dual Column Table**:
   - Column 1 (Left): English text (`dir="ltr"`).
   - Column 2 (Right): Arabic text (`dir="rtl"`, authentic calligraphic ligatures).
2. **Statutory Verbatim Language**:
   - Sections ONE through NINE, Execution, and Attestation clauses are preserved word-for-word from the court template.
3. **Print Engine (`@media print`)**:
   - Exact court page margins (`15mm` / `20mm`).
   - Page breaks after major sections (`page-break-after: always`).
   - Official footer metadata on every page (`ADJD-NM1221-06-01`, `Page X of 8`, court disclaimer).

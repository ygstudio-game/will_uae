# Project Context: UAE Will Preparation Platform (ADJD Non-Muslim Will)

## 1. Executive Summary
The **UAE Will Preparation Platform** is an elegant, editorial, minimalist legal web application built with **Next.js (App Router), TypeScript, and Tailwind CSS**. It enables non-Muslim expatriates and residents living in the UAE to prepare, verify, and generate a legally compliant Last Will and Testament adhering strictly to the **Abu Dhabi Judicial Department (ADJD) Civil Family Court Non-Muslim Will Template (ADJD-NM1221-06-01)**.

The system guides users through a clear 16-step guided wizard, automatically extracts personal details from uploaded identity documents (Passports, Emirates IDs, Utility Bills), provides side-by-side English/Arabic legal clauses, generates phonetic Arabic transliterations of all English names for user confirmation, and produces a court-ready bilingual PDF/HTML document for official registration and attestation.

---

## 2. Source References & Assets Analyzed
- **Official Legal Court Form**:
  - `ADJD- Non-Muslim Will Template.pdf` (8-page official Abu Dhabi Civil Family Court form `ADJD-NM1221-06-01`)
  - `ADJD- Non-Muslim Will Template.docx` (Official editable source format)
- **Visual Design Benchmarks (18 High-Resolution Reference Screenshots)**:
  - `02-sign-in.png` & `03-create-account.png`: Minimalist auth cards on warm ivory canvas.
  - `04-dashboard.png` & `18-dashboard-mobile.png`: User dashboard displaying draft wills, progress percentages, document review notices, and generated wills.
  - `05-step-documents.png`: Drag-and-drop document upload and OCR auto-extraction summary.
  - `06-step-your-details.png`: Testator personal details, source verification tags, and contact information.
  - `07-step-declaration.png`: Section ONE Declaration with bilingual text and legal confirmation checkbox.
  - `08-step-executors.png`: Primary, substitute, and further substitute executors with document attachments and Arabic transliterations.
  - `09-step-beneficiaries.png`: Primary beneficiary, substitute beneficiaries, and 100% estate share allocation logic.
  - `10-step-property.png`: Residue estate and specific real estate / asset listing with title deed upload.
  - `11-step-minors.png`: Special trust and maintenance clauses for beneficiaries under 21 years old.
  - `12-step-guardianship.png`: Minor children declaration, permanent guardian, temporary guardian, interim guardian, and substitute guardians.
  - `13-step-execution.png`: Country of domicile declaration and attestation agreement.
  - `14-step-review.png`: Comprehensive section audit checklist and Arabic name approval manager.
  - `15-step-generate.png`: Output selector (Preview English, Preview Arabic, Preview Bilingual, Generate Will) and document history log.
  - `16-generated-will-bilingual.png`: The court-ready bilingual output showing the exact Abu Dhabi Civil Family Court two-column format.
  - `17-document-review.png`: OCR review modal comparing extracted fields against uploaded files with confidence scores.
  - `19-landing-page-mobile.png`: High-converting marketing landing page featuring dark navy hero, warm bronze accents, and 4-step process explanation.

---

## 3. Design System & Aesthetics (The Impeccable Standard)
The design avoids generic software looks; it embodies **understated legal luxury, warmth, and precision**:

### 3.1 Color Palette
- **Canvas / Background**: `#FBF9F5` (Warm Alabaster / Ivory Stone)
- **Deep Obsidian / Dark Navy**: `#0B1528` / `#0F172A` (Top navigation bar, hero sections, primary action buttons)
- **Warm Bronze / Ochre**: `#A37E44` / `#B38D48` (Progress bars, eyebrow subtitles, Roman numeral markers, primary CTA buttons)
- **Card Surfaces**: `#FFFFFF` with ultra-fine border `#E5E0D8` and soft, diffused shadow (`shadow-sm`)
- **Table / Section Accent Headers (Will Template)**: `#C5A880` / `#D4B896` / `#E2CEB7` (Classic court warm header band)
- **Typography Colors**:
  - Primary Headlines & Body: `#111827` (Near-black slate)
  - Secondary / Supporting: `#4B5563` / `#6B7280`
  - Subtle / Placeholder: `#9CA3AF`
  - Destructive Actions: `#991B1B` / `#B91C1C` (`Delete draft`)
  - Verified / Approved Badges: `#047857` (Forest emerald)

### 3.2 Typography Hierarchy
- **Serif (Headings & Document View)**: `Playfair Display`, `Cormorant Garamond`, or `Libre Baskerville`
  - Evokes authority, traditional court drafting, and quiet confidence.
- **Sans-Serif (UI, Controls, Inputs, Stepper)**: `Inter` or `Plus Jakarta Sans`
  - High legibility, crisp numbers, clean form controls.
- **Arabic Typography**: `Amiri` or `Noto Naskh Arabic`
  - Classical Arabic calligraphic proportions suitable for official UAE court filings.

---

## 4. End-to-End User Flow
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

---

## 5. Confirmed Project Decisions & Legal Policies (From PM)
1. **Document Storage Policy**:
   - Uploaded identity documents (Passports, Emirates IDs, Utility Bills, Title Deeds) are retained for **1 year**, then automatically purged.
2. **LLM Vision Privacy**:
   - No overt disclaimer or intrusive consent banner needed in the UI. Extraction is handled securely via server-side LLM Vision.
3. **Arabic Name Extraction & Transliteration**:
   - **Emirates ID**: The official Arabic name is read directly from the card.
   - **Passport**: Phonetically transliterated into Arabic script using AI, and reviewed/approved by the user on Step 15.
4. **Court Submission Scope**:
   - The platform completes its job at generating the court-ready bilingual PDF/HTML draft. Final registration and attestation is completed manually on the official ADJD court portal.
5. **Will Types**:
   - Both **Individual Wills** and **Mirror Wills for Couples** (reciprocal wills with shared asset/child details) are supported in the data model.
6. **Payment Gateway**:
   - Deferred; checkout gateway integration will be attached after the core bilingual workflow is finalized.
7. **Reference Test Data**:
   - `Reference YB WILLS/Wills_Questionnaire_ADJD_2026_FILLED_DUMMY.docx.pdf` provides verified client questionnaire data (Testator: *Daniel Michael Carter*, Spouse: *Emma Claire Carter*, Children: *Liam & Noah Carter*, Executors & Guardians: *Sarah Elizabeth Carter* & *James Robert Carter*).
8. **Pending Administrative Specification**:
   - `OWA_Questionnaire_and_Admin_Specification.md` is currently **ON HOLD** pending final stakeholder review. The active design and technical blueprint is guided by the 18 screenshots in `Reference YB WILLS/SS/` and the ADJD statutory template.

---

## 6. Confirmed Technology Stack
- **Framework**: Next.js 14+ / 15 (App Router, Server Actions, Route Handlers).
- **Language**: TypeScript in strict mode.
- **Styling**: Tailwind CSS with custom design tokens (`#FBF9F5` canvas, `#0B1528` obsidian navy, `#A37E44` bronze).
- **Database**: **Neon Serverless PostgreSQL** with **Prisma ORM** (100% free tier, zero compute bill when idle, complete relational integrity).
- **Document Reading (OCR)**: LLM Vision (Gemini 1.5 Flash / GPT-4o-mini Vision) with user verification modal (`Source: Passport · 98%`).
- **Document Generation**: Court-ready dual-column bilingual layout with `@media print` CSS engine matching ADJD-NM1221-06-01 margins and page breaks.


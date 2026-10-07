# Product Requirements Document (PRD)
## UAE Will Preparation Web Application (ADJD Non-Muslim Will)

**Version:** 1.0.0  
**Status:** In Review  
**Target Legal Jurisdiction:** Abu Dhabi Civil Family Court (ADJD - Abu Dhabi Judicial Department)  
**Primary Template:** ADJD-NM1221-06-01 (Non-Muslim Last Will & Testament)

---

## 1. Product Vision & Goals

### 1.1 Problem Statement
Creating a legally binding Non-Muslim Will in the United Arab Emirates has traditionally been expensive (ranging from AED 5,000 to AED 15,000 via law firms), time-consuming, and prone to formatting errors during court filing. Expatriates struggle with bilingual drafting, accurate phonetic Arabic transliteration of foreign names, and understanding statutory court clauses under the Abu Dhabi Civil Family Court law.

### 1.2 Proposed Solution
A modern, minimalist, guided web application that simplifies the preparation of an official ADJD Non-Muslim Will into a guided 16-step process. Users upload their identity documents, confirm extracted data, customize executors, beneficiaries, and guardianship appointments, review phonetically transliterated Arabic names, and generate a court-ready bilingual (English & Arabic) Will document ready for court submission and attestation.

### 1.3 Key Objectives
- **Zero Drafting Errors**: Strict alignment with ADJD template clauses (ADJD-NM1221-06-01) without omitting mandatory statutory wording.
- **Flawless Bilingual Presentation**: Exact side-by-side English (LTR) and Arabic (RTL) alignment.
- **Effortless Onboarding**: Auto-population of personal details from Passports and Emirates IDs.
- **Zero Maintenance Cost**: Architected to run on free-tier, scale-to-zero infrastructure (Neon Postgres / MongoDB Atlas M0).

---

## 2. User Personas
1. **The Expatriate Parent (e.g., John Smith, 37, British)**: Owns property in Dubai/Abu Dhabi, has minor children, needs primary & interim guardianship appointed urgently.
2. **The Asset Owner / Investor**: Holds bank accounts, company shares, and real estate in the UAE; needs clear distribution to spouse and secondary beneficiaries.
3. **The Single Resident**: Needs to designate substitute executors and beneficiaries for end-of-service gratuity and local assets.

---

## 3. Core Feature Specifications

### 3.1 Authentication & Profile Management
- **Sign In / Create Account**: Clean email & password authentication.
- **Session Continuity**: Unfinished drafts auto-save at every step so users can return at any time.
- **Account Actions**: View active draft wills, delete unwanted drafts, view finalized/generated wills.

### 3.2 Dashboard
- **Welcome Banner**: Dynamic greeting (e.g., `Good afternoon, [Name]`), quick "+ Start a new will" CTA.
- **Draft Will Cards**:
  - Testator Name or "Untitled will"
  - Will identifier (e.g. `Will #7 · Started 19 Sep 2026 · Last changed 21 Sep 2026`)
  - Progress indicator (e.g., `Step 16 of 16: Generate Will`, `100%`)
  - "Documents to confirm" notification banner with count and direct `Review` links.
  - Primary actions: `Continue`, `Delete draft`.
- **Generated Will Cards**:
  - Status pill: `GENERATED`
  - List of confirmed parties (Executors, Beneficiaries, Guardians) with links to review documents.
  - Primary action: `Open will`.

---

### 3.3 The 16-Step Guided Will Wizard

| Step # | Step Name | Core Purpose & Fields | Corresponding ADJD Section |
|---|---|---|---|
| **1** | **Documents** | UAE resident toggle (`Yes`/`No`), file upload for Passport, Proof of Address (utility bill), Emirates ID (if resident), Visa Copy (optional). OCR extraction summary. | Testator identification |
| **2** | **Your Details** | Full Legal Name, Date of Birth, Nationality, Passport Number, Emirates ID Number, Arabic Name (phonetic), Residential Address, Email, Phone Number. | Preamble (Page 1) |
| **3** | **Declaration** | Statutory declaration of sound mind, memory, age over 21, no duress/fraud, UAE estate only, cancellation of previous UAE wills. Checkbox acknowledgment. | ONE: Declaration (Page 1) |
| **4** | **Executors** | Primary Executor, optional Substitute Executor, optional Further Substitute Executor. Name, DOB, Passport, Emirates ID, Arabic Name, Contact info. | TWO: Appointment of Executors & Trustees (Page 2) |
| **5** | **Debts** | Direction to trustees to pay lawful debts, funeral expenses, and estate winding-up expenses. Legal clause confirmation. | THREE: Debts & Funeral Expenses (Page 3) |
| **6** | **Wishes** | Direction regarding Letter of Wishes signed after this will. Legal clause confirmation. | FOUR: Letter of Wishes (Page 3) |
| **7** | **Jurisdiction** | UAE law applicability and substantive testamentary provisions. Legal clause confirmation. | FIVE: Jurisdiction (Page 3) |
| **8** | **Insurance** | Insurance proceeds distribution per nomination form or will residue. Legal clause confirmation. | SIX: Insurance Proceeds (Page 3) |
| **9** | **Beneficiaries** | Primary beneficiary (100% whole residue) + Substitute beneficiaries with percentage shares totaling strictly 100% if primary predeceases. | SEVEN: Distribution of Estate (Pages 3 & 4) |
| **10** | **Property** | Residue and property clause + Optional listing of specific titled assets (Immovable property, Bank accounts, Vehicles, Shares) with Emirate, Title Deed Number, and file upload. | SEVEN: Distribution of Estate (Clause e) |
| **11** | **Minors** | Automatic statutory trust provisions for beneficiaries under 21 years old (income accumulation, education, maintenance). | SEVEN: Distribution of Estate (Clauses c & d) |
| **12** | **Powers** | Statutory administrative and legal powers granted to executors/trustees (management, sale, retention, legal counsel appointment). | EIGHT: Powers of Executors & Trustees (Page 5) |
| **13** | **Guardianship** | Child declaration toggle ("Do you have children?"). If yes: Children list (Name, DOB, Nationality, Passport), Permanent Guardian, Temporary Guardian, Interim Guardian, and Substitutes. | NINTH: Guardianship Appointments (Pages 5, 6, 7) |
| **14** | **Execution** | Testator Country of Domicile, UAE residency declaration at time of writing, legal responsibility acknowledgment checkbox. | Execution and Attestation (Page 8) |
| **15** | **Review** | Comprehensive pre-generation audit: status checklist of all sections (`✓ Complete`), edit triggers, and Arabic Name Approval Table with inline editing. | Pre-flight validation |
| **16** | **Generate** | Preview triggers (`Preview English`, `Preview Arabic`, `Preview Bilingual`), `Generate Will` button, court version stamp (`non-muslim-v1`), generation timestamp history, PDF download. | Final Output |

---

### 3.4 Document Processing & Confidence Review
- Users can click `Review and confirm` on any uploaded passport or ID.
- Displays an "Information found" review screen displaying extracted values (Full Name, Date of Birth, Nationality, Passport Number, Issue Date, Expiry Date) alongside OCR confidence percentages (e.g., `Source: Passport · 99%`).
- Changes can be adjusted directly before writing to the will.

### 3.5 Bilingual Document Generation Engine
- **Layout**: Strictly dual-column table layout identical to official court filing.
  - Column 1: English legal text (Left-to-Right).
  - Column 2: Arabic legal text (Right-to-Left, `dir="rtl"`).
- **Format Support**:
  - High-fidelity in-browser preview with print stylesheet (`@media print` for browser "Save to PDF").
  - Server-side PDF export matching exact ADJD page breaks and footer details (`ADJD-NM1221-06-01`, page numbers `Page X of 8`, court disclaimers).

---

## 4. Non-Functional Requirements
1. **Data Security & Privacy**: All identity documents and personal legal details must be encrypted at rest and in transit.
2. **Zero-Cost Idle Architecture**: Database and compute must have no monthly recurring base fees when unused (serverless architecture).
3. **Accessibility & RTL Support**: Flawless bi-directional rendering (Arabic text rendered with authentic ligatures, zero reversed characters).
4. **Mobile Responsiveness**: Complete functionality available on mobile viewports as evidenced in reference screenshots `18-dashboard-mobile.png` and `19-landing-page-mobile.png`.

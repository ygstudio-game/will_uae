# OWA Questionnaire & Admin Platform Evolution — Design Specification

**Date:** 2026-10-07  
**Author:** AI Engineering & PM Alignment  
**Governing Court Template:** `Will Form (3).pdf` (`ADJD-NM0723-07-03` — Abu Dhabi Civil Family Court)  
**Authoritative Product Specification:** `OWA_Questionnaire_and_Admin_Specification (4).md`  
**Target Architecture:** Next.js 14+ (App Router), TypeScript, Neon Serverless PostgreSQL, Prisma ORM, Tailwind CSS

---

## 1. Executive Summary & Problem Statement

This specification defines the evolution of the UAE Will Preparation Platform into the **OWA (Online Will Assistant)** system, transitioning from an exploratory 16-step wizard prototype into a commercial, dual-stage paid platform that prepares, verifies, and manages official court-ready wills for the **Abu Dhabi Judicial Department (ADJD) Civil Family Court**.

### Key Realignment Objectives
1. **New Statutory Court Template**: Replace the older `ADJD-NM1221-06-01` draft with the official 8-page `Will Form (3).pdf` (`ADJD-NM0723-07-03`), including updated headers, footers, and clause arrangements.
2. **Two-Stage Commercial Model**:
   - **Individual Will**: AED 999 initial OWA service fee (payable now) + AED 950 later court fee (payable after draft review) = **AED 1,949 total**.
   - **Wills for Couples**: AED 1,799 initial OWA service fee (payable now) + AED 1,900 later court fee (payable after draft review) = **AED 3,699 total** (contains two separate Wills).
3. **Stage 1 Pre-Payment Intake**: Pre-checkout 7-question qualification onboarding form with transparent price breakdown.
4. **Passwordless Email OTP Authentication**: Modern secure sign-in without passwords (with 1-click PM/Reviewer bypass).
5. **Questionnaire Consolidation (16 Steps → 6 Sections)**:
   - **Section A**: Your Details
   - **Section B**: Children (Under 18; up to 5 children; compulsory passport)
   - **Section C**: Executors (Executor 1 compulsory, Executor 2 substitute, Executor 3 further substitute)
   - **Section D**: Guardians (Permanent Guardian, Substitute Permanent Guardian, Temporary Guardian)
   - **Section E**: Beneficiaries (1 to 5 simultaneous beneficiaries, 100% total; removes the old conditional survivorship introduction)
   - **Section F**: Review & Draft Viewer (Side-by-side bilingual preview; Confirm & continue to court fee payment)
6. **Universal Reusable Identity Profiles**: One `Person` entity per identity across roles (Testator, Executor, Beneficiary, Guardian, Child) to eliminate duplicate document uploads.
7. **Admin Workspace & Operational Workflow**: Application queue with 9 status stages, AI flag verification, draft replacement, and in-app support ticketing.
8. **Draft Security**: Signed-in viewing only for customers (no customer download button or public links).

---

## 2. System Architecture & Database Schema

The application is deployed on Next.js 14 App Router connected to **Neon Serverless PostgreSQL** via Prisma Client.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (React)                        │
│  - Landing Page & Intake Short Form (/start)                           │
│  - Passwordless Email OTP Auth (/auth/otp)                             │
│  - Customer Dashboard (/dashboard)                                     │
│  - 6-Section Guided Questionnaire (/wizard/[section])                  │
│  - In-Browser Bilingual Will Viewer (ADJD-NM0723-07-03)                │
│  - In-App Support Tickets (/dashboard/support)                         │
│  - Admin Portal (/admin): Queue, Flags, Drafts, Tickets                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Next.js Server Layer (API Routes)                   │
│  - POST /api/auth/otp/send & POST /api/auth/otp/verify                 │
│  - POST /api/checkout/initial & POST /api/checkout/court-fee           │
│  - GET/POST/PATCH /api/applications/[id]                               │
│  - GET/POST/PATCH /api/wills/[id]                                      │
│  - GET/POST/PATCH /api/persons (Universal Identity Repository)         │
│  - GET/POST /api/tickets & GET/POST /api/tickets/[id]/replies          │
│  - GET/PATCH /api/admin/applications/[id] (Status, flags, corrections) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Neon Serverless PostgreSQL                        │
│   Account ── Application ── Will (1 or 2) ── RoleAssignment ── Person  │
│               │                      │                                 │
│            Payment               UploadedDocument                      │
│               │                                                        │
│            Ticket ── TicketReply                                       │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Prisma Schema Specification

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum PackageType {
  INDIVIDUAL
  COUPLES
}

enum ApplicationStatus {
  IN_PROGRESS               // Initial fee paid; information/uploads incomplete
  DRAFT_READY               // Draft(s) available for customer review
  COURT_FEE_PENDING         // Current drafts confirmed; court fee pending
  AWAITING_ADMIN_VERIFICATION // Court fee collected; review pending (2-3 days)
  UNDER_ADMIN_REVIEW        // Manual checks underway
  ACTION_REQUIRED           // Customer information/documents requested
  READY_FOR_SUBMISSION      // Review resolved; coordinated for filing
  SUBMITTED_TO_ADJD         // Actual filing recorded (both wills for couples)
  REGISTRATION_COMPLETED    // Court registration recorded
}

enum PaymentMilestone {
  INITIAL_SERVICE_FEE
  COURT_FEE
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
}

enum RoleType {
  TESTATOR
  EXECUTOR_PRIMARY          // Executor 1 (Appointment a)
  EXECUTOR_SUBSTITUTE       // Executor 2 (Appointment b)
  EXECUTOR_FURTHER          // Executor 3 (Appointment d)
  BENEFICIARY               // Beneficiaries 1 through 5
  GUARDIAN_PERMANENT        // Page 6 appointment
  GUARDIAN_SUBSTITUTE_PERM  // Page 7 appointment
  GUARDIAN_TEMPORARY        // Page 7 interim appointment
  CHILD                     // Child 1 through 5
}

enum DocumentType {
  PASSPORT
  EMIRATES_ID
  PROOF_OF_ADDRESS
  TITLE_DEED
  SUPPORTING_DOC
}

enum TicketStatus {
  OPEN
  AWAITING_CUSTOMER
  RESOLVED
}

enum FlagSeverity {
  INFO
  WARNING
  ERROR
}

model Account {
  id           String        @id @default(cuid())
  email        String        @unique
  fullName     String
  phoneNumber  String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  applications Application[]
  otps         OtpToken[]
}

model OtpToken {
  id        String   @id @default(cuid())
  accountId String
  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Application {
  id                 String             @id @default(cuid())
  accountId          String
  account            Account            @relation(fields: [accountId], references: [id], onDelete: Cascade)
  packageType        PackageType        @default(INDIVIDUAL)
  status             ApplicationStatus  @default(IN_PROGRESS)
  
  // Qualification answers
  qualTestatorAge21  Boolean            @default(true)
  qualNonUaeNational Boolean            @default(true)
  qualUaeAssets      Boolean            @default(true)
  qualMarried        Boolean            @default(false)
  qualChildrenUnder18 Boolean           @default(false)
  
  // Partner qualification answers (Couples only)
  qualPartnerAge21   Boolean?
  qualPartnerNonUae  Boolean?
  qualPartnerAssets  Boolean?
  qualPartnerMarried Boolean?
  qualPartnerChildrenUnder18 Boolean?

  wills              Will[]
  persons            Person[]
  payments           Payment[]
  tickets            Ticket[]
  reviewFlags        ReviewFlag[]
  auditEvents        AuditEvent[]
  
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

model Will {
  id                   String            @id @default(cuid())
  applicationId        String
  application          Application       @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  willIndex            Int               @default(1) // 1 for primary testator, 2 for partner
  versionTag           String            @default("ADJD-NM0723-07-03")
  
  // Section A: Testator profile reference
  testatorPersonId     String?
  testatorPerson       Person?           @relation(fields: [testatorPersonId], references: [id])
  domicileCountry      String            @default("United Kingdom")
  
  // Statutory confirmations
  declarationConfirmed Boolean           @default(false)
  hasChildrenUnder18   Boolean           @default(false)
  
  // Section F: Draft confirmation
  isDraftConfirmed     Boolean           @default(false)
  confirmedAt          DateTime?
  
  roleAssignments      RoleAssignment[]
  generatedDrafts      GeneratedDraft[]
  
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt
}

model Person {
  id              String             @id @default(cuid())
  applicationId   String
  application     Application        @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  fullName        String
  arabicName      String?
  isArabicApproved Boolean           @default(false)
  dob             DateTime?
  nationality     String?
  passportNumber  String?
  emiratesId      String?
  isUaeResident   Boolean            @default(true)
  address         String?
  email           String?
  phone           String?
  
  testatorWills   Will[]
  roleAssignments RoleAssignment[]
  documents       UploadedDocument[]
  
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
}

model RoleAssignment {
  id              String       @id @default(cuid())
  willId          String
  will            Will         @relation(fields: [willId], references: [id], onDelete: Cascade)
  personId        String
  person          Person       @relation(fields: [personId], references: [id], onDelete: Cascade)
  role            RoleType
  appointmentOrder Int         @default(1)
  sharePercentage Float?       // 0 to 100 for beneficiaries
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model UploadedDocument {
  id              String       @id @default(cuid())
  personId        String
  person          Person       @relation(fields: [personId], references: [id], onDelete: Cascade)
  documentType    DocumentType
  fileName        String
  fileUrl         String
  fileSizeBytes   Int?
  mimeType        String?
  extractedData   Json?
  ocrConfidence   Float?
  isExpired       Boolean      @default(false)
  expiresAt       DateTime?    // 1-year auto-purge
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model Payment {
  id              String           @id @default(cuid())
  applicationId   String
  application     Application      @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  milestone       PaymentMilestone
  amountAed       Decimal          @db.Decimal(10, 2)
  status          PaymentStatus    @default(COMPLETED)
  transactionRef  String           @unique
  receiptUrl      String?
  createdAt       DateTime         @default(now())
}

model Ticket {
  id              String        @id @default(cuid())
  applicationId   String
  application     Application   @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  ticketNumber    Int           @default(autoincrement())
  subject         String
  status          TicketStatus  @default(OPEN)
  replies         TicketReply[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model TicketReply {
  id         String   @id @default(cuid())
  ticketId   String
  ticket     Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  senderRole String   // "CUSTOMER" or "ADMIN"
  senderName String
  message    String
  fileUrl    String?
  createdAt  DateTime @default(now())
}

model ReviewFlag {
  id            String       @id @default(cuid())
  applicationId String
  application   Application  @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  fieldPath     String
  severity      FlagSeverity @default(WARNING)
  message       String
  isResolved    Boolean      @default(false)
  resolvedBy    String?
  resolutionNotes String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model GeneratedDraft {
  id          String   @id @default(cuid())
  willId      String
  will        Will     @relation(fields: [willId], references: [id], onDelete: Cascade)
  versionNum  Int      @default(1)
  htmlContent String
  docxUrl     String?
  pdfUrl      String?
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model AuditEvent {
  id            String      @id @default(cuid())
  applicationId String
  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  actor         String
  action        String
  details       Json?
  createdAt     DateTime    @default(now())
}
```

---

## 3. Stage 1: Pre-Payment Intake & Commercial Checkout

### 3.1 Pre-Payment Intake (`/start`)
A streamlined 7-question qualification flow presented with high visual clarity:
1. **Full Legal Name**: Text input, carried forward into checkout and testator profile.
2. **Will Preparation Target**:
   - `Myself` → Selects **Individual Will**.
   - `My partner and me` → Selects **Wills for Couples**.
3. **Are you aged 21 or above?**: Yes / No.
4. **Are you a non-UAE national?**: Yes / No.
5. **Do you own any assets in the UAE?**: Yes / No.
6. **Are you married?**: Yes / No (Informational context).
7. **Do you have children under 18?**: Yes / No (Drives minor-child and guardianship branch).

*(For Couples, questions 3–7 are captured for both "You" and "Your partner" with clear tabbed controls).*

### 3.2 Transparent Milestone Pricing Table
Displayed on the order summary before any payment:

| Package | Milestone 1: Pay Now (OWA Service Fee) | Milestone 2: Pay Later (Court Fee) | Total Disclosed Investment |
|---|---:|---:|---:|
| **Individual Will** | **AED 999** | **AED 950** | **AED 1,949** |
| **Wills for Couples** | **AED 1,799** | **AED 1,900** | **AED 3,699** |

- **VAT**: Disclosed as not applicable per owner instruction.
- **Service Fee Policy**: Disclosed as non-refundable upon payment.

### 3.3 Checkout & Initial Payment Simulation
- Collects: Full Name, Email, Phone (with international country code), and acceptance of terms.
- Button: **"Pay AED 999"** or **"Pay AED 1,799"**.
- Interactive simulated payment gateway with 1-click test checkout and immediate receipt creation.
- Successfully creating payment:
  1. Creates or finds `Account`.
  2. Sets up `Application` in `IN_PROGRESS` status.
  3. Pre-populates `Will` (and Will 2 for couples).
  4. Generates authenticated session cookie.
  5. Redirects to `/dashboard` with paid questionnaire unlocked.

---

## 4. Authentication: Passwordless Email OTP

- Replaces traditional password authentication.
- **Workflow**:
  - User submits email at `/auth/signin`.
  - System generates a 6-digit cryptographic OTP expiring in 15 minutes.
  - In development and staging:
    - Code is logged to console and displayed via an on-screen **"Quick Fill OTP"** banner.
    - A dedicated **"1-Click PM & Reviewer Demo Login"** button allows testing without waiting for an email.
  - Session is maintained using signed HTTP-only cookies (`will_session`).

---

## 5. Stage 2: 6-Section Questionnaire (Wizard Consolidation)

The questionnaire replaces the 16 micro-steps with 6 cohesive sections:

### Section A: Your Details
- Testator Name (English and Arabic phonetics).
- Date of Birth (validates 21+ threshold).
- Nationality.
- **Compulsory Uploads**:
  - Passport (all testators).
  - Proof of Address (utility bill, tenancy contract, bank statement).
- Emirates ID (compulsory for UAE residents).
- Residential Address (current physical home; asset address cannot be substituted).
- Country of Domicile (explicit separate field as required by Page 8).
- Phone and Email.

### Section B: Children
- Reuses pre-payment answer to *"Do you have children under 18?"*, with option to edit.
- If Yes: Allows adding up to 5 children.
- Fields per child: Full name, DOB, Nationality, Passport number, Passport upload (compulsory), and residential address (*"Use testator's address"* toggle).
- If passport unavailable: Triggers *"Submit a support request"* modal with pre-filled subject *"Child passport assistance"*, preserving user progress without blocking.

### Section C: Executors
- *"Who should carry out the instructions in your Will?"*
- **Executor 1** (Compulsory primary appointment).
- **Executor 2** (Optional substitute appointment).
- **Executor 3** (Optional further substitute appointment).
- Ordered conditional fallback; max 3. Selected from existing saved person profiles or added via inline modal.

### Section D: Guardians
- Displayed only when children under 18 are listed.
- **Permanent Guardian** (Compulsory — Page 6 appointment).
- **Substitute Permanent Guardian** (Compulsory fallback — Page 7 appointment).
- **Temporary Guardian** (Optional interim custodian in the UAE while permanent guardians take custody; accepts Emirates ID as residency indicator).
- Spouse is suggested as a selectable choice; the old 4th backup appointment is omitted per PM spec.

### Section E: Beneficiaries & Estate Distribution
- *"Who should receive your estate, and what percentage should each receive?"*
- Add 1 to 5 beneficiaries.
- Real-time share allocation badge: **Allocated: X% / Remaining: Y%**.
- Single beneficiary receives 100%; multiple beneficiaries must sum to strictly 100%.
- Simultaneous distribution: **Removes the old introductory condition** *"If the above beneficiary does not survive me, but in such event only..."* in both English and Arabic clauses.

### Section F: Review & Draft Viewer
- Summary checklist of all sections with direct *"Edit"* jump links.
- For Couples: Verifies that both Will 1 and Will 2 are 100% complete.
- Live Dual-Column Bilingual Draft Viewer based on `ADJD-NM0723-07-03`.
- Actions:
  - **"Edit Information"**: Returns to questionnaire.
  - **"Confirm and Continue"**: Records draft confirmation timestamp and opens the Court-Fee Checkout.

---

## 6. Bilingual Court Template Engine (`Will Form (3).pdf` / `ADJD-NM0723-07-03`)

The generated Will conforms to the official 8-page format:

### Structural Mapping Table

| Page # | Section Title | Contents & Treatment |
|---|---|---|
| **Page 1** | **Preamble & ONE: Declaration** | Official Abu Dhabi Civil Family Court header, Judicial Department emblem. Synchronized table for Testator Name, Nationality, DOB, Passport, Emirates ID, Residential Address. Verbatim statutory Section ONE declaration (sound mind, 21+, UAE estate only, revocation of prior UAE wills). |
| **Page 2** | **TWO: Appointment of Executors & Trustees** | Appointment a (Primary Executor), Appointment b (Substitute Executor), Appointment c/d (Further Substitute). Unused blocks cleanly omitted. |
| **Page 3** | **THREE, FOUR, FIVE, SIX** | Verbatim statutory clauses: Debts & Funeral Expenses, Letter of Wishes, Jurisdiction (Secular Civil Family Law), Entitlements of Insurance Proceeds. |
| **Page 4** | **SEVEN: Distribution of Estate (Part 1)** | Residue clause. Up to 5 simultaneous beneficiaries with % shares. Introductory survivorship condition removed in both languages. |
| **Page 5** | **SEVEN (Part 2) & EIGHT: Powers of Trustees** | Statutory minor trust clauses (c & d) and pro-rata redistribution (e). Section EIGHT verbatim trustee powers (a to e). |
| **Page 6** | **NINE: Guardianship (Part 1)** | Permanent Guardian appointment and list of minor children (1 to 5) with DOB, nationality, and passport. |
| **Page 7** | **NINE: Guardianship (Part 2)** | Substitute Permanent Guardian appointment. Optional Temporary/Interim Guardian appointment. 4th backup appointment removed. |
| **Page 8** | **TEN: Execution & Attestation** | Country of Domicile, UAE residence declaration, legal accuracy confirmation, signature blocks, and official court attestation placeholder. |

### Footer on All 8 Pages
- Official hotline: `600 599 799`
- Email: `CivilFamilyCourt@adjd.gov.ae`
- Page counter: `PAGE X of 8` / `صفحة X من 8`
- Reference code: **`ADJD-NM0723-07-03`**
- Copyright: `All rights reserved to Abu Dhabi Judicial Department, © 2023`

### Access Control
- Customers have **signed-in viewing access only**. No customer download button, public share link, or registered Will upload feature.
- Admin has tools to download DOCX/PDF and upload externally corrected versions.

---

## 7. Stage 3: Court-Fee Checkout & Admin Portal

### 7.1 Court-Fee Checkout
- Unlocks in Section F once the draft is confirmed.
- Amount: **AED 950** (Individual) or **AED 1,900** (Couples).
- On payment:
  - Locks customer questionnaire editing.
  - Updates application status to `AWAITING_ADMIN_VERIFICATION`.
  - Notifies admin to begin manual verification.

### 7.2 The 9-Stage Shared Application Status Pipeline

```
[In progress] ──► [Draft ready] ──► [Court fee pending] ──► [Awaiting admin verification]
                                                                        │
                                                                        ▼
[Registration completed] ◄── [Submitted to ADJD] ◄── [Ready for submission] ◄── [Under admin review]
                                                                        │
                                                                 (if issues)
                                                                        ▼
                                                                [Action required]
```

### 7.3 Admin Workspace (`/admin`)
- **Application Queue**: Filterable by status, package, customer name, date, and unresolved AI flags.
- **Application Details**:
  - Payment milestones log (AED 999/1,799 and AED 950/1,900 with timestamps).
  - Person directory & identity document inspector.
  - AI Verification Flags: Displays OCR confidence, expiry warnings, and data inconsistencies. Admin must resolve flags with a note.
  - Draft management: Preview bilingual draft, export DOCX/PDF, edit data and regenerate, or upload an externally corrected draft.
  - Status pipeline controller: Advance status from `Under admin review` → `Ready for submission` → `Submitted to ADJD` → `Registration completed`.
  - Court fee remittance tracker: Record remittance to ADJD separately from customer collection.

### 7.4 In-App Support Ticketing
- **For Customers**:
  - Create and view tickets under `/dashboard/support`.
  - Contextual trigger: *"Child passport assistance"* button in Section B creates a ticket automatically.
  - Reply and upload requested replacement documents.
- **For Admin**:
  - Central ticket inbox (`/admin/tickets`).
  - View ticket thread, reply to customer, request replacement documents, and mark as resolved.

---

## 8. Phased Implementation Milestones

Following the PM delivery sequence in Section 12:

| Milestone | Scope & Deliverables |
|---|---|
| **M1: Data Model & Court Template** | Update Prisma schema (`Application`, `Will`, `Person`, `RoleAssignment`, `Payment`, `Ticket`). Build the 8-page `Will Form (3).pdf` (`ADJD-NM0723-07-03`) bilingual layout. |
| **M2: Pre-Payment Intake & OTP Auth** | 7-Question qualification intake (`/start`), transparent order summary, initial checkout (AED 999 / AED 1,799), and passwordless Email OTP auth. |
| **M3: 6-Section Questionnaire** | Refactor wizard into Sections A through F, universal person repository, document reuse, and Couples copy/swap logic. |
| **M4: Court-Fee Checkout & Admin Portal** | Milestone 2 checkout (AED 950 / AED 1,900), Admin workspace (`/admin`) with queue, AI flags, draft export/replacement, and support ticketing. |
| **M5: End-to-End Verification** | Verification across desktop & mobile viewports, seed data, and acceptance checks. |

---

## 9. Acceptance Criteria (Matching Section 11 of PM Spec)

1. **Pre-Payment**: 7-Question intake captures Name, Package, Age 21+, Non-UAE nationality, UAE assets, Marital status, and Children under 18. Both pricing milestones are visible before purchase.
2. **Access Control**: Initial payment unlocks questionnaire and support ticketing. OTP access prevents cross-account exposure.
3. **Identity Profiles**: One person entity reuses documents across roles without duplicate uploads. Testators require proof of address and mandatory contact details.
4. **Passports**: Compulsory for all named parties. Child passport assistance ticket preserves progress without unblocking generation.
5. **Beneficiaries**: 1 to 5 simultaneous beneficiaries totalling 100%. Generates without the introductory survivorship condition.
6. **Executors**: 1 compulsory, up to 2 optional substitutes in sequential fallback order.
7. **Guardians**: Permanent + Substitute Permanent required for minor children; Temporary optional. No 4th backup appointment.
8. **Couples**: Copy details mirrors shared profiles, swaps partner beneficiary roles, and keeps executors distinct. Both wills required before draft confirmation.
9. **Locking**: Customer confirmation locks questionnaire edits upon court fee payment.
10. **Court Output**: Official `ADJD-NM0723-07-03` layout across 8 pages with matching headers, footers, dual columns, and page breaks. No customer download button.
11. **Admin Workspace**: Queue displays all 9 shared statuses, manual review flag resolution, DOCX/PDF export, draft replacement, and ticket handling.

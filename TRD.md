# Technical Requirements Document (TRD)
## UAE Will Preparation Web Application (ADJD Non-Muslim Will)

**Version:** 1.0.0  
**Stack:** Next.js 14+ / 15 (App Router), TypeScript, Tailwind CSS, Neon Serverless Postgres / MongoDB Atlas

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (React)                        │
│  - Landing Page (Responsive)                                           │
│  - Auth (Sign In / Register)                                           │
│  - Dashboard (Drafts & Final Wills)                                    │
│  - 16-Step Stepper & Form State Engine (Zustand / React Hook Form)     │
│  - Bilingual Court Preview Component (LTR & RTL synchronized layout)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Next.js Server Layer (Server Actions & Route Handlers)   │
│  - Authentication & Session Verification (NextAuth / JWT / IronSession)│
│  - Document Upload & OCR Ingestion Service                             │
│  - Phonetic Arabic Transliteration Utility                             │
│  - Will Validation & State Machine                                     │
│  - Court-Ready HTML/PDF Generation Engine                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌───────────────────────────────────┐   ┌────────────────────────────────┐
│   Zero-Cost Database Layer        │   │     File & Document Storage    │
│   Primary Choice: Neon Postgres   │   │     - Local / Vercel Blob /    │
│   (Serverless, scale-to-zero)     │   │       Cloudinary Free Tier     │
│   Alternative: MongoDB Atlas (M0) │   │     - Secure encrypted assets  │
└───────────────────────────────────┘   └────────────────────────────────┘
```

---

## 2. Confirmed Database: Neon Serverless PostgreSQL

Neon Serverless PostgreSQL paired with Prisma ORM has been confirmed by the team and PM. It satisfies all core constraints:
- **Pricing & Idle Cost**: **$0.00 / month forever** (Free tier: 0.5 GiB storage, 1 project).
- **Scale-to-Zero Compute**: Automatically suspends compute instances during periods of inactivity so zero resource hours or bills are accumulated.
- **Relational Integrity**: Native foreign key constraints between `Testator`, `Parties` (Executors, Beneficiaries, Guardians), `Children`, `Assets`, and `UploadedDocuments`.
- **TypeScript End-to-End Safety**: Prisma Client provides autocompleted queries and strict type validation against the official ADJD court fields.


---

## 3. Data Schema Specifications (Prisma / SQL Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum WillStatus {
  DRAFT
  REVIEW
  GENERATED
}

enum PartyType {
  PRIMARY_EXECUTOR
  SUBSTITUTE_EXECUTOR
  FURTHER_EXECUTOR
  PRIMARY_BENEFICIARY
  SUBSTITUTE_BENEFICIARY
  PERMANENT_GUARDIAN
  SUBSTITUTE_PERMANENT_GUARDIAN
  TEMPORARY_GUARDIAN
  INTERIM_GUARDIAN
  SUBSTITUTE_INTERIM_GUARDIAN
}

enum DocumentType {
  PASSPORT
  EMIRATES_ID
  UTILITY_BILL
  VISA
  TITLE_DEED
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  wills        Will[]
}

model Will {
  id                  String       @id @default(cuid())
  userId              String
  user                User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  willNumber          Int          @default(autoincrement())
  status              WillStatus   @default(DRAFT)
  currentStep         Int          @default(1) // 1 to 16
  versionTag          String       @default("non-muslim-v1")
  
  // Testator details
  fullName            String?
  arabicName          String?
  dob                 DateTime?
  nationality         String?
  passportNumber      String?
  emiratesId          String?
  isUaeResident       Boolean      @default(true)
  residentialAddress  String?
  emailAddress        String?
  contactNumber       String?
  domicileCountry     String?
  
  // Statutory confirmations
  declarationConfirmed Boolean     @default(false)
  debtsConfirmed       Boolean     @default(false)
  wishesConfirmed      Boolean     @default(false)
  jurisdictionConfirmed Boolean    @default(false)
  insuranceConfirmed   Boolean     @default(false)
  powersConfirmed      Boolean     @default(false)
  executionConfirmed   Boolean     @default(false)
  
  // Flag for children
  hasChildren         Boolean      @default(false)
  hasTitledAssets     Boolean      @default(false)

  // Related entities
  parties             Party[]
  children            Child[]
  assets              Asset[]
  documents           UploadedDocument[]
  generatedDocs       GeneratedDocument[]

  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
}

model Party {
  id              String     @id @default(cuid())
  willId          String
  will            Will       @relation(fields: [willId], references: [id], onDelete: Cascade)
  partyType       PartyType
  fullName        String
  arabicName      String?
  isArabicApproved Boolean   @default(false)
  dob             DateTime?
  nationality     String?
  passportNumber  String?
  emiratesId      String?
  isUaeResident   Boolean    @default(false)
  address         String?
  email           String?
  phone           String?
  sharePercentage Float?     // Relevant for substitute beneficiaries (must sum to 100%)
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

model Child {
  id              String     @id @default(cuid())
  willId          String
  will            Will       @relation(fields: [willId], references: [id], onDelete: Cascade)
  fullName        String
  arabicName      String?
  dob             DateTime?
  nationality     String?
  passportNumber  String?
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

model Asset {
  id              String     @id @default(cuid())
  willId          String
  will            Will       @relation(fields: [willId], references: [id], onDelete: Cascade)
  assetType       String     // "Immovable Property", "Bank Account", "Vehicle", "Shares"
  description     String
  emirate         String?
  titleDeedNumber String?
  documentUrl     String?
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

model UploadedDocument {
  id              String       @id @default(cuid())
  willId          String
  will            Will         @relation(fields: [willId], references: [id], onDelete: Cascade)
  documentType    DocumentType
  targetRole      String       // "Testator", "David Alan Whitfield", etc.
  fileName        String
  fileSize        String
  fileUrl         String
  extractedData   Json?        // Key-value extracted details
  confidenceScores Json?       // e.g. { "fullName": 99, "passportNumber": 98 }
  isConfirmed     Boolean      @default(false)
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model GeneratedDocument {
  id              String     @id @default(cuid())
  willId          String
  will            Will       @relation(fields: [willId], references: [id], onDelete: Cascade)
  format          String     // "Bilingual (HTML)", "Ar (HTML)", "En (HTML)", "PDF"
  fileUrl         String?
  createdAt       DateTime   @default(now())
}
```

---

## 4. Frontend Design Tokens & Styling Architecture

### 4.1 Tailwind Theme Extensions
```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#FBF9F5',      // Warm alabaster / ivory background
        obsidian: {
          900: '#0B1528',      // Dark navy header, primary buttons
          800: '#111C33',
        },
        bronze: {
          DEFAULT: '#A37E44',  // Primary accent / buttons / Roman numerals
          dark: '#8C6B37',
          light: '#C5A880',
          pale: '#F4ECE0',
        },
        court: {
          header: '#C5A880',   // Table header in legal template
          border: '#E5E0D8',   // Subtle card borders
          cream: '#FAF7F2',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Noto Naskh Arabic', 'Cairo', 'sans-serif'],
      },
    },
  },
};
```

---

## 5. Intelligent Document Processing (OCR Pipeline)
1. **Document Dropzone**: Accepts PDF, PNG, JPG up to 15MB.
2. **Extraction Engine**:
   - Parses Machine Readable Zone (MRZ) on passports.
   - Extracts: Full Legal Name, Date of Birth, Nationality, Passport Number, Expiry Date, Issue Date, Place of Birth.
   - Computes field confidence scores (e.g. `98%`).
3. **Phonetic Arabic Transliteration Engine**:
   - For every non-Arabic name (e.g., "John Michael Smith" ➔ "جون مايكل سميث"), generates standard Arabic phonetic transcription.
   - Never translates meanings; strictly transliterates phonetically per UAE official translation norms.
   - User reviews and confirms in Step 15 before document generation.

---

## 6. Bilingual Court Document Generator Engine
- **ADJD Template Replica**:
  - Two parallel synchronized columns:
    - Left Column: English text with official ADJD legal clauses.
    - Right Column: Arabic text with official ADJD legal clauses (`dir="rtl"`).
  - Proper print stylesheet `@media print`:
    - Clean pagination (`page-break-after: always`).
    - Exact footer repetition: `ADJD-NM1221-06-01`, page numbers `Page X of 8`, court hotline `600 599 799`, copyright notices.
  - Export capabilities:
    - Print to PDF directly from browser with zero loss of vector crispness.
    - Standalone downloadable Bilingual HTML, English HTML, and Arabic HTML.

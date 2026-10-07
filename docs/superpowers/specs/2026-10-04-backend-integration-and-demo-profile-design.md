# Design Specification: Backend Integration, Dynamic Will Persistence & PM Demo Profile

**Date:** 2026-10-04  
**Status:** Approved for Implementation  
**Target:** UAE Will Preparation Platform (ADJD Civil Family Court)  
**Database:** Neon Serverless PostgreSQL (`@prisma/client`)  

---

## 1. Executive Summary

This specification defines the transition of the UAE Will Preparation Platform from client-side in-memory mock state to a full-stack, production-grade web application with live cloud persistence on **Neon Serverless PostgreSQL**.

It introduces:
1. Real authentication with secure password hashing and HTTP-only session cookies.
2. A **One-Click Demo Profile ("Project Manager Demo")** pre-loaded with the court-ready Daniel Michael Carter test fixture (Will #1, 3 executors, 2 children, 2 assets, verified Step 15 transliterations, and dual-column bilingual court preview).
3. Dynamic Will CRUD and step auto-save APIs (`/api/wills`, `/api/wills/[id]`).
4. Decoupling of client Zustand store from hardcoded fixtures, allowing clean new will drafts while retaining sample loading capabilities.
5. Dynamic Dashboard and Print/Viewer engines wired to live database records by route identifier.

---

## 2. Goals & Non-Goals

### Goals
- **Zero Hardcoded Fakes**: Eliminate static `setTimeout` auth and pre-populated fixture data from regular user accounts.
- **Neon Cloud Persistence**: All testators, executors, beneficiaries, children, assets, statutory confirmations, and transliterated Arabic names persist in Neon Postgres.
- **Seamless PM Demo Flow**: Provide a prominent "Instant Demo Login" on the Sign-In page so the Project Manager can test the entire completed application in one click without manually typing credentials or filling 16 wizard steps.
- **Auto-Save & Real-Time Sync**: Every "Save & Continue" action in the 16-step wizard syncs the step's payload to the Neon database via `PATCH /api/wills/[id]`.
- **Dynamic Route-Based Rendering**: `/will/[id]` and `/will/[id]/print` query the database by ID and render the verified bilingual ADJD court document.

### Non-Goals
- Multi-tenancy law firm SaaS admin panel (marked ON HOLD per project directives).
- Payment gateway integration (Phase 2 scope).

---

## 3. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js App Router (Client)                    │
│                                                                        │
│  [ Sign In Page ] ───────> [ Client Dashboard ] ────> [ 16-Step Wizard]│
│         │                          │                         │         │
│  (Demo Login / Regular)     (Live DB Query)           (Step Auto-save) │
│         │                          │                         │         │
│         ▼                          ▼                         ▼         │
│   POST /api/auth/*           GET /api/wills           PATCH /api/wills │
└─────────┬──────────────────────────┬─────────────────────────┬─────────┘
          │                          │                         │
          ▼                          ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Next.js Route Handlers (API)                      │
│                                                                        │
│  - /api/auth/register    - /api/auth/signin    - /api/auth/demo        │
│  - /api/auth/me          - /api/auth/signout                           │
│  - /api/wills (GET list, POST create)                                  │
│  - /api/wills/[id] (GET detail, PATCH step data, DELETE will)          │
│  - /api/ocr (Multi-part file parser & structured field extractor)      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Prisma Client (Pooled)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Neon Serverless PostgreSQL (ep-mute-sea...)             │
│                                                                        │
│  - User (id, email, passwordHash, name)                                │
│  - Will (id, willNumber, status, currentStep, statutory clauses...)    │
│  - Party (executors, beneficiaries, guardians, arabic names)           │
│  - Child (minor children, Arabic transliteration, DOB)                 │
│  - Asset (real estate, bank accounts, vehicle title deeds)             │
│  - UploadedDocument (passport, Emirates ID, OCR metadata)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. API Endpoints & Contracts

### 4.1 Authentication Endpoints

#### `POST /api/auth/register`
- **Request Body:** `{ email: string, password: string, name: string }`
- **Behavior:** Checks for existing email, hashes password with `bcryptjs`, creates `User` in Neon DB, issues secure signed HTTP-only cookie (`will_session`).
- **Response:** `{ success: true, user: { id, email, name } }`

#### `POST /api/auth/signin`
- **Request Body:** `{ email: string, password: string }`
- **Behavior:** Verifies user credentials against `passwordHash`, issues signed session cookie.
- **Response:** `{ success: true, user: { id, email, name } }`

#### `POST /api/auth/demo`
- **Purpose:** Special PM Reviewer endpoint.
- **Behavior:** Checks for or creates the demo user `daniel@example.com` (Daniel Michael Carter), ensures the pre-seeded completed Will #1 exists with all 3 parties, 2 children, and 2 assets, issues a signed session cookie, and returns the demo profile.
- **Response:** `{ success: true, user: { id, email: "daniel@example.com", name: "Daniel Michael Carter" } }`

#### `GET /api/auth/me`
- **Behavior:** Reads `will_session` cookie, verifies token, returns current user profile or `{ user: null }`.

#### `POST /api/auth/signout`
- **Behavior:** Clears the session cookie.

---

### 4.2 Will Management Endpoints

#### `GET /api/wills`
- **Behavior:** Fetches all wills belonging to the authenticated user from Neon DB, including count of parties, children, and assets.
- **Response:** `Array<{ id, willNumber, status, currentStep, willType, fullName, updatedAt, partiesCount, childrenCount }>`

#### `POST /api/wills`
- **Request Body:** `{ willType?: "INDIVIDUAL" | "MIRROR" }`
- **Behavior:** Creates a fresh `Will` draft in Neon DB for the current user, setting `currentStep: 1`, `status: "DRAFT"`.
- **Response:** `{ success: true, will: { id, willNumber, currentStep, willType } }`

#### `GET /api/wills/[id]`
- **Behavior:** Fetches the full relational will object (`user`, `parties`, `children`, `assets`, `documents`) ensuring the requesting user owns the document.
- **Response:** Full will document matching the TypeScript `Will` interface.

#### `PATCH /api/wills/[id]`
- **Request Body:** Step update payload (e.g., `{ step: 2, testator: { fullName, dob, nationality... } }` or `{ step: 4, parties: [...] }`).
- **Behavior:** Atomically updates the `Will` table and synchronizes relational child/party/asset rows using Prisma transaction or upsert. Updates `currentStep` to the highest reached step.
- **Response:** `{ success: true, will: { id, currentStep } }`

#### `DELETE /api/wills/[id]`
- **Behavior:** Deletes the will and cascades deletions across parties, children, and assets.
- **Response:** `{ success: true }`

---

## 5. Client State & Wizard Decoupling

1. **Clean Initial Zustand State**:
   - The store starts empty for new sessions (`testator: { fullName: "", nationality: "British" }`, empty `parties`, empty `children`, empty `assets`).
2. **Dynamic Database Hydration (`loadWill(willId)`)**:
   - Store provides an action `loadWill(willId)` which calls `GET /api/wills/[id]` and populates the Zustand state.
3. **Interactive "Load Sample Data" Button on Step 1**:
   - For fast manual testing without typing, users or testers can click *"Fill with Sample Court Data"* on Step 1, which populates the form with valid sample values while still saving them cleanly to the database.
4. **Step Synchronization in `WizardNavigation`**:
   - The "Save & Continue" button checks validation, calls `PATCH /api/wills/[id]`, displays an unobtrusive saving status, and advances to the next step.

---

## 6. PM Demo Flow Specification

1. **Sign-In Page (`/auth/signin`)**:
   - Displays clean email/password inputs for regular users.
   - Features a prominent editorial banner:  
     **"Reviewing this project? Click below to explore the pre-loaded court-ready demo with real database records."**
   - Button: **"Launch Project Manager Demo Account"**
2. **Instant Demo Login**:
   - Calls `POST /api/auth/demo`.
   - Immediately redirects to `/dashboard`, greeted as **Daniel Michael Carter**.
   - Dashboard displays:
     - Active Draft: Will #1 at Step 15 (Review & Transliteration) with 94% progress.
     - Generated Court Will Card with "View Bilingual Document" and "Download Court PDF" actions.
     - Document extraction alert banner with 1 verified document.
3. **Bilingual Court Document Live Inspection**:
   - Clicking "View Bilingual Will" opens `/will/[id]`, pulling the live relational record from Neon Postgres and displaying the synchronized side-by-side English/Arabic court document.
   - Clicking "Print / Save PDF" opens `/will/[id]/print` with automated print dialog and court margin preservation.

---

## 7. Security & Session Integrity

- Passwords hashed using standard `bcryptjs` with salt rounds = 10.
- Session tokens signed with HMAC-SHA256 via a secret stored in environment (`AUTH_SECRET` with safe development fallback).
- HTTP-only cookies with `SameSite=Lax`, `Path=/`, and `Secure` enabled in production.
- Prisma queries strictly scoped by `userId` to ensure data isolation.

---

## 8. Verification & Test Plan

1. **Automated Unit & API Tests**:
   - Test registration with a new email and password.
   - Test login with valid vs. invalid credentials.
   - Test demo login creation and session cookie issuance.
   - Test creating a will draft, patching Steps 1 through 15, and verifying data in Neon Postgres.
2. **Browser End-to-End Verification**:
   - Verify PM Demo Login flow from `/auth/signin` -> `/dashboard` -> `/will/[id]` -> `/will/[id]/print`.
   - Verify starting a new clean will as a fresh registered user and completing steps.
   - Verify mobile responsiveness (`390x844`) across all new auth and dashboard states.

# Backend Integration, Dynamic Will Persistence & PM Demo Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native execution selected by user) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the UAE Will Preparation Platform from client-side in-memory mock data into a fully dynamic, working web application backed by Neon Serverless PostgreSQL, real session authentication, step auto-saving, and a one-click Project Manager Demo Profile.

**Architecture:** Next.js 14 App Router route handlers communicate with Neon Serverless PostgreSQL using Prisma Client. Session state is managed via secure signed HTTP-only cookies (`will_session`). Client store is decoupled from hardcoded fixtures, enabling real CRUD lifecycle while providing a dedicated PM Demo login that mounts the pre-seeded Daniel Michael Carter court records.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma 5, Neon Postgres, bcryptjs, Web Crypto / jose.

**Spec:** [`docs/superpowers/specs/2026-10-04-backend-integration-and-demo-profile-design.md`](file:///d:/COding/InternShip%20Work/E-STUDYPAL/LAUNCHPIT\Will\docs\superpowers\specs\2026-10-04-backend-integration-and-demo-profile-design.md)

## Global Constraints

- Never alter or omit the statutory court clauses matching Form `ADJD-NM1221-06-01`.
- Maintain strict bilingual synchronization (LTR English on left, RTL Arabic on right).
- All database operations must execute against the live Neon Postgres database via `lib/prisma.ts`.
- Zero idle cost, serverless compatibility ($0 tier).
- High visual design craft (`#FBF9F5` alabaster, `#0B1528` obsidian, `#A37E44` bronze) with zero AI slop.

## Review Focus

- Missing or invalid session cookie on protected API routes must return 401 Unauthorized gracefully.
- Foreign key cascading deletes must remove associated parties, children, and assets when a Will is deleted.
- Non-Muslim age confirmation (21+ years) must be validated server-side on registration.
- Arabic transliterated names must persist reliably in UTF-8 without character encoding corruption.
- One-click PM demo login must guarantee the existence of Daniel Carter's Will #1 with its 3 parties, 2 children, and 2 assets even if deleted earlier.

---

### Task 1: Auth & Session Management Core

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/register/route.ts`
- Create: `app/api/auth/signin/route.ts`
- Create: `app/api/auth/demo/route.ts`
- Create: `app/api/auth/me/route.ts`
- Create: `app/api/auth/signout/route.ts`
- Test: `scripts/test-auth-apis.ts`

**Interfaces:**
- Produces:
  - `hashPassword(password: string): Promise<string>`
  - `verifyPassword(password: string, hash: string): Promise<boolean>`
  - `createSessionCookie(userId: string): Promise<string>`
  - `getSessionUser(req?: Request): Promise<User | null>`

- [x] **Step 1: Install auth dependency (`bcryptjs` and `@types/bcryptjs`)**
  Run: `npm install bcryptjs && npm install -D @types/bcryptjs`
- [x] **Step 2: Implement session token and password utilities in `lib/auth.ts`**
  Implement standard HMAC-SHA256 token signing and verification using native Web Crypto, plus bcrypt password hashing.
- [x] **Step 3: Implement route handlers in `app/api/auth/`**
  - `register/route.ts`: Validate name, email, password; hash password; insert into `prisma.user`; set cookie.
  - `signin/route.ts`: Lookup user; compare hash; set cookie.
  - `demo/route.ts`: Upsert demo user `daniel@example.com`, ensure Will #1 exists with full parties/children/assets fixture; set cookie.
  - `me/route.ts`: Return `{ user: { id, email, name } }` or `{ user: null }`.
  - `signout/route.ts`: Clear `will_session` cookie.
- [x] **Step 4: Create and run verification script `scripts/test-auth-apis.ts`**
  Run: `npx tsx scripts/test-auth-apis.ts` to test register, signin, demo login, me, and signout against live Neon Postgres.
- [x] **Step 5: Verify all tests pass and commit**

---

### Task 2: Will Management & Step Auto-Save APIs

**Files:**
- Create: `app/api/wills/route.ts`
- Create: `app/api/wills/[id]/route.ts`
- Test: `scripts/test-will-apis.ts`

**Interfaces:**
- Consumes: `getSessionUser` from `lib/auth.ts`, `prisma` from `lib/prisma.ts`
- Produces:
  - `GET /api/wills`: Returns user's will summaries.
  - `POST /api/wills`: Creates empty will draft linked to user.
  - `GET /api/wills/[id]`: Returns full relational will.
  - `PATCH /api/wills/[id]`: Atomically updates step payload & entities.
  - `DELETE /api/wills/[id]`: Cascades deletion of draft will.

- [x] **Step 1: Implement `app/api/wills/route.ts`**
  - `GET`: Authenticate user, query `prisma.will.findMany` with party/child/asset counts, return JSON list.
  - `POST`: Authenticate user, create `prisma.will.create` with default status `DRAFT`, return new `will.id`.
- [x] **Step 2: Implement `app/api/wills/[id]/route.ts`**
  - `GET`: Authenticate user, find unique will by `id` including `parties`, `children`, `assets`, `documents`.
  - `PATCH`: Handle partial step updates (testator details, statutory flags, or replace/upsert child, party, asset lists). Update `updatedAt` and `currentStep`.
  - `DELETE`: Delete `prisma.will.delete({ where: { id, userId } })`.
- [x] **Step 3: Create and run verification script `scripts/test-will-apis.ts`**
  Run: `npx tsx scripts/test-will-apis.ts` to create draft, update step 2, add party, fetch full will, and delete.
- [x] **Step 4: Verify live database persistence on Neon and commit**

---

### Task 3: Decouple Client Store & Enable Step Auto-Save

**Files:**
- Modify: `store/useWillStore.ts`
- Modify: `components/wizard/WizardNavigation.tsx`
- Modify: `components/wizard/steps/Step1Documents.tsx`

**Interfaces:**
- Produces:
  - `useWillStore.getState().activeWillId: string | null`
  - `useWillStore.getState().loadWillFromDatabase(willId: string): Promise<void>`
  - `useWillStore.getState().loadSampleData(): void`
  - `useWillStore.getState().saveCurrentStep(step: number): Promise<boolean>`

- [x] **Step 1: Update `store/useWillStore.ts` initial state**
  Replace hardcoded Daniel Carter default state with clean, empty defaults (`fullName: ""`, empty arrays for `parties`, `children`, `assets`).
- [x] **Step 2: Add database hydration and save actions to `useWillStore.ts`**
  - Implement `loadWillFromDatabase(id)` fetching from `GET /api/wills/[id]`.
  - Implement `saveCurrentStep(step)` posting current step payload to `PATCH /api/wills/[id]`.
  - Retain `loadSampleData()` as an explicit, user-triggered helper.
- [x] **Step 3: Update `WizardNavigation.tsx`**
  Wire "Save & Continue" to trigger `saveCurrentStep(currentStep)` asynchronously with visual "Saving..." and "Saved" status.
- [x] **Step 4: Update `Step1Documents.tsx`**
  Add a discrete, elegant action: *"Fill with Sample Court Data"* allowing one-click sample evaluation.
- [x] **Step 5: Run type checks: `npx tsc --noEmit` and commit**

---

### Task 4: Connect Real Authentication UI & PM Demo Profile

**Files:**
- Modify: `app/auth/signin/page.tsx`
- Modify: `app/auth/register/page.tsx`
- Modify: `components/Navbar.tsx`

**Interfaces:**
- Consumes: `/api/auth/register`, `/api/auth/signin`, `/api/auth/demo`, `/api/auth/me`, `/api/auth/signout`

- [x] **Step 1: Overhaul `app/auth/signin/page.tsx`**
  - Remove fake `setTimeout` and hardcoded default values.
  - Implement real submission calling `POST /api/auth/signin` with error alert handling.
  - Add prominent, editorial PM Demo Banner:
    *"Evaluating this project? Click below to launch the pre-seeded court-ready demo with live Neon database records."*
    Button: **"Launch Project Manager Demo Account"** calling `POST /api/auth/demo` and redirecting directly to `/dashboard`.
- [x] **Step 2: Overhaul `app/auth/register/page.tsx`**
  - Connect real registration form to `POST /api/auth/register`.
  - Handle duplicate email validation and age requirement.
- [x] **Step 3: Update `components/Navbar.tsx`**
  - Check current session via `GET /api/auth/me`.
  - If authenticated: Display user name / initials, link to Dashboard, and "Sign Out" button.
  - If unauthenticated: Display "Sign In" and "Start Will".
- [x] **Step 4: Run type checks: `npx tsc --noEmit` and commit**

---

### Task 5: Dynamic Dashboard & Route-Based Document Viewer

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `app/will/[id]/page.tsx`
- Modify: `app/will/[id]/print/page.tsx`

**Interfaces:**
- Consumes: `GET /api/wills`, `DELETE /api/wills/[id]`, `GET /api/wills/[id]`

- [x] **Step 1: Rewire `app/dashboard/page.tsx` to live backend data**
  - Fetch user's actual wills from `GET /api/wills`.
  - Dynamically render `DraftWillCard` with real will ID, date, step number, and progress.
  - If Will is completed (step 15/16), render `GeneratedWillCard` with live link `/will/[id]`.
  - Connect delete action to `DELETE /api/wills/[id]` with real database deletion and state refresh.
  - If user has no wills, display elegant empty state with "Draft Your First Will" action.
- [x] **Step 2: Update `app/will/[id]/page.tsx` to load specific will by route ID**
  - Query `GET /api/wills/[id]` to fetch the exact will, parties, children, and assets from Neon Postgres.
  - Pass loaded database entities into `BilingualWillDocument`.
  - Link print button to `/will/[id]/print`.
- [x] **Step 3: Update `app/will/[id]/print/page.tsx`**
  - Query `GET /api/wills/[id]` so print view works independently via URL directly from Neon DB.
- [x] **Step 4: Run type checks: `npx tsc --noEmit` and commit**

---

### Task 6: End-to-End Live Verification & Smoke Testing

**Files:**
- Test: Full site smoke test in browser subagent (Desktop + Mobile)

- [x] **Step 1: Production build verification**
  Run: `npm run build` to confirm zero errors across all static and dynamic API routes.
- [x] **Step 2: Test PM Demo Login flow via browser subagent**
  - Visit `/auth/signin`.
  - Click "Launch Project Manager Demo Account".
  - Verify redirect to `/dashboard` showing Daniel Michael Carter's active draft and generated will.
  - Click "View Bilingual Will" and verify live ADJD dual-column court document loaded from database.
  - Test print view `/will/[id]/print`.
- [x] **Step 3: Test New User Registration & Clean Will Flow via browser subagent**
  - Sign out.
  - Register a new unique user (e.g. `pm_test_user@example.com`).
  - Verify empty dashboard.
  - Click "Start New Will", advance through steps, verify auto-save updates to Neon DB.
- [x] **Step 4: Capture desktop and mobile verification screenshots and commit**

---

## Plan Status: COMPLETED & VERIFIED
All 6 tasks have been executed, tested against live Neon Serverless Postgres, and verified via end-to-end browser recording. See [`docs/HANDOFF_CHECKPOINT_2026-10-04.md`](../HANDOFF_CHECKPOINT_2026-10-04.md) for full handover notes.

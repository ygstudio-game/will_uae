# Simulate Payment, RBAC & De-duplicated Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable payment simulation across development and production environments, enforce robust Role-Based Access Control (RBAC) across customer and admin surfaces including IDOR prevention, and eliminate duplicate registration conflicts by treating duplicate email entries as the same user.

**Architecture:** 
1. Payment simulation: Provide an un-gated test simulation path in `Step4Payment.tsx` and a dedicated backend route `/api/checkout/simulate` (with fallback webhook bypass in `/api/webhooks/nomod` for `SIM-NOMOD-` identifiers) that works in both dev and production.
2. RBAC: Implement Next.js `middleware.ts` to gate `/admin/*` and `/api/admin/*` behind HMAC-verified admin sessions, and gate `/dashboard/*`, `/wizard/*`, `/will/*`, and `/checkout/court-fee` behind verified customer sessions; harden route handlers (`/api/applications/[id]`, `/api/wills/[id]`, `/api/tickets`) to verify record ownership (`accountId === session.accountId` or Admin role) preventing horizontal privilege escalation.
3. De-duplication: Update `/api/auth/register` to automatically log in existing users instead of throwing 409 conflict, and optimize `/api/checkout/initial` to reuse existing uncompleted applications for returning users.

**Tech Stack:** Next.js 14+ App Router, TypeScript, Prisma ORM, Neon PostgreSQL, Web Crypto HMAC-SHA256.

**Spec:** User prompt: "for currently add simulate payment for both development and production and , make sure all rbac is implemented and no duplicaiton registation is done if duplicate entry is came use the treat it as a same user /using-superpowers"

## Global Constraints
- Preserve statutory bilingual clauses and ADJD template integrity.
- Never crash on duplicate registration; seamlessly issue session cookies and authenticate the user.
- Allow payment testing/simulation in both development and production without breaking live Nomod production webhooks.
- Ensure all admin routes require authenticated administrator credentials; eliminate untrusted query flags like `?admin=true`.
- Zero TypeScript compiler errors (`npx tsc --noEmit` must pass cleanly).

## Review Focus
1. User with existing email registers again at `/api/auth/register`: Expect 200 OK with session cookie and user data, NOT 409 conflict.
2. User clicks "Simulate test payment" in production mode: Expect instant payment confirmation, database payment record marked COMPLETED, and seamless navigation to wizard questionnaire.
3. Unauthenticated user attempts to visit `/admin` or `/api/admin/applications`: Expect redirection to `/admin/login` or 401 Unauthorized.
4. Normal authenticated user attempts to access another user's application via `/api/applications/[id]` or will via `/api/wills/[id]`: Expect 403 Forbidden.
5. User calls `/api/tickets?admin=true` without admin session: Expect tickets limited to user's own account, NOT all platform tickets.

---

### Task 1: De-duplicate Registration (Treat Duplicate Entry as Same User)

**Files:**
- Modify: `app/api/auth/register/route.ts`
- Modify: `app/api/checkout/initial/route.ts`
- Test: Synthetic POST requests to `/api/auth/register` and `/api/checkout/initial`

**Interfaces:**
- Consumes: `prisma.account`, `createSessionToken`, `SESSION_COOKIE_NAME` from `lib/auth`
- Produces: Seamless login for existing accounts on duplicate registration attempt

- [ ] **Step 1: Update `app/api/auth/register/route.ts` to log in existing users instead of returning 409**
  When `existing = await prisma.account.findUnique({ where: { email: normalizedEmail } })` is found:
  - Update `fullName` if a new name is supplied
  - Create session token using `createSessionToken({ id: existing.id, email: existing.email, name: existing.fullName })`
  - Set `SESSION_COOKIE_NAME` in response cookies
  - Return `{ success: true, user: safeUser, isExisting: true }` with status 200

- [ ] **Step 2: Update `app/api/checkout/initial/route.ts` to reuse uncompleted in-progress application**
  When an existing account has an in-progress application where no payments have been completed:
  - Reuse and update that application and its will(s) rather than creating duplicate orphan applications
  - Maintain session and return existing/updated application ID

- [ ] **Step 3: Verify registration de-duplication with curl / fetch**
  Send consecutive register requests with the same email.
  Expected: Both return 200 OK with session cookies, second returns `isExisting: true`.

- [ ] **Step 4: Commit**
  ```bash
  git add app/api/auth/register/route.ts app/api/checkout/initial/route.ts
  git commit -m "fix(auth): treat duplicate registration as same user and reuse in-progress application"
  ```

---

### Task 2: Enable Payment Simulation for Development and Production

**Files:**
- Create: `app/api/checkout/simulate/route.ts`
- Modify: `app/api/webhooks/nomod/route.ts`
- Modify: `components/pre-payment/Step4Payment.tsx`
- Modify: `app/checkout/court-fee/page.tsx`

**Interfaces:**
- Consumes: `prisma.payment`, `prisma.application`, `prisma.auditEvent`, `getCurrentSession`
- Produces: Direct payment simulation endpoint and un-gated UI button for both dev and prod

- [ ] **Step 1: Create dedicated simulation route `app/api/checkout/simulate/route.ts`**
  - Accept `{ applicationId }` in request body
  - Verify session or verify application exists
  - Mark pending `INITIAL_SERVICE_FEE` payment as `COMPLETED` (or create one with `COMPLETED` if none exists)
  - Set application status to `IN_PROGRESS` (or appropriate stage)
  - Record audit event `PAYMENT_SIMULATED`
  - Return `{ success: true, applicationId, paymentStatus: "COMPLETED" }`

- [ ] **Step 2: Update `app/api/webhooks/nomod/route.ts` to allow `SIM-NOMOD-` webhook bypass**
  - If `txId.startsWith("SIM-NOMOD-")` or `body.isSimulation === true`, bypass `verifyNomodSignature` so simulated webhooks succeed even when `NOMOD_WEBHOOK_SECRET` is set in production.

- [ ] **Step 3: Update `components/pre-payment/Step4Payment.tsx` to display simulation button in all environments**
  - Remove `process.env.NODE_ENV !== "production"` wrapper around simulation controls
  - Update `handleSimulatePayment` to call `/api/checkout/simulate` (with fallback to webhook)
  - Style the button cleanly as "⚡ Simulate test payment (Instant Access)" beneath the primary Nomod payment CTA
  - Remove dev-only restrictions on the 1 AED test mode toggle if testing is desired

- [ ] **Step 4: Verify court fee checkout in `app/checkout/court-fee/page.tsx`**
  - Ensure the court fee checkout works seamlessly without environment locks

- [ ] **Step 5: Verify payment simulation in production build mode**
  Test calling `/api/checkout/simulate` and confirm payment transitions to `COMPLETED`.

- [ ] **Step 6: Commit**
  ```bash
  git add app/api/checkout/simulate/route.ts app/api/webhooks/nomod/route.ts components/pre-payment/Step4Payment.tsx
  git commit -m "feat(payment): enable payment simulation in both development and production"
  ```

---

### Task 3: Comprehensive RBAC & Route Protection

**Files:**
- Create: `middleware.ts`
- Modify: `app/api/tickets/route.ts`
- Modify: `app/api/applications/[id]/route.ts`
- Modify: `app/api/wills/[id]/route.ts`
- Modify: `lib/auth.ts` (ensure edge-compatible verification if needed)

**Interfaces:**
- Consumes: `verifyAdminSessionToken`, `verifySessionToken`
- Produces: End-to-end RBAC route protection and IDOR prevention

- [ ] **Step 1: Create Next.js `middleware.ts` for route-level RBAC**
  - Matcher:
    - Admin UI: `/admin/:path*` (excluding `/admin/login`)
    - Admin API: `/api/admin/:path*` (excluding `/api/admin/auth`)
    - Protected User UI: `/dashboard/:path*`, `/wizard/:path*`, `/will/:path*`
  - For admin paths:
    - Check `adjd_admin_session` cookie
    - Verify HMAC signature and `role === "ADMIN"`
    - If invalid on UI path: Redirect to `/admin/login`
    - If invalid on API path: Return 401 `{ success: false, error: "Unauthorized administrator access" }`
  - For protected user paths:
    - Check `will_session` cookie
    - If missing or expired: Redirect to `/auth/signin` (preserving return URL in `?next=`)

- [ ] **Step 2: Harden `/api/tickets/route.ts` against untrusted `?admin=true`**
  - Replace blind `searchParams.get("admin") === "true"` with `const adminSession = await getAdminSession(req); const isAdmin = !!adminSession;`
  - Ensure regular users can ONLY query and see tickets belonging to their own `accountId`.

- [ ] **Step 3: Harden `/api/applications/[id]/route.ts` against IDOR**
  - In GET, PUT, PATCH, DELETE:
    - Check session
    - Ensure `application.accountId === session.accountId` OR verify `adminSession`
    - If unauthorized, return 403 Forbidden `{ success: false, error: "Forbidden: You do not have permission to access this application" }`

- [ ] **Step 4: Harden `/api/wills/[id]/route.ts` against IDOR**
  - Check session
  - Ensure `will.application.accountId === session.accountId` OR verify `adminSession`
  - If unauthorized, return 403 Forbidden

- [ ] **Step 5: Verify RBAC protection**
  - Verify unauthenticated requests to `/admin` redirect to `/admin/login`
  - Verify unauthenticated requests to `/api/admin/applications` return 401
  - Verify user A cannot fetch user B's application via `/api/applications/[id]`
  - Verify `/api/tickets?admin=true` without admin cookie does not leak tickets

- [ ] **Step 6: Commit**
  ```bash
  git add middleware.ts app/api/tickets/route.ts app/api/applications/[id]/route.ts app/api/wills/[id]/route.ts
  git commit -m "feat(security): implement full RBAC middleware and route-level authorization"
  ```

---

### Task 4: End-to-End Build & Functional Verification

**Files:**
- All modified and created files
- Test: Full Next.js production build (`npx next build`)

- [ ] **Step 1: Run TypeScript compiler check**
  Run: `npx tsc --noEmit`
  Expected: 0 errors

- [ ] **Step 2: Run Next.js production build**
  Run: `npx next build`
  Expected: Build succeeds with all routes compiled and optimized

- [ ] **Step 3: Commit and summarize**
  ```bash
  git status
  ```


# Post-Payment UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign and harmonize the post-payment user experience across the dashboard homescreen, court fee portal, support desk, and questionnaire sections by unifying `OWA_PostPayment_User_Test.html` and `owa-platform-prototype.html` into a production-grade editorial interface wired to the existing Next.js App Router store and PostgreSQL database.

**Architecture:** A cohesive component architecture utilizing Tailwind CSS design tokens matching the warm editorial alabaster/obsidian palette of `OWA_PostPayment_User_Test.html`. We embed the advanced vertical progression court fee tracker, two-column support conversation desk, and enriched questionnaire cascade/allocation widgets from `owa-platform-prototype.html`, backed by `useOwaStore` and Next.js Route Handlers.

**Tech Stack:** Next.js 14+ (App Router), TypeScript (strict mode), Tailwind CSS, Lucide React icons, Zustand (`useOwaStore`), Prisma / Neon Serverless PostgreSQL.

**Spec:** [`docs/superpowers/specs/2026-10-21-post-payment-ui-ux-redesign-design.md`](file:///d:/COding/InternShip%20Work/E-STUDYPAL/LAUNCHPIT/Will/docs/superpowers/specs/2026-10-21-post-payment-ui-ux-redesign-design.md)

## Global Constraints
- Canvas color must strictly be `#FAF9F6` with paper surfaces `#FFFEFA` and borders `#E4DFEE` / `#E5E0D8`.
- Deep Obsidian Navy (`#0B1528`) / Plum (`#29213F`), Regal Purple (`#6243AD`), and Court Bronze (`#A37E44`) are the authoritative brand accents.
- Typography: Headings must use Serif (`Playfair Display` / Georgia), controls and body must use Sans (`Inter`), and Arabic text must use Classical Script (`Amiri` / `Noto Naskh Arabic`).
- Support system must be ported from `owa-platform-prototype.html` (`V.support`, `threadView`, chips, modals).
- Court fee portal must be ported from `owa-platform-prototype.html` (`V.courtfee`, 5-step vertical progression rail, UAE Pass instructions, direct ADJD portal link).
- Questionnaire sections must incorporate rich prototype microcopy, cascade diagrams, allocation bars, and Arabic name approval.
- All state must remain synchronized with `useOwaStore` and database API endpoints (`/api/applications/[id]`, `/api/tickets`, `/api/checkout/court-fee`).

## Review Focus
1. **Couples Package Toggle**: When `packageType === "COUPLES"`, switching between Will 1 and Will 2 on the dashboard and wizard must instantly switch active testator data and recalculate section completion.
2. **Allocation Bar Math (Section E)**: Beneficiary shares must enforce exactly 100.00% total for primary and substitute groups; allocation bar width and status colors must update reactively.
3. **Court Fee Milestone 2 Gate**: Court fee state transitions smoothly when paid, unlocking notarisation booking instructions and reflecting paid status on the dashboard without reloading.
4. **Ticket Thread Message Order & Roles**: Support tickets must strictly distinguish between customer messages (lavender bubble, right-aligned) and OWA legal staff (obsidian bubble, left-aligned) with attachment links.
5. **Mobile Responsiveness (<768px)**: Dashboard two-column layout, support two-column split, and questionnaire cascade diagrams must collapse cleanly without horizontal overflow.

---

### Task 1: Design System & Token Alignment
**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: Tailwind color tokens (`alabaster`, `paper`, `obsidian`, `court-purple`, `court-bronze`, `court-gold`, `lavender-soft`), font classes (`font-serif`, `font-sans`, `font-arabic`), and custom scrollbar/selection styling.

- [ ] **Step 1: Verify and expand `tailwind.config.ts` color tokens**
  Add `paper: "#FFFEFA"`, `purple: { DEFAULT: "#6243AD", dark: "#443074", light: "#7B5EC6" }`, `lavender: { soft: "#F0EBF9", subtle: "#F7F4FC" }`, `gold: { DEFAULT: "#D7B48B", text: "#8A6233" }`.
- [ ] **Step 2: Add utility classes and component rules in `app/globals.css`**
  Add `.hero-ornament` radial styling, `.allocation-bar` CSS transitions, and `.vstep-rail` timeline styling matching `OWA_PostPayment_User_Test.html` and `owa-platform-prototype.html`.
- [ ] **Step 3: Run build/typecheck to verify CSS & Tailwind compiles cleanly**
  Run: `npm run build` or Next.js typecheck to ensure zero syntax errors.
- [ ] **Step 4: Commit changes**
  `git add tailwind.config.ts app/globals.css`  
  `git commit -m "feat(design): configure unified editorial tokens and styling"`

---

### Task 2: Redesign Post-Payment Dashboard Homescreen
**Files:**
- Modify: `app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `useOwaStore` (`application`, `activeWillIndex`, `loadApplicationFromDb`), `/api/applications/[id]`.
- Produces: Redesigned dashboard homescreen matching `OWA_PostPayment_User_Test.html`.

- [ ] **Step 1: Build Header & Breadcrumb Bar**
  Implement topbar with OWA brand mark, breadcrumb navigation (`My application / Overview`), Couples Will switcher dropdown/tabs, and user profile avatar with initials.
- [ ] **Step 2: Build Hero Status Card with Radial Ornament**
  Implement `.hero` container with soft lavender background, radial ornamental circle, package badge (`Single` or `Couples`), status heading, "Continue your questionnaire →" button, and section progress bar (`X of 6 sections complete`).
- [ ] **Step 3: Build 6-Section Preparation Checklist Card**
  Implement task lines for Sections A through F with step numbers, titles, microcopy subtitles, and deep-link buttons.
- [ ] **Step 4: Build Draft Access Card & Sidebar Lifecycle Stack**
  Implement "Latest draft ready to view" card, "What happens next" 4-stage lifecycle timeline, "Your payments" card (OWA fee Paid + Court fee guidance link), and Support callout box.
- [ ] **Step 5: Wire state & actions to `useOwaStore`**
  Ensure "Continue questionnaire" navigates to the first incomplete section (`details`, `children`, `executors`, `guardians`, `beneficiaries`, `review`), and Couples switcher switches `activeWillIndex`.
- [ ] **Step 6: Commit changes**
  `git add app/dashboard/page.tsx`  
  `git commit -m "feat(dashboard): redesign post-payment homescreen to match OWA editorial spec"`

---

### Task 3: Redesign Court Fee & Notarisation Portal
**Files:**
- Modify: `app/checkout/court-fee/page.tsx`

**Interfaces:**
- Consumes: `applicationId` query param, `/api/applications/[id]`, `/api/checkout/court-fee`.
- Produces: 5-step vertical progression rail (`.vstep`) and interactive Milestone 2 settlement.

- [ ] **Step 1: Build Header & Milestone 2 Badge**
  Implement breadcrumb ("Back to your Wills"), application reference (`OWA-XXXX`), and title "Court Fee and Notarisation".
- [ ] **Step 2: Build 5-Step Vertical Progression Timeline Rail**
  Implement `.vstep` layout:
  1. *ADJD approved your application* (Completed / In review).
  2. *Pay AED 950 on ADJD's portal* (Active card with UAE Pass 3-step guide, external link to official ADJD portal, and "I have paid: tell Online Wills Advisor" / Test payment simulator button).
  3. *We book your video notarisation* (Appointment scheduler status).
  4. *Attend the video call* (UAE visit/residence visa requirements, no witnesses note).
  5. *ADJD registers your Will* (Stamped PDF and barcoded registration).
- [ ] **Step 3: Build "Who you pay" & Support Escalation Side Cards**
  Display OWA preparation fee (Paid) vs. ADJD court fee (AED 950/1900 Due/Paid), plus quick link to support.
- [ ] **Step 4: Wire payment simulation to `/api/checkout/court-fee`**
  Ensure clicking the payment action updates application status to `AWAITING_ADMIN_VERIFICATION` and redirects back to dashboard with celebration banner.
- [ ] **Step 5: Commit changes**
  `git add app/checkout/court-fee/page.tsx`  
  `git commit -m "feat(court-fee): port 5-step vertical progression court portal from prototype"`

---

### Task 4: Redesign Support Desk & Ticket System
**Files:**
- Modify: `app/dashboard/support/page.tsx`
- Modify: `components/tickets/TicketThreadView.tsx`

**Interfaces:**
- Consumes: `/api/tickets`, `useOwaStore`.
- Produces: Split-view conversation desk matching `owa-platform-prototype.html` (`V.support`, `threadView`).

- [ ] **Step 1: Implement Two-Column Conversation Layout (`.split-l`)**
  Create conversation sidebar (`.tlist`) on the left and active thread viewer (`.thread`) on the right.
- [ ] **Step 2: Implement Conversation Cards with Status Chips**
  Render tickets with status chips (`With our team`, `Waiting for you`, `Resolved`), timestamps, subject line, and latest message snippet.
- [ ] **Step 3: Implement Styled Message Thread & Bubbles**
  Distinguish client messages (`.me` lavender bubbles, right-aligned) and OWA legal staff (`.owa` obsidian bubbles, left-aligned) with attachment badges.
- [ ] **Step 4: Implement Reply Form & "New Message" Modal**
  Add textarea reply box with file upload trigger, and "+ New message" modal with subject, target Will dropdown (for Couples), and body.
- [ ] **Step 5: Commit changes**
  `git add app/dashboard/support/page.tsx components/tickets/TicketThreadView.tsx`  
  `git commit -m "feat(support): redesign support desk to match prototype conversation split view"`

---

### Task 5: Upgrade Questionnaire Wizard Navigation & Section A (Your Details)
**Files:**
- Modify: `components/owa-wizard/OwaNavigation.tsx`
- Modify: `components/owa-wizard/SectionA_Details.tsx`

**Interfaces:**
- Consumes: `useOwaStore`, `UploadedDocumentData`.
- Produces: Prototype-style wizard navigation bar and enriched Section A document tiles & microcopy.

- [ ] **Step 1: Rebuild `OwaNavigation.tsx`**
  Implement top bar with Will index indicator, package badge (`Individual` or `Mirror Wills`), auto-save indicator ("Saved as you type"), and 6 step pill buttons with checkmark completion indicators.
- [ ] **Step 2: Upgrade Section A Document Tiles (`fileTile`)**
  Implement 3 distinct cards for Passport, Emirates ID, and Proof of Address with status chips (`Read: name, dob, passport number` / `Needed` / `Required`), file replacement trigger, and OCR feedback.
- [ ] **Step 3: Enrich Section A Personal Details & Address Fields**
  Add field hints from prototype: UAE home address explanation (where you live now, property owned does not count), country of domicile explanation (recorded in Section Ten), and Arabic name phonetic guidance.
- [ ] **Step 4: Commit changes**
  `git add components/owa-wizard/OwaNavigation.tsx components/owa-wizard/SectionA_Details.tsx`  
  `git commit -m "feat(wizard): upgrade navigation bar and Section A document tiles & microcopy"`

---

### Task 6: Upgrade Questionnaire Sections B (Children) & C (Executors)
**Files:**
- Modify: `components/owa-wizard/SectionB_Children.tsx`
- Modify: `components/owa-wizard/SectionC_Executors.tsx`

**Interfaces:**
- Consumes: `useOwaStore` (`children`, `executors`).
- Produces: Expandable child cards with live age calculation and 3-tier executor structure with **Cascade Rail Diagram**.

- [ ] **Step 1: Upgrade Section B (Children)**
  Implement Yes/No segmented toggle, expandable child cards (up to 5), relationship selector (Son/Daughter), UAE residency toggle (with Emirates ID upload trigger), and real-time age badges (`Age X: included in guardianship` vs. `adult`).
- [ ] **Step 2: Upgrade Section C (Executors)**
  Implement 3 distinct slots: First Executor (a), Substitute Executor (b), Further Appointment (c), with role descriptions from the prototype.
- [ ] **Step 3: Implement Visual Cascade Rail Diagram in Section C**
  Render the `.cascade` vertical diagram illustrating when each executor steps in (Executor → if unable/unwilling → Substitute → if both die → Further appointment).
- [ ] **Step 4: Commit changes**
  `git add components/owa-wizard/SectionB_Children.tsx components/owa-wizard/SectionC_Executors.tsx`  
  `git commit -m "feat(wizard): upgrade Section B children and Section C executors with cascade diagram"`

---

### Task 7: Upgrade Questionnaire Sections D (Guardians) & E (Beneficiaries)
**Files:**
- Modify: `components/owa-wizard/SectionD_Guardians.tsx`
- Modify: `components/owa-wizard/SectionE_Beneficiaries.tsx`

**Interfaces:**
- Consumes: `useOwaStore` (`guardians`, `beneficiaries`).
- Produces: Guardian **Timeline Figure** and Beneficiary **Allocation Bar (`.alloc`)** with **Estate Flow Grid**.

- [ ] **Step 1: Upgrade Section D (Guardians)**
  Add the 3-stage visual Timeline Figure (*At death* → *Interim period* → *Long term*) and 4 slots: Permanent guardian (Required), Backup permanent (Recommended), Interim guardian (UAE resident, Recommended), Backup interim (Optional).
- [ ] **Step 2: Upgrade Section E (Beneficiaries)**
  Implement 1 to 4 primary beneficiaries, "Give spouse 100%" quick shortcut, and the interactive **Allocation Bar (`.alloc`)** visually rendering percentage blocks in real time.
- [ ] **Step 3: Implement Substitute Group & Estate Flow Grid in Section E**
  Implement Substitute A (with A's children fallback clause explanation) and Substitute B, plus the visual **Estate Flow Grid** and legal trust rules callout.
- [ ] **Step 4: Commit changes**
  `git add components/owa-wizard/SectionD_Guardians.tsx components/owa-wizard/SectionE_Beneficiaries.tsx`  
  `git commit -m "feat(wizard): upgrade Section D guardians timeline and Section E allocation visualizer"`

---

### Task 8: Upgrade Section F (Review & Approve) & End-to-End Validation
**Files:**
- Modify: `components/owa-wizard/SectionF_ReviewDraft.tsx`
- Modify: `app/wizard/[step]/page.tsx`

**Interfaces:**
- Consumes: All 6 wizard section states.
- Produces: Readiness matrix, Arabic name verification cards with "Approve all" action, signature photo upload/extraction block, Section One bilingual preview, and legal declaration.

- [ ] **Step 1: Upgrade Section F Readiness Matrix & Arabic Verification**
  Implement 6-item checklist with status icons, and individual Arabic name cards with phonetic preview, edit toggle, and "Approve all names that have an Arabic spelling" action.
- [ ] **Step 2: Implement Signature Capture & Section One Bilingual Snippet**
  Add signature photo upload with dark ink preview, live two-column English/Arabic Section One preview card, and final confirmation checkbox.
- [ ] **Step 3: Verify End-to-End Flow & Route Wiring**
  Navigate through Dashboard (`/dashboard`) → Sections A-F (`/wizard/[step]`) → Court Fee (`/checkout/court-fee`) → Support (`/dashboard/support`). Ensure all links and data mutations operate cleanly.
- [ ] **Step 4: Commit changes**
  `git add components/owa-wizard/SectionF_ReviewDraft.tsx app/wizard/[step]/page.tsx`  
  `git commit -m "feat(wizard): upgrade Section F review matrix and complete end-to-end flow validation"`

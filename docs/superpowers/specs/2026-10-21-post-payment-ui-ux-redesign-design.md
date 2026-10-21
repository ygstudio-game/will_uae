# Post-Payment UI/UX Redesign & Prototype Convergence Specification

**Date:** 2026-10-21  
**Project:** UAE Will Preparation Platform (ADJD Non-Muslim Will)  
**Primary Goal:** Redesign and harmonize the post-payment user experience by unifying the visual identity of `OWA_PostPayment_User_Test.html` with the advanced support desk, court fee progression, and rich questionnaire microcopy/widgets of `owa-platform-prototype.html`, fully wired to the existing Next.js App Router store and Prisma backend.

---

## 1. Background & Design Directives

### 1.1 Foundation Documents
1. **`OWA_PostPayment_User_Test.html`**:
   - Master design authority for the post-payment dashboard ("My application / Your Will, one step at a time"), layout structure, palette, card styling, and typography.
   - Used for the entire customer workspace EXCEPT the support ticketing system.
2. **`owa-platform-prototype.html`**:
   - Master authority for the **Support Desk System** (`V.support`, `threadView`, conversation list, ticket status chips, message bubbles, file attachments).
   - Master authority for the **Court Fee & Notarisation Portal** (`V.courtfee`, 5-step vertical milestone rail, UAE Pass instructions, direct ADJD e-services external link, payment confirmation trigger).
   - Master authority for **Questionnaire Rich Microcopy & Visual Widgets**:
     - Section A: Document upload tiles (`fileTile`) with extracted tags, home address vs. property guidance, domicile explanations.
     - Section B: Expandable child cards, UAE residence selector, minor/adult live age badges.
     - Section C: 3-tier executor structure with the **Cascade Rail Diagram**.
     - Section D: 4-role guardian structure with the **Timeline Figure** (*At death* → *Interim period* → *Long term*).
     - Section E: Primary beneficiary allocation bar (`.alloc`), "Give spouse 100%" action, substitute group with A's children fallback, and **Estate Flow Grid**.
     - Section F: 6-item readiness check, Arabic name verification matrix with "Approve all" action, signature photo upload/extraction block, and Section One bilingual preview.

### 1.2 Non-Negotiables
- **Editorial Legal Aesthetic**: Warm alabaster canvas (`#FAF9F6`), crisp ivory paper cards (`#FFFEFA`), deep obsidian/plum (`#0B1528` / `#29213F`), regal purple (`#6243AD`), court bronze (`#A37E44`), and soft lavender tint surfaces (`#F0EBF9` / `#F7F4FC`).
- **Typography Standards**: Serif headings (`Playfair Display` / Georgia) balanced with clean, high-legibility sans-serif (`Inter`) and classical Arabic script (`Amiri` / `Noto Naskh Arabic`).
- **State & Data Continuity**: All UI interactions must remain bound to `useOwaStore` (or `useWillStore`), persisting seamlessly to Neon PostgreSQL via `/api/applications/[id]`, `/api/tickets`, and `/api/checkout/court-fee`.
- **Responsive Across Mobile & Desktop**: Desktop multi-column grid collapsing gracefully to single-column card stack on mobile viewports (<768px).

---

## 2. Surface Architecture & Specifications

### 2.1 Surface 1: Post-Payment Dashboard (`app/dashboard/page.tsx`)
The primary post-payment homescreen where customers land after settling their initial OWA service fee.

- **Header & Navigation**:
  - Brand header: "OWA · Online Wills Advisor" with breadcrumbs (`My application / Overview`).
  - Account pill & avatar with user initials.
  - Active Will selector for Couples packages ("Will 1 of 2: [Name]" / "Will 2 of 2: [Name]").
  - Auto-save indicator: "Saved on this browser" / "Synced to Abu Dhabi Civil Registry".
- **Hero Status Banner (`.hero`)**:
  - Background: Soft lavender/purple tint with elegant radial ornamental ring.
  - Package badge: `Single package` or `Couples package` + `OWA fee paid` pill with checkmark.
  - Heading: "Make your wishes clear." (or current status label).
  - Subtitle: "Add the people who matter, choose their roles, and review your draft. You can save and return whenever you need."
  - Primary CTA: "Continue your questionnaire →" deep-linking directly to the first incomplete wizard section.
  - Progress tracker: "X of 6 sections complete" with sleek purple progress bar (`.progress > span`).
- **Preparation Checklist Card (`.card`)**:
  - Header: "Your preparation checklist" + status pill.
  - 6 interactive task lines corresponding to Sections A through F:
    1. *Your details*: Identity, documents and residential address.
    2. *Children*: Up to five children under 18.
    3. *Executors*: The people who will carry out your wishes.
    4. *Guardians*: Permanent, substitute and optional temporary.
    5. *Beneficiaries*: Primary shares and shared substitutes.
    6. *Review & draft*: Check your details and view your draft.
  - Each line shows a numbered circle (or green checkmark when complete) and an "Open →" link.
- **Draft Access Card**:
  - Shows draft version badge (`v1`, `v2`, etc.).
  - Title: "Your draft is ready to view" with subtitle and "View draft →" button opening the court document preview.
- **Sidebar Aside Stack**:
  - **"What happens next" Lifecycle Card**:
    1. *Complete your questionnaire*: Your people, documents and wishes.
    2. *OWA checks your application*: Manual review of all details and documents.
    3. *Pay ADJD directly*: AED 950 per Will, when instructed.
    4. *Court registration completed*: Court or admin delivers the registered Will.
  - **"Your payments" Card**:
    - OWA preparation fee: `AED 999` (Single) / `AED 1,799` (Couples) — `Paid` pill.
    - Court fee note: "AED 950 for one Will / AED 1,900 for two Wills, payable directly to ADJD. This amount is not collected by OWA."
    - Link: "View court payment guidance →" navigating to `/checkout/court-fee`.
  - **Support Callout Card**:
    - "A little help along the way — Questions or missing documents? Your OWA team can help."
    - Link: "Raise a support ticket →" navigating to `/dashboard/support`.

---

### 2.2 Surface 2: Court Fee & Notarisation Portal (`app/checkout/court-fee/page.tsx`)
Replaces simple checkout with the interactive 5-step court timeline from `owa-platform-prototype.html`.

- **5-Step Vertical Progression Rail (`.vstep`, `.rail`, `.dot`, `.line`)**:
  - **Step 1: ADJD approved your application** (Completed when status is `DRAFT_READY` or `COURT_FEE_PENDING`).
  - **Step 2: Pay AED 950 on ADJD's portal**:
    - Active card when fee is due:
      - Instructions:
        1. Sign in to ADJD's e-services with UAE Pass.
        2. Open your Will application (showing application reference `OWA-XXXX`).
        3. Pay the AED 950 court fee with your card.
      - Action: Direct external button "Open ADJD e-services ↗" (linking to `https://www.adjd.gov.ae`).
      - Confirmation toggle: "I have paid: tell Online Wills Advisor" / Test payment simulator button for prototype testing.
  - **Step 3: We book your video notarisation**:
    - Subtitle: "We take the first appointment ADJD offers and send you the date and link."
    - Displays booked appointment timestamp if scheduled.
  - **Step 4: Attend the video call**:
    - Subtitle: "An ADJD notary checks your identity and reads your Will back to you. You need to be in the UAE, on a residence or visit visa. ADJD does not need witnesses."
  - **Step 5: ADJD registers your Will**:
    - Subtitle: "ADJD issues your registered Will as a PDF with its stamp and a barcoded reference. A copy appears in your account."
- **Sidebar Breakdown Card ("Who you pay")**:
  - OWA service fee: Paid (green status).
  - ADJD Court fee: AED 950 (per Will) — status chip (`Not due yet` / `Due now` / `Paid to ADJD`).
  - Escalation box: "Trouble paying on ADJD's portal? Message support".

---

### 2.3 Surface 3: Support Desk & Ticket System (`app/dashboard/support/page.tsx` & `components/tickets/`)
Replaces basic ticket list with the full two-column conversation desk from `owa-platform-prototype.html`.

- **Layout Structure (`.split-l`)**:
  - **Left Column: Conversation List (`.tlist`)**:
    - Card for each conversation showing:
      - Status chip: `With our team` (purple), `Waiting for you` (amber), `Resolved` (green).
      - Last updated date/time.
      - Ticket subject.
      - Preview snippet of the latest message.
    - Active indicator: bold border around selected card.
    - Header CTA: "+ New message" button opening modal.
  - **Right Column: Thread View (`.thread`)**:
    - Header: Subject, ticket reference ID (`#1001`), context subtitle (e.g. `Will 1 · Section B: Children`).
    - Message list:
      - Client messages (`.me`): aligned right with soft lavender background (`#F0EBF9`), user name, and timestamp.
      - Staff messages (`.owa`): aligned left with obsidian/plum background (`#0B1528` / `#382852`), white text, "OWA Legal Team", and timestamp.
      - File attachment links if present.
    - Reply form:
      - Multi-line textarea for response.
      - "Attach a file" button.
      - "Send reply →" button.
- **"New Message" Modal**:
  - Subject input field.
  - Target Will selector (if Couples package).
  - Message body textarea.
  - Action buttons: "Cancel" and "Send message".
  - Full API integration with existing `/api/tickets` endpoint.

---

### 2.4 Surface 4: Unified Questionnaire Navigation (`components/owa-wizard/OwaNavigation.tsx`)
Replaces disjointed steppers with the prototype wizard bar:
- Top bar showing package type ("Individual Will" / "Mirror Wills"), active Will indicator, and auto-save pill.
- Stepper pills for the 6 sections:
  1. `A. Your details`
  2. `B. Children`
  3. `C. Executors`
  4. `D. Guardians`
  5. `E. Beneficiaries`
  6. `F. Review & approve`
- Visual status: Completed steps have checkmarks; current step is highlighted in obsidian with gold number; upcoming steps have dashed/subtle borders.

---

### 2.5 Surface 5: Questionnaire Sections A through F (`components/owa-wizard/`)

#### Section A (Your Details)
- **Document Upload Tiles**: 3 distinct cards for Passport, Emirates ID, and Proof of Address with descriptive labels, required/optional pills, and file status badges ("Read: name, dob, passport number").
- **Personal Details**: Full name, Arabic phonetic transliteration hint, date of birth with age verification (>= 21), nationality, passport number, Emirates ID.
- **Address & Domicile**: Helper note explaining home address vs. property ownership, country of domicile recorded in Section Ten.

#### Section B (Children)
- Yes/No toggle for children under 18.
- Expandable cards for each child (up to 5) with relationship selector (Son/Daughter), UAE residence selector, passport/EID uploads, and real-time age calculation.
- Helpful callout: "One set of guardians for all children under 18".

#### Section C (Executors)
- 3 clear slots: First Executor (a), Substitute Executor (b), Further Appointment (c).
- **Cascade Rail Diagram**: Visual vertical flow demonstrating the sequence of succession (Executor → if unable/unwilling → Substitute → if both die → Further appointment).
- Shared person selector modal for choosing existing profiles or creating new ones.

#### Section D (Guardians)
- Skip banner if no children under 18 are listed.
- **Timeline Figure**: Visual breakdown across 3 stages:
  - *At death*: Children need immediate care.
  - *Interim period*: Interim guardian (UAE resident).
  - *Long term*: Permanent guardian raises children.
- 4 slots: Permanent guardian (Required), Backup permanent guardian (Recommended), Interim guardian (UAE resident, Recommended), Backup interim guardian (Optional).

#### Section E (Beneficiaries)
- Primary Beneficiaries (1 to 4, total 100%):
  - Quick action: "Give spouse 100%" shortcut.
  - **Allocation Bar (`.alloc`)**: Live visual proportion bar with percentage indicators.
- Substitute Beneficiaries:
  - Substitute A (Required, with A's children fallback clause clearly explained).
  - Substitute B (Optional).
- **Estate Flow Grid**: Visual diagram illustrating how the estate passes (Primaries → survivor pro-rata → Substitute group).
- Legal rules card explaining under-21 trust provisions.

#### Section F (Review and Approve)
- **Readiness Matrix**: 6-item check verifying every section is complete.
- **Arabic Name Verification**: Cards for every person in the Will showing English name, phonetic Arabic script, and "Approve" button, plus an "Approve all names" bulk action.
- **Signature Capture**: High-contrast signature photo upload and extraction preview.
- **Bilingual Section One Preview**: Live two-column English/Arabic court document snippet.
- **Legal Confirmation & Attestation**: Checkbox declaration and "Send for legal review" CTA.

---

## 3. Data Flow & Database Integration

1. **State Store (`useOwaStore`)**:
   - `application`: Holds current package, wills array, payments, and account data.
   - `activeWillIndex`: 0 or 1 for Couples package.
   - `saveCurrentSectionToDb()`: Debounced auto-save persisting form state to Neon PostgreSQL.
   - `loadApplicationFromDb(id)`: Hydrates state from `/api/applications/[id]`.
2. **API Routes**:
   - `GET/POST /api/applications/[id]`: Application fetch and partial section update.
   - `GET/POST /api/tickets`: Ticket thread retrieval and message dispatch.
   - `POST /api/checkout/court-fee`: Settlement of Milestone 2 court registration fee.

---

## 4. Verification & Testing Criteria

1. **Visual Regression & Polish**:
   - All surfaces adhere to `#FAF9F6` canvas, `#FFFEFA` card surfaces, and `#0B1528` obsidian elements.
   - Typography uses Playfair/Georgia for headings and Inter for body text.
   - No broken borders, missing margins, or overlapping text on mobile viewports (<768px).
2. **Flow & Navigation**:
   - Customers can navigate seamlessly between Dashboard → Questionnaire Sections A-F → Court Fee → Support Desk.
   - Couples toggle allows switching between Will 1 and Will 2 on any surface.
3. **Data Integrity**:
   - Form inputs persist across browser reloads.
   - Allocation bar enforces exactly 100% total for primary and substitute groups.
   - Tickets create and append messages cleanly without duplicate renders.

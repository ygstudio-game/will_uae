# OWA Beneficiary Allocation & Court Template Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the owner's confirmed beneficiary rules (1–3 primaries totaling 100% with proportional redistribution + shared substitute group A/B totaling 100% with A's children fallback) across data models, wizard UI, review audits, and bilingual court templates.

**Architecture:** 
1. Expand role definitions in Prisma, TypeScript types, and Zustand stores.
2. Build a 3-part guided allocation component (`1. Primaries` ➔ `2. Substitutes` ➔ `3. Review`) in Section E & Step 9 matching the official prototype.
3. Synchronize Section Seven in `ADJDBilingualWillDocument.tsx` and `BilingualWillDocument.tsx` with official English/Arabic legal clauses matching `Will Form (3).pdf`.
4. Update review screens (Step 15, Section F) and admin application role tables.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Prisma ORM, Zustand, Tailwind CSS.

**Spec:** [`docs/superpowers/specs/2026-10-09-owa-beneficiary-allocation-and-template-sync-design.md`](../specs/2026-10-09-owa-beneficiary-allocation-and-template-sync-design.md)

## Global Constraints
- Primary appointments: 1 to 3 maximum; positive percentage shares strictly summing to 100.00%.
- Proportional redistribution: Surviving primaries inherit deceased primary's share pro rata; sole survivor takes 100%.
- Shared substitute group: Activates only if all primaries fail; Substitute A required (100% if alone); Substitute B optional; A + B strictly sum to 100.00%.
- Fallback clause: A's share passes to surviving children equally; B does NOT have a children fallback.
- Safeguards: Testator cannot be beneficiary; no duplicate people within a group; primary cannot be chosen as substitute.
- Bilingual accuracy: Side-by-side LTR English / RTL Arabic matching ADJD court standards.

## Review Focus
1. Adding/removing primaries without silent auto-rebalancing of existing percentages.
2. Reverting Substitute A to 100% automatically if B is removed.
3. Primary allocation total (100%) and Substitute allocation total (100%) kept completely separate (never 200%).
4. Preventing selection of any primary beneficiary as an A or B substitute.
5. Absolute removal of the children fallback clause from Substitute B in both English and Arabic court templates.

---

### Task 1: Schema, Types, and Store Validation Synchronization

**Files:**
- Modify: `prisma/schema.prisma:38-48`
- Modify: `types/owa.ts:17-27`
- Modify: `store/useOwaStore.ts:300-312`
- Modify: `store/useWillStore.ts:430-440`

**Interfaces:**
- `RoleType`: Add `BENEFICIARY_PRIMARY` and `BENEFICIARY_SUBSTITUTE`
- `useOwaStore.isSectionComplete("beneficiaries")`: returns `true` only when primaries total 100% and substitute group totals 100% without duplicates/cross-group violations.
- `useWillStore.isStepValid(9)`: returns `true` under the same validated conditions.

- [ ] **Step 1: Update Prisma schema and generate client**
  Add `BENEFICIARY_PRIMARY` and `BENEFICIARY_SUBSTITUTE` to `RoleType` enum in `prisma/schema.prisma`.
  Run: `npx prisma generate`
  Expected: Generated Prisma Client with new enum members.

- [ ] **Step 2: Update TypeScript types in `types/owa.ts`**
  Add `BENEFICIARY_PRIMARY` and `BENEFICIARY_SUBSTITUTE` to `RoleType` union in `types/owa.ts`.

- [ ] **Step 3: Update `useOwaStore.ts` validation**
  Update `isSectionComplete("beneficiaries")` in `store/useOwaStore.ts`:
  - Extract primaries (`role === "BENEFICIARY_PRIMARY"` or legacy `role === "BENEFICIARY"`).
  - Extract substitutes (`role === "BENEFICIARY_SUBSTITUTE"`).
  - Verify primary count >= 1 and <= 3, sum === 100.
  - Verify substitute count >= 1 (A present) and <= 2, sum === 100.
  - Verify unique person IDs within primaries and within substitutes.
  - Verify no primary person ID exists in substitutes.

- [ ] **Step 4: Update `useWillStore.ts` validation**
  Update `isStepValid(9)` in `store/useWillStore.ts` with identical group count, 100% total, and non-overlap checks.

- [ ] **Step 5: Verify types**
  Run: `npm run build`
  Expected: 0 type errors.

- [ ] **Step 6: Commit**
  ```bash
  git add prisma/schema.prisma types/owa.ts store/useOwaStore.ts store/useWillStore.ts
  git commit -m "feat(beneficiaries): update role types, prisma schema, and dual-group store validation"
  ```

---

### Task 2: Wizard Beneficiary Sub-Stepped UI (Section E & Step 9)

**Files:**
- Modify: `components/owa-wizard/SectionE_Beneficiaries.tsx`
- Modify: `components/wizard/steps/Step9Beneficiaries.tsx`

**Interfaces:**
- Internal sub-views: `0` (Primaries), `1` (Substitutes), `2` (Review Beneficiaries).
- Live calculation badges: `Primary allocation: X% of 100%`, `Substitute allocation: X% of 100%`.
- Safeguards preventing testator selection, within-group duplicates, and primary reuse as substitute.

- [ ] **Step 1: Refactor `SectionE_Beneficiaries.tsx`**
  Implement 3-state sub-flow (`0: Primaries`, `1: Substitutes`, `2: Review`):
  - Primary view: Up to 3 cards with percentage share inputs. Explanatory proportional redistribution note. Live allocation status bar.
  - Substitute view: Substitute A (100% default) + optional Substitute B. Explanatory A children fallback notice. Live allocation status bar.
  - Review view: Side-by-side / stacked summary tables showing distinct primary (100%) and substitute (100%) totals with conditional explanations.
  - Add safeguards: Prevent selecting testator person; prevent duplicate selections; prevent picking any primary as substitute.
  - Buttons: "Continue to substitute beneficiaries", "Review beneficiaries", "Back", "Save and continue".

- [ ] **Step 2: Refactor `Step9Beneficiaries.tsx`**
  Implement the exact same 3-state guided sub-flow for the legacy 16-step wizard using `useWillStore` state.

- [ ] **Step 3: Verification**
  Run: `npm run build`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add components/owa-wizard/SectionE_Beneficiaries.tsx components/wizard/steps/Step9Beneficiaries.tsx
  git commit -m "feat(beneficiaries): implement 3-part guided allocation UI matching v4 prototype"
  ```

---

### Task 3: Bilingual Court Document Section Seven Synchronization

**Files:**
- Modify: `components/court/ADJDBilingualWillDocument.tsx:300-380`
- Modify: `components/court/BilingualWillDocument.tsx:174-215`

**Interfaces:**
- Section Seven dual-column layout:
  - Part 1: Gift of residue to 1–3 named primaries with percentage shares.
  - Proportional primary redistribution clause (English & Arabic).
  - Part 2: Shared substitute condition (English & Arabic).
  - Block A: Substitute A share + children fallback (English & Arabic).
  - Block B: Substitute B share (rendered only if selected) without children fallback.
  - Clauses c & d: Minor trust age 21.
  - Clause e: Pro-rata undisposed remainder.

- [ ] **Step 1: Update `ADJDBilingualWillDocument.tsx`**
  Update Section SEVEN on Page 4 and Page 5:
  - Filter `BENEFICIARY_PRIMARY` and `BENEFICIARY_SUBSTITUTE` role assignments.
  - Render 1 to 3 primary cards with percentage, full details, and proportional redistribution text.
  - Render substitute group trigger ("If none of my above-named primary beneficiaries survives me...").
  - Render Substitute A with children fallback clause.
  - Render Substitute B (if selected) without children fallback clause.
  - Retain minor trust age 21 (clauses c & d) and clause e.

- [ ] **Step 2: Update `BilingualWillDocument.tsx`**
  Apply the exact same dual-column structure, proportional redistribution text, and A/B substitute clauses.

- [ ] **Step 3: Verification**
  Run: `npm run build`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add components/court/ADJDBilingualWillDocument.tsx components/court/BilingualWillDocument.tsx
  git commit -m "feat(court-document): synchronize Section Seven bilingual clauses with v4 distribution rules"
  ```

---

### Task 4: Review Screens & Admin Detail Page Synchronization

**Files:**
- Modify: `components/wizard/steps/Step15Review.tsx`
- Modify: `components/owa-wizard/SectionF_ReviewDraft.tsx`
- Modify: `app/admin/applications/[id]/page.tsx`

**Interfaces:**
- Display separate Primary and Substitute audit summaries.
- Admin role appointments table displaying `BENEFICIARY_PRIMARY #1..3` and `BENEFICIARY_SUBSTITUTE (A/B)`.

- [ ] **Step 1: Update `SectionF_ReviewDraft.tsx`**
  Update compliance audit cards:
  - Audit primary beneficiaries (must exist and sum to 100%).
  - Audit substitute beneficiaries (A must exist and sum to 100%).

- [ ] **Step 2: Update `Step15Review.tsx`**
  Update Section SEVEN checklist item and party review cards to distinguish Primary and Substitute roles.

- [ ] **Step 3: Update `app/admin/applications/[id]/page.tsx`**
  Ensure role labels render cleanly as `Primary Beneficiary #X` and `Substitute Beneficiary (A/B)`.

- [ ] **Step 4: Verification**
  Run: `npm run build`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 5: Commit**
  ```bash
  git add components/wizard/steps/Step15Review.tsx components/owa-wizard/SectionF_ReviewDraft.tsx app/admin/applications/[id]/page.tsx
  git commit -m "feat(review-admin): update review audits and admin table for primary and substitute groups"
  ```

---

### Task 5: End-to-End Build Verification & Git Status Check

**Files:**
- All touched files

- [ ] **Step 1: Full production build check**
  Run: `npm run build`
  Expected: Successful compilation of all routes (24/24) with 0 errors.

- [ ] **Step 2: Git status and commit verification**
  Run: `git status` and `git log -n 5 --oneline`

- [ ] **Step 3: Provide git push command to user**
  Provide clear instructions and the exact push command.

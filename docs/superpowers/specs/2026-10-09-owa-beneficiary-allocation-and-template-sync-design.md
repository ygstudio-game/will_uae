# OWA Beneficiary Allocation & Court Template Synchronization — Design Specification

**Date:** 2026-10-09  
**Status:** Approved by User  
**Governing Documents:**
- [`v4_OWA_Beneficiary_Section_Developer_Note.md`](../../client-specs/v4_OWA_Beneficiary_Section_Developer_Note.md) (08 Oct 2026)
- [`v4_OWA_Beneficiary_Screens_and_Flow.html`](../../client-specs/v4_OWA_Beneficiary_Screens_and_Flow.html) (Interactive Prototype)
- `Will Form (3).pdf` (Section Seven, pages 4–5 — Abu Dhabi Civil Family Court)

---

## 1. Executive Summary & Intent

This specification formalizes the owner's confirmed beneficiary allocation rules for the **UAE Will Preparation Platform (ADJD Non-Muslim Will)**, superseding both the initial flat five-beneficiary list and previous draft variations.

The updated design introduces a structured, two-part beneficiary allocation model:
1. **Primary Beneficiaries**: 1 to 3 primary beneficiaries with percentage shares strictly totaling 100%. If any primary predeceases the testator, their share redistributes proportionally among surviving primaries; if only one survives, that primary receives 100%.
2. **Single Shared Substitute Group**: Activates **only if none** of the primary beneficiaries survives the testator. Contains **Substitute A** (mandatory, 100% if alone) and an optional **Substitute B** (A and B percentages strictly totaling 100%).
3. **A's Children Fallback**: If the substitute group activates and A fails to survive or take a vested interest, A's share passes to A's surviving children in equal shares. **B does not have a children fallback**.

---

## 2. Core Distribution Logic & Survivorship Rules

| Situation at Testator's Death | Legal Distribution Outcome |
|---|---|
| **All selected primaries survive** | Each receives their original selected percentage (total 100%). Substitutes A/B remain inactive. |
| **Some primaries survive (2 or more)** | Residue redistributes exclusively among surviving primaries in proportion to their original shares: `Adjusted Share = (Original Share ÷ Sum of Surviving Shares) × 100`. Substitutes remain inactive. |
| **Only 1 primary survives** | Sole surviving primary receives 100% of estate residue. Substitutes remain inactive. |
| **No primary survives** | Activate single shared substitute group: A at 100%, or A and B at their selected percentage shares (total 100%). |
| **Substitute group active, and A predeceases / fails to take a vested interest** | A's share passes to A's surviving children in equal shares. B retains B's share. |
| **Substitute group active, and B predeceases** | Follows statutory undisposed share provision (Clause e). B does *not* possess a children fallback clause. |

### Proportional Redistribution Formula (Surviving Primaries)
$$\text{Adjusted Share}_i = \frac{\text{Original Share}_i}{\sum_{j \in \text{Surviving}} \text{Original Share}_j} \times 100$$

*Example*: P1 = 50%, P2 = 30%, P3 = 20%.
- If P1 predeceases: P2 receives $\frac{30}{50} \times 100 = 60\%$, P3 receives $\frac{20}{50} \times 100 = 40\%$.
- If P1 and P2 predecease: P3 receives 100%.

---

## 3. Data Architecture & Schema Evolution

### 3.1 Role Types & Enums
Update `prisma/schema.prisma`, `types/owa.ts`, and `types/will.ts` to recognize explicit primary and substitute roles:

```prisma
enum RoleType {
  TESTATOR
  EXECUTOR_PRIMARY
  EXECUTOR_SUBSTITUTE
  EXECUTOR_FURTHER
  BENEFICIARY             // Maintained for backward compatibility
  BENEFICIARY_PRIMARY     // Primary beneficiaries (slots 1, 2, 3)
  BENEFICIARY_SUBSTITUTE  // Shared substitute beneficiaries (Slot 1 = A, Slot 2 = B)
  GUARDIAN_PERMANENT
  GUARDIAN_SUBSTITUTE_PERM
  GUARDIAN_TEMPORARY
  CHILD
}
```

### 3.2 Appointment Constraints & Safeguards
- **Primary Group**: Minimum 1, Maximum 3 appointments (`appointmentOrder`: 1, 2, 3).
- **Substitute Group**: Minimum 1 (A is required), Maximum 2 (B is optional) (`appointmentOrder`: 1 for A, 2 for B).
- **Independent 100% Totals**:
  - $\sum \text{Primary Shares} = 100.00\%$
  - $\sum \text{Substitute Shares} = 100.00\%$
  - The two totals are never combined into 200%.
- **Validation Safeguards**:
  - Testator cannot be assigned as a primary or substitute beneficiary.
  - No duplicate individuals within the primary group.
  - No duplicate individuals within the substitute group.
  - **Cross-group prevention**: A primary beneficiary cannot be chosen as an A or B substitute.

---

## 4. UI / UX Design & Screen Flow

Section E in the OWA wizard (`/wizard/beneficiaries`) and Step 9 in the 16-step wizard (`/wizard/9`) are structured into 3 guided sub-views matching the official HTML reference prototype:

### Sub-View 1: Primary Beneficiaries
- **Header & Prompt**:
  - Title: *Primary beneficiaries*
  - Question: *Who should receive your estate, and what percentage should each receive?*
  - Helper: *Add up to three primary beneficiaries. Their shares must total 100%.*
- **Primary Cards (1 to 3)**:
  - Initial state: 1 card labeled *Primary beneficiary 1* at 100%.
  - Actions: *Select an existing person* (dropdown) or *+ Add a new person* (person modal).
  - Share input: Number field with percentage.
  - Adding 2nd or 3rd card: Shows *+ Add primary beneficiary (X/3)*. Percentage is not auto-rebalanced; user enters explicit positive shares.
- **Live Allocation Indicator**:
  - Badge displaying `Primary allocation: X% of 100% · Fully allocated / X% remaining / X% overallocated`.
- **Explanatory Copy**:
  - *If a primary beneficiary does not survive you, their share will be divided among your surviving primary beneficiaries in proportion to their original shares. If only one survives, they receive the whole estate residue.*
- **Navigation Action**: *Continue to substitute beneficiaries* (enabled strictly when 100% is reached and all selections are valid).

### Sub-View 2: Shared Substitutes
- **Header & Prompt**:
  - Title: *If none of your primary beneficiaries survives you*
  - Helper: *Choose who should receive your estate residue if none of your primary beneficiaries survives you. Give 100% to A, or divide 100% between A and B.*
- **Substitute Cards (A and B)**:
  - *Substitute beneficiary A*: Default share 100% when alone.
  - Fallback banner under A: *If this substitute distribution applies and A does not survive you or fails to take a vested interest, A's share passes to A's surviving children equally.*
  - *+ Add substitute beneficiary B* button (optional, limits to 2/2).
  - If B is added, positive shares for A and B must total 100%.
  - If B is removed, A reverts cleanly to 100%.
- **Live Allocation Indicator**:
  - Badge displaying `Substitute allocation: X% of 100%`.
- **Navigation Actions**: *Back* (returns to primaries without losing state) and *Review beneficiaries*.

### Sub-View 3: Beneficiary Review
- Renders two distinct summary tables:
  1. **Primary Beneficiaries Table** with individual percentages and total (100%).
  2. **Substitute Beneficiaries Table** with individual percentages (labeled A and B) and separate total (100%).
- Clearly shows conditional explanation banners for both tiers.
- Quick *Edit primaries* and *Edit substitutes* actions.
- Action: *Save and continue* (or proceed to next wizard section).

---

## 5. Statutory Court Document Rendering (Section Seven)

In both [`ADJDBilingualWillDocument.tsx`](../../components/court/ADJDBilingualWillDocument.tsx) and [`BilingualWillDocument.tsx`](../../components/court/BilingualWillDocument.tsx):

### Part 1 — Gift of Residue & Primary Redistribution
- **Opening Preamble**: Directions to Trustees to make over the whole residue and remainder of means and estate to the named primary beneficiaries.
- **Primary Records (1 to 3)**:
  - Clause a), b), c) specifying percentage share, Full Name, Arabic Name, Date of Birth, Passport Number, and Emirates ID (if applicable).
- **Survivorship Clause**:
  - *English*: "If any of my said primary beneficiaries shall predecease me, then I direct that their share of the residue shall be divided among my surviving primary beneficiaries in proportion to their original percentage shares. If only one primary beneficiary survives me, such sole surviving primary beneficiary shall receive the whole of my estate residue."
  - *Arabic*: "وفي حال وفاة أيٍّ من المستفيدين الأساسيين المذكورين أعلاه قبلي، فإنني أوجه بأن تُوزع حصته من التركة على المستفيدين الأساسيين الباقين على قيد الحياة تناسبياً وفقاً لنسب حصصهم الأصلية. وفي حال بقي مستفيد أساسي واحد فقط على قيد الحياة، فإنه يحوز كامل باقي تركتي."

### Part 2 — Shared Substitute Group Activation
- **Introductory Condition**:
  - *English*: "If none of my above-named primary beneficiaries survives me, then I direct my trustees to hold the residue of my estate upon trust for the following substitute beneficiaries:"
  - *Arabic*: "وفي حال لم يبقَ أيٌّ من المستفيدين الأساسيين المذكورين أعلاه على قيد الحياة، فإنني أوجه أوصيائي بالاحتفاظ بباقي تركتي كأمانة لصالح المستفيدين البدلاء التاليين:"
- **Substitute A**:
  - Full personal details and percentage share.
  - **A's Children Fallback Clause**:
    - *English*: "If the said [Substitute A Full Name] does not survive me or fails to take a vested interest, then his/her share of residue shall pass to his/her surviving children in equal shares."
    - *Arabic*: "وفي حال لم يبقَ المذكور/ المذكورة أعلاه على قيد الحياة أو لم يحز على حصة مستقرة، تؤول حصته من التركة إلى أولاده الباقين على قيد الحياة بالتساوي بينهم."
- **Substitute B (Rendered only if selected)**:
  - Full personal details and percentage share.
  - **Crucial Rule**: *No children fallback clause is rendered for B*.
- **Statutory Clauses (c & d)**:
  - Beneficiaries under 21 trust and maintenance/education powers preserved intact.
- **Statutory Clause (e)**:
  - Undisposed share pro-rata redistribution preserved intact.

---

## 6. Review & Admin Screens Alignment

1. **Step 15 Review & Section F Review**:
   - Updated to display the dual primary and substitute summary blocks with independent 100% audit indicators.
   - Audit checks verify that primaries total 100% and substitute group totals 100%.
2. **Admin Application Detail Page (`/admin/applications/[id]`)**:
   - Role table displays `BENEFICIARY_PRIMARY #1..3` and `BENEFICIARY_SUBSTITUTE (A/B)` distinctly with their respective shares.
3. **Couples Mirroring Logic**:
   - When mirroring to spouse, swap primary testator/spouse roles while preserving valid substitute appointments and independent 100% validation.

---

## 7. Verification & Acceptance Criteria

1. **Primary Cap & Validation**: Adding beyond 3 primaries is disabled. Totals not equaling 100.00% display explicit error messaging and disable progress.
2. **Substitute Cap & Validation**: A is mandatory (100% if alone); B is optional. A + B must equal 100.00%. Adding a 3rd substitute is blocked.
3. **Safeguard Enforcement**: Testator cannot be selected; duplicate individuals are flagged; primary cannot be selected as substitute.
4. **Bilingual Will Verification**: Dual-column court output renders primary proportional redistribution, Block A with children fallback, Block B without children fallback, and clauses c, d, e.
5. **Type Safety & Build**: `npm run build` passes with 0 TypeScript and lint errors.

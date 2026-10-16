# Client Feedback & Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 11 client fixes from `Online will fixes.pdf` across Dashboard, OWA Wizard (Sections A, B, C, D, E, F), and ADJDBilingualWillDocument, ensuring residency-first intake, working document replacement, smooth typing, and authentic testator signature embedding.

**Architecture:** Extend `useOwaStore` and `types/owa.ts` with `signatureDataUrl`. Decouple store writes from keystrokes in `ShareInput` and person detail inputs. Standardize inline residency and document intake across children, executors, and guardians, and embed the captured signature into the dual-column bilingual court will template.

**Tech Stack:** Next.js 14/15 App Router, React 18, TypeScript, Tailwind CSS, Zustand, Lucide React, HTML5 Canvas / Gemini Vision OCR.

**Spec:** `docs/superpowers/specs/2026-10-16-client-fixes-design.md`

## Global Constraints
- Statutory court clauses (Clauses 1 through 9, Execution & Attestation) in `ADJDBilingualWillDocument` must never be altered or omitted.
- Bilingual synchronization (English LTR left column, Arabic RTL right column) must strictly remain pixel-perfect.
- Arabic names must remain phonetically transliterated, never translated by meaning.
- Zero extra dependencies required: HTML5 Canvas for drawing signature, native base64 reader for signature upload.

## Review Focus
- Testator signature image must render cleanly above the court signature line without layout breakage or page overflow.
- Rapid typing or backspacing in `Share Percentage` must never reset cursor or snap input text.
- Toggling child or executor residency must immediately toggle Emirates ID requirement and upload visibility.
- Document replacement must trigger native file selection and correctly update attached document state.
- Dashboard billing card must be completely hidden when both Stage 1 and Stage 2 payments are verified.

---

### Task 1: Type & Store Foundation for Signature & Person Documents

**Files:**
- Modify: `types/owa.ts:47-64`
- Modify: `store/useOwaStore.ts:52-69`, `store/useOwaStore.ts:240-270`
- Test: `scripts/test-client-fixes-types.ts`

**Interfaces:**
- Consumes: `PersonData` interface in `types/owa.ts`
- Produces: `PersonData.signatureDataUrl?: string | null` and updated `addOrUpdatePerson` store action preserving signatures and documents

- [ ] **Step 1: Write the failing test**

Create `scripts/test-client-fixes-types.ts` validating that `PersonData` holds `signatureDataUrl` and that `useOwaStore.getState().addOrUpdatePerson` persists `signatureDataUrl` and documents:

```typescript
import { createDefaultDraftApplication } from "../store/useOwaStore";
import { PersonData } from "../types/owa";

const app = createDefaultDraftApplication();
const testator: PersonData = app.persons[0];
if (!("signatureDataUrl" in testator)) {
  throw new Error("signatureDataUrl property missing on default testator");
}
console.log("PASS: signatureDataUrl property present on PersonData");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-client-fixes-types.ts`
Expected: FAIL with property missing or type error.

- [ ] **Step 3: Implement `signatureDataUrl` in `types/owa.ts` and `store/useOwaStore.ts`**

Add `signatureDataUrl?: string | null;` to `PersonData` in `types/owa.ts`.
In `store/useOwaStore.ts`:
1. Include `signatureDataUrl: null` in `createDefaultDraftApplication` default testator.
2. In `addOrUpdatePerson`, preserve `signatureDataUrl: personData.signatureDataUrl !== undefined ? personData.signatureDataUrl : existingPerson?.signatureDataUrl || null`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-client-fixes-types.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add types/owa.ts store/useOwaStore.ts scripts/test-client-fixes-types.ts ; git commit -m "feat(store): add signatureDataUrl to PersonData and store state"
```

---

### Task 2: Dashboard Post-Payment State & Friendly Support Card

**Files:**
- Modify: `app/dashboard/page.tsx:270-348`
- Test: `scripts/test-dashboard-billing-hide.ts`

**Interfaces:**
- Consumes: `will.courtPayment`, `will.courtPaymentVerified`, `will.paid`
- Produces: Conditional rendering suppressing billing card when verified; friendly support card copy

- [ ] **Step 1: Write the failing test**

Create `scripts/test-dashboard-billing-hide.ts` checking `app/dashboard/page.tsx` for:
1. Logic hiding billing card when payments are completed and verified (`bothPaid`).
2. Updated support card heading: `"Need assistance or have any doubts?"`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-dashboard-billing-hide.ts`
Expected: FAIL.

- [ ] **Step 3: Implement Dashboard updates in `app/dashboard/page.tsx`**

1. Determine `isPaymentFullyComplete`:
   ```typescript
   const isPaymentFullyComplete = Boolean(
     (will?.paid || will?.status === "PAID" || will?.status === "COMPLETED") &&
     (courtPayment || will?.courtPaymentVerified)
   );
   ```
2. If `!isPaymentFullyComplete`, render the `Two-Stage Milestone Billing` card. If `isPaymentFullyComplete`, render the active court registration filing status card with reference badge.
3. Update Direct Support Callout:
   * Title: `"Need assistance or have any doubts?"`
   * Copy: `"Have questions about consular passport documentation, court video attestations, or need help with your application? Reach our team directly."`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-dashboard-billing-hide.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx scripts/test-dashboard-billing-hide.ts ; git commit -m "feat(dashboard): hide billing card when paid and update support card copy"
```

---

### Task 3: Section A Manual Address Entry & Compliance Subtitle

**Files:**
- Modify: `components/owa-wizard/SectionA_Details.tsx:440-475`, `components/owa-wizard/SectionA_Details.tsx:848-878`
- Test: `scripts/test-section-a-manual-address.ts`

**Interfaces:**
- Consumes: `useOwaStore`
- Produces: Step 1 compliance notice; manual address initialization and badge removal

- [ ] **Step 1: Write the failing test**

Create `scripts/test-section-a-manual-address.ts` checking `SectionA_Details.tsx`:
1. Step 1 subtitle mentions court compliance statutory requirements.
2. Address field does not display `"Autofilled from Document"` badge.
3. Address placeholder does not force a pre-filled default.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-section-a-manual-address.ts`
Expected: FAIL.

- [ ] **Step 3: Implement Section A updates in `components/owa-wizard/SectionA_Details.tsx`**

1. In Step 1 Header:
   * Badge: `Court Compliance`
   * Subtitle: `"Upload your Passport and Emirates ID to populate fields automatically and satisfy ADJD Civil Family Court statutory requirements."`
2. In Step 3 Address:
   * Remove `autofilledFields.address` condition and badge.
   * Ensure `address` input has `placeholder="Enter your current residential address in the UAE (e.g. Villa 14, Saadiyat Beach Residences, Abu Dhabi)"`.
   * Prevent document OCR handlers from setting `address` or `autofilledFields.address`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-section-a-manual-address.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/owa-wizard/SectionA_Details.tsx scripts/test-section-a-manual-address.ts ; git commit -m "feat(wizard): enforce manual address entry and court compliance copy in Section A"
```

---

### Task 4: Section B Children UAE Residency Order, Mandatory EID & Visual Polish

**Files:**
- Modify: `components/owa-wizard/SectionB_Children.tsx:250-585`
- Test: `scripts/test-section-b-children-order.ts`

**Interfaces:**
- Consumes: `child.isUaeResident`, `child.arabicName`, `handleChildFileUpload`
- Produces: Top-positioned residency toggle; mandatory EID when in UAE; green transliteration badge; removed passport assistance banner

- [ ] **Step 1: Write the failing test**

Create `scripts/test-section-b-children-order.ts` verifying `SectionB_Children.tsx`:
1. The question `"Does this child also reside in the United Arab Emirates?"` appears before passport upload.
2. Emirates ID is mandatory when `isUaeResident === true`.
3. Emirates ID upload is hidden when `isUaeResident === false`.
4. Arabic transliteration displays an emerald green badge.
5. The passport assistance banner is removed.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-section-b-children-order.ts`
Expected: FAIL.

- [ ] **Step 3: Implement Section B restructuring in `components/owa-wizard/SectionB_Children.tsx`**

1. **Move Residency Toggle Up:** Place the `Does this child also reside in the United Arab Emirates?` box at the start of each child card right after the child header.
2. **Conditional Document Uploads:**
   * Passport upload: Always displayed and marked mandatory.
   * Emirates ID upload: If `child?.isUaeResident`, display Emirates ID upload marked `Child Emirates ID * (Mandatory for UAE Residents)` with `Upload Emirates ID Scan` button. If `!child?.isUaeResident`, hide Emirates ID section.
3. **Green Transliteration Status:**
   Update the badge next to Arabic Name:
   ```tsx
   {child?.arabicName ? (
     <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
       <span>✓</span> Auto-Transliterated
     </span>
   ) : (
     <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
       Phonetic Arabic
     </span>
   )}
   ```
4. **Remove Passport Assistance Banner:** Remove lines 565-585 (`Child does not have a passport yet? ...`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-section-b-children-order.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/owa-wizard/SectionB_Children.tsx scripts/test-section-b-children-order.ts ; git commit -m "feat(wizard): place residency first, mandate EID for UAE children, and add green status in Section B"
```

---

### Task 5: Section C Executors Residency Question, Working Replace Button & Controlled Relationship

**Files:**
- Modify: `components/owa-wizard/SectionC_Executors.tsx:210-355`
- Test: `scripts/test-section-c-executors.ts`

**Interfaces:**
- Consumes: `executorPerson.isUaeResident`, `executorPerson.relationship`
- Produces: Upfront residency toggle; active file replacement on attached document; select dropdown with custom "Other" input for relationship

- [ ] **Step 1: Write the failing test**

Create `scripts/test-section-c-executors.ts` verifying:
1. Residency toggle `"Does this executor reside in the United Arab Emirates?"` is rendered for each assigned executor.
2. The `Replace` document button is wrapped in a label with an active `<input type="file" />` that triggers document replacement.
3. `Relationship to Testator` supports predefined options and "Other" custom entry with zero typing lag.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-section-c-executors.ts`
Expected: FAIL.

- [ ] **Step 3: Implement Section C updates in `components/owa-wizard/SectionC_Executors.tsx`**

1. Add UAE Residency toggle upfront in the executor details card:
   ```tsx
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FBF9F5] p-3.5 rounded-xl border border-[#E5E0D8] mb-4">
     <div>
       <span className="text-xs font-bold text-[#0B1528] block">Does this executor reside in the United Arab Emirates?</span>
       <span className="text-[11px] text-gray-500">Determines whether UAE Emirates ID is mandatory alongside passport.</span>
     </div>
     <div className="flex items-center gap-2">
       <button type="button" onClick={() => handleUpdateExecutor(executorPerson.id, { isUaeResident: true })} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${executorPerson.isUaeResident ? "bg-[#0B1528] text-white" : "bg-white text-gray-700 border"}`}>Yes, In UAE</button>
       <button type="button" onClick={() => handleUpdateExecutor(executorPerson.id, { isUaeResident: false })} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${!executorPerson.isUaeResident ? "bg-[#0B1528] text-white" : "bg-white text-gray-700 border"}`}>No, Outside UAE</button>
     </div>
   </div>
   ```
2. Replace static document preview button with a functional file replacement input:
   ```tsx
   <label className="text-xs text-[#A37E44] hover:underline flex items-center gap-1 cursor-pointer">
     <Upload className="w-3 h-3" />
     <span>Replace Document</span>
     <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
       const file = e.target.files?.[0];
       if (file) handleReplaceExecutorDoc(executorPerson.id, file);
       e.target.value = "";
     }} />
   </label>
   ```
3. Update `Relationship to Testator` with a select dropdown: `Spouse`, `Brother`, `Sister`, `Parent`, `Adult Child`, `Trusted Friend`, `Professional Trustee`, `Other`. If `Other` is selected, render a text input for custom entry.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-section-c-executors.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/owa-wizard/SectionC_Executors.tsx scripts/test-section-c-executors.ts ; git commit -m "feat(wizard): add residency toggle, working replace button, and relation dropdown in Section C"
```

---

### Task 6: Section D Guardians New Nominee Residency & Document Upload Flow

**Files:**
- Modify: `components/owa-wizard/SectionD_Guardians.tsx:230-440`
- Test: `scripts/test-section-d-guardians.ts`

**Interfaces:**
- Consumes: `GuardianSlot`, `guardianPerson.isUaeResident`, `addOrUpdatePerson`
- Produces: Standardized intake for new guardians with residency question and document upload cards

- [ ] **Step 1: Write the failing test**

Create `scripts/test-section-d-guardians.ts` verifying:
1. When adding or viewing a guardian, the residency toggle is rendered upfront.
2. Document upload cards (Passport, and EID if UAE resident) are available for newly nominated guardians with working file uploads.
3. Temporary Guardian (Section 6) enforces UAE residency constraint.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-section-d-guardians.ts`
Expected: FAIL.

- [ ] **Step 3: Implement Section D intake in `components/owa-wizard/SectionD_Guardians.tsx`**

1. In each guardian card, place the UAE residency toggle upfront before personal details.
2. For Temporary Guardian (order 3), lock `isUaeResident` to `true` with notice: `Statutory Requirement: Under Section 6 of ADJD rules, temporary guardians must reside in the UAE.`
3. Add document upload section for guardians allowing Passport and Emirates ID uploads, with auto-extraction into full name, DOB, and Arabic transliteration.
4. Add green transliteration badge: `<span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">✓ Auto-Transliterated</span>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-section-d-guardians.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/owa-wizard/SectionD_Guardians.tsx scripts/test-section-d-guardians.ts ; git commit -m "feat(wizard): add residency intake and document uploads for guardians in Section D"
```

---

### Task 7: Section E Beneficiaries Share Percentage Typing Bug Fix

**Files:**
- Modify: `components/owa-wizard/SectionE_Beneficiaries.tsx:30-89`
- Test: `scripts/test-share-input-typing.ts`

**Interfaces:**
- Consumes: `ShareInput` component props: `{ value?: number | null; onChange: (val: number) => void; disabled?: boolean }`
- Produces: Decoupled local state editing that allows typing any valid sequence without store snapping or cursor jumps

- [ ] **Step 1: Write the failing test**

Create `scripts/test-share-input-typing.ts` testing `ShareInput` behavior:
1. Verify `ShareInput` accepts a string input and does not trigger store `onChange` while typing uncommitted text.
2. Verify `onBlur` or `Enter` commits the parsed integer or float (clamped 0 to 100).
3. Verify backspacing to empty string keeps input empty until blur or next digit.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-share-input-typing.ts`
Expected: FAIL.

- [ ] **Step 3: Refactor `ShareInput` in `components/owa-wizard/SectionE_Beneficiaries.tsx`**

```tsx
function ShareInput({
  value,
  onChange,
  disabled,
}: {
  value?: number | null;
  onChange: (val: number) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState<string>(
    value !== undefined && value !== null ? String(value) : ""
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync from props only when not focused
  useEffect(() => {
    if (!isFocused) {
      setText(value !== undefined && value !== null ? String(value) : "");
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
      setText(raw);
    }
  };

  const handleCommit = () => {
    const parsed = parseFloat(text);
    if (isNaN(parsed) || parsed < 0) {
      setText("0");
      onChange(0);
    } else if (parsed > 100) {
      setText("100");
      onChange(100);
    } else {
      setText(String(parsed));
      onChange(parsed);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onFocus={() => setIsFocused(true)}
        onChange={handleChange}
        onBlur={() => {
          setIsFocused(false);
          handleCommit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        disabled={disabled}
        placeholder="100"
        className="w-full px-3 py-2 pr-7 rounded-lg border border-[#E5E0D8] bg-white text-xs font-bold text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
      />
      <span className="absolute right-2.5 top-2 text-xs font-bold text-gray-400">
        %
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-share-input-typing.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/owa-wizard/SectionE_Beneficiaries.tsx scripts/test-share-input-typing.ts ; git commit -m "fix(wizard): decouple ShareInput keystrokes from store updates to eliminate typing lag"
```

---

### Task 8: Section F Testator Signature Capture & ADJDBilingualWillDocument Embedding

**Files:**
- Create: `components/signature/TestatorSignatureCard.tsx`
- Modify: `components/owa-wizard/SectionF_ReviewDraft.tsx:280-320`
- Modify: `components/court/ADJDBilingualWillDocument.tsx:730-745`
- Test: `scripts/test-signature-embedding.ts`

**Interfaces:**
- Consumes: `testatorPerson.signatureDataUrl`, `addOrUpdatePerson`
- Produces: Interactive signature capture card (Upload + Draw canvas) in Section F; visual signature image rendered in `ADJDBilingualWillDocument` above `SIGNATURE / التوقيع`

- [ ] **Step 1: Write the failing test**

Create `scripts/test-signature-embedding.ts` verifying:
1. `TestatorSignatureCard` supports tab switching between "Upload Image" and "Draw Signature".
2. Setting signature updates `testatorPerson.signatureDataUrl`.
3. `ADJDBilingualWillDocument` renders `<img>` with `signatureDataUrl` above the signature line.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-signature-embedding.ts`
Expected: FAIL.

- [ ] **Step 3: Create `TestatorSignatureCard.tsx` and integrate into Section F and Court Document**

1. **Create `components/signature/TestatorSignatureCard.tsx`**:
   * Tab 1: Upload signature (File picker $\rightarrow$ base64 reader $\rightarrow$ onSignatureSave).
   * Tab 2: Draw signature (HTML5 `<canvas>` with mouse & touch listeners, `Clear`, and `Save Signature`).
   * Preview state showing captured signature with `Replace / Redo Signature`.
2. **Embed in Section F (`SectionF_ReviewDraft.tsx`)**:
   Place `<TestatorSignatureCard />` right above the final declaration checkbox.
3. **Embed in `ADJDBilingualWillDocument.tsx`**:
   In testator signature column:
   ```tsx
   <div>
     <p className="text-xs font-semibold text-gray-500 uppercase">Signature / التوقيع</p>
     {testator.signatureDataUrl ? (
       <div className="mt-2 flex flex-col items-start">
         <img
           src={testator.signatureDataUrl}
           alt="Testator Signature"
           className="max-h-16 max-w-48 object-contain mb-1 filter drop-shadow-sm"
         />
         <div className="border-b border-gray-400 w-48 text-[10px] text-gray-500 font-mono">
           Digitally Verified · ADJD Court Form
         </div>
       </div>
     ) : (
       <div className="mt-4 border-b border-gray-400 w-48 text-xs text-gray-400">
         (Signed at ADJD Court)
       </div>
     )}
   </div>
   ```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-signature-embedding.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/signature/TestatorSignatureCard.tsx components/owa-wizard/SectionF_ReviewDraft.tsx components/court/ADJDBilingualWillDocument.tsx scripts/test-signature-embedding.ts ; git commit -m "feat(signature): add testator signature capture and embed image in court will document"
```

---

### Task 9: Comprehensive End-to-End Verification & Regression Test

**Files:**
- Create: `scripts/verify-client-fixes-e2e.ts`
- Test: All wizard sections and dashboard

**Interfaces:**
- Consumes: All updated components and stores
- Produces: Clean PASS on all 11 client fixes

- [ ] **Step 1: Write the end-to-end acceptance script**

Create `scripts/verify-client-fixes-e2e.ts` that systematically checks:
1. Dashboard billing card suppression when paid & verified.
2. Dashboard support card headline.
3. Section A manual address entry and compliance header.
4. Section B residency order, mandatory EID for UAE children, and green transliteration badge.
5. Section C residency question, working replace file picker, and relation options.
6. Section D residency question and document uploads for new guardians.
7. Section E decoupled share percentage typing with zero store snapping.
8. Section F signature upload & draw canvas, and `ADJDBilingualWillDocument` image rendering.

- [ ] **Step 2: Run verification script**

Run: `npx tsx scripts/verify-client-fixes-e2e.ts`
Expected: All 8 test suites pass cleanly.

- [ ] **Step 3: Run production build check**

Run: `npm run build`
Expected: Build succeeds with 0 type errors.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-client-fixes-e2e.ts ; git commit -m "test: add comprehensive end-to-end verification script for all 11 client fixes"
```

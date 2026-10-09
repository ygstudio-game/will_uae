# OWA — Beneficiary section developer note

8 October 2026 | Confirmed allocation flow | Applies to Section E and template Section Seven

## 1. Scope and source precedence

Implement the owner's final clarification: one to three primary beneficiaries, with one shared substitute group containing A alone or A and B. This supersedes both the original flat five-beneficiary list and the intermediate proposal of separate substitutes for each primary.

Sources: Will Form (3).pdf, Section Seven, pages 4–5; OWA- WEBSITE (1).docx; subsequent owner confirmations on 8 October 2026. The supplied template starts with one primary. Extending it to three with the rules below is an owner-directed adaptation, not a claim that the unmodified template already expresses every multi-primary outcome. Final English and Arabic clauses must express the same approved intent.

## 2. Confirmed distribution rules

| Situation at the testator's death | Intended distribution |
|---|---|
| All selected primaries survive | Each receives the original selected percentage |
| Some primaries do not survive, but two or more survive | Redistribute among surviving primaries in proportion to their original percentages |
| Only one primary survives | That primary receives 100% of the residue |
| No primary survives | Activate the single shared substitute group: A at 100%, or A/B at their selected percentages |
| The substitute group is active and A does not survive or fails to take a vested interest | Preserve the source clause passing A's share to A's surviving children, equally if more than one |

A/B do not receive a deceased primary's individual share while another primary survives. They are not primary beneficiaries 4 and 5 and do not receive an additional allocation alongside surviving primaries.

Maximum directly selected appointments: three primary beneficiaries plus two substitutes. A's surviving children are a class described by the source clause, not extra named primary/substitute slots. Do not add a form requiring all of A's children or apply the testator's five-child limit to this clause.

The source does not attach A's children clause to B. Do not duplicate it for B, omit it from A, or treat A and B as interchangeable labels. Retain the source's later undisposed-share provision, but do not invent outcomes when B fails, A has no surviving children, or every applicable route fails. Those interactions need matching template-review instructions; they are not resolved merely by adding up percentages.

## 3. Screen flow and copy

Replace the current single-list screen (08-wizard-section-e-beneficiaries.png) with two parts in the same beneficiary section.

### Part 1 — Primary beneficiaries

Heading: **Primary beneficiaries**

Question: **Who should receive your estate, and what percentage should each receive?**

Helper: **Add up to three primary beneficiaries. Their shares must total 100%.**

- Initially show one card labelled **Primary beneficiary 1**, with 100% when it is the only entry.
- Offer **Select an existing person** and **Add a new person**.
- Button: **+ Add primary beneficiary**. Allow up to three; replace the old “1/5” count with “1/3”, “2/3” or “3/3”.
- Two/three entries require positive customer-entered percentages totalling 100%. Do not silently split equally or rebalance when adding/removing a person.
- Show **Primary allocation: X% of 100%**, and remaining or overallocated percentage.
- Explanation: **If a primary beneficiary does not survive you, their share will be divided among your surviving primary beneficiaries in proportion to their original shares. If only one survives, they receive the whole estate residue.**
- Button: **Continue to substitute beneficiaries**. Do not automatically navigate when 100% is reached.

### Part 2 — Substitute beneficiaries

Heading: **If none of your primary beneficiaries survives you**

Helper: **Choose who should receive your estate residue if none of your primary beneficiaries survives you. Give 100% to A, or divide 100% between A and B.**

- Show **Substitute beneficiary A** first, using the same person-selection interaction.
- A alone receives 100% of the residue when this group is activated.
- Button: **+ Add substitute beneficiary B**. B is optional; maximum two substitutes in this single shared group.
- With A and B selected, require positive percentages totalling 100%.
- Show **Substitute allocation: X% of 100%**, separately from the primary total. Never combine the two into 200%.
- Explain A's source-specific fallback near A: **If this substitute distribution applies and A does not survive you or fails to take a vested interest, A's share passes to A's surviving children equally.** This is explanatory interface copy; use reviewed bilingual template wording for the Will.
- Buttons: **Back** and **Save and continue**. Preserve values between parts.

Implementation assumption: the described standard flow requires A, with B optional. The owner has not expressly approved skipping the entire substitute group. Keep A required for this documented flow; if a no-substitute option is desired, obtain that separate decision before introducing Skip or an empty-group generated clause. This assumption is distinct from the now-confirmed shared-group trigger.

Do not ask customers which selected people have died as part of ordinary intake. These are future conditions encoded in the Will. Any preview examples are illustrative, not a probate/distribution service.

## 4. Person fields and documents

Use the existing shared person profile for all primary and substitute selections: full English name, available Arabic name, DOB, nationality, passport number/upload, applicable Emirates ID number/upload and compulsory residential address. Phone/email remain optional for non-testators; their proof of address is not required. Reuse uploads across roles. Missing extracted fields can be completed manually without waiving required uploads.

Preserve source fields in the generated output: primary name, DOB, passport and applicable Emirates ID; A/B name, DOB and passport, with other collected fields inserted only where the approved template variant calls for them.

## 5. Proportional redistribution examples

For surviving primary i:

**Adjusted share = original share of i ÷ total original shares of all surviving primaries × 100.**

| Original primary shares | Surviving primaries | Result |
|---|---|---|
| P1 50%, P2 30%, P3 20% | All | 50%, 30%, 20%; A/B inactive |
| P1 50%, P2 30%, P3 20% | P2 and P3 | P2 60%, P3 40%; A/B inactive |
| P1 50%, P2 30%, P3 20% | P1 and P3 | P1 approximately 71.43%, P3 approximately 28.57%; A/B inactive |
| P1 50%, P2 30%, P3 20% | P3 only | P3 100%; A/B inactive |
| P1 60%, P2 40% | P2 only | P2 100%; A/B inactive |
| Any valid primary split | None; A 100% selected | A 100%, subject to A's source fallback |
| Any valid primary split | None; A 60%, B 40% selected | A 60%, B 40%, subject to subsequent source provisions |
| No primary survives; A 60%, B 40%; A fails and has two surviving children | B and A's two children | Each of A's two children receives 30%; B retains 40%, assuming no other applicable failure |

Store original selected shares unchanged. Preserve exact ratios internally for demonstrations; round only display values and label approximations. Do not turn rounded example percentages into replacement instructions in the Will.

## 6. Template mapping and clause handling

| Section Seven element | Developer instruction |
|---|---|
| Initial gift of estate residue | Render one to three primary records with their chosen shares |
| Partial primary non-survival | Express redistribution exclusively among surviving primaries, pro rata to original shares |
| Opening substitute condition | For multiple primaries, express the condition that none survives the testator; the singular “above beneficiary” alone is insufficient |
| A block | Render A and percentage; retain the source children fallback for A |
| B block | Render only when selected; remove the complete unused block when A has 100%; no invented children fallback for B |
| Clauses c and d | Preserve the source's beneficiary trust-age 21 and related income/maintenance provisions; do not substitute the guardianship threshold of 18 |
| Clause e | Preserve its residual purpose after preceding provisions, with reviewed wording that does not accidentally activate A/B while a primary survives or bypass A's children clause |

Use the English-left/Arabic-right layout and matching identities, dates, shares and conditional references. Final bilingual wording must be approved for this adaptation before production generation. This note specifies business behaviour and field mapping, not final legal drafting. Do not generate new Arabic legal wording by simply pluralising a few labels or stripping conditions from the source.

## 7. Data and validation

- One primary allocation group per Will: 1–3 appointments.
- One substitute allocation group per Will: A and optional B. Trigger: no primary survives. No parent-primary link or per-primary substitute groups.
- Store each appointment's person reference, role/slot and percentage separately from the shared identity profile. Keep A's fixed descendant fallback in the approved template version.
- Each active group's percentages independently total 100%, using fixed-point arithmetic. Do not silently redistribute data entry errors.
- Block duplicate people within a group and selection of the testator as beneficiary. Proposed safeguard: prevent reusing a primary as an A/B substitute, since that person cannot survive a condition requiring all primaries not to survive. Treat this as an implementation safeguard, not a sourced court rule.
- Removing a selected person preserves identity documents used elsewhere; the customer explicitly reallocates shares. If B is removed, show A's resulting 100% clearly before continuation.
- Review and admin screens show both groups and the fallback condition. No flat list implying all five inherit simultaneously.
- Couple copy retains both groups and applies the agreed spouse replacement where relevant, then validates roles/shares. Each Will's choices remain independent.
- Any change invalidates draft confirmation and requires regeneration before court payment under the existing edit rules.
- Do not silently migrate existing four/five-primary drafts. Preserve versions and ask for revised selections through the established correction process.

## 8. Acceptance checks

1. One primary initially; maximum three; the fourth cannot be added.
2. One primary receives 100%; two/three require a valid 100% allocation.
3. Every primary configuration proceeds to one shared substitute group, not one per primary.
4. A alone is 100%; A/B must independently total 100%; no third substitute.
5. Removing/adding entries, Back, autosave and manual-field fallback work without silent data loss or duplicate uploads.
6. All example outcomes in Section 5 match the rule; A/B remain inactive if any primary survives.
7. A's children clause appears in both languages for both A-only and A/B variants. B has no copied descendant clause.
8. Generated versions preserve c/d and reviewed e, with no dangling singular references or unused B placeholders.
9. The review summary distinguishes primary and substitute totals and shows the trigger clearly.
10. Couple copying and edits preserve independent allocations and invalidate affected confirmations.
11. Template reviewer checks mixed primary-survival cases, no surviving primary, A's descendant fallback and unresolved-share interactions before release.

## 9. Developer delivery

Update the beneficiary screen, form validation, review/admin summaries, data model, couple-copy logic and bilingual template mapping together. Supply samples for one primary/A only, three primaries/A+B, partial primary survival illustration and A's descendant fallback. Main specification Section E is updated with the same rules.


## 10. Screen prototype and developer walkthrough

Open **OWA_Beneficiary_Screens_and_Flow.html** in a browser. It contains the clickable screens and an embedded readable developer guide. All people are fictional; no real documents or application data are stored.

| Screen | Interaction | Next state |
|---|---|---|
| 1. Primary beneficiaries | Choose one person at 100%, or add up to three and enter shares | Continue only after valid selections and 100% total |
| 2. Shared substitutes | Choose A at 100%, optionally add B and split | Continue to beneficiary review after independent 100% total |
| 3. Review beneficiaries | Read both groups, their separate totals and conditional explanations; edit either | Continue to main questionnaire review, not directly to payment |
| Developer guide | Read conditions, proportional examples, template rules and test cases | Reference only, not a customer screen |

The prototype demonstrates invalid totals, missing selections, duplicate selections, maximum entries, A-only/A+B and Back preserving values. Navigation tabs are developer preview shortcuts; production must enforce completion gates. The new-person prompt is a prototype stub for the existing full person/document editor. Document validation, OCR, autosave, authentication and generation are not implemented in this reference.

Developer walkthrough: select a primary at 100%; add a second to see the missing-share error; change shares to 60/40; continue; select A at 100%; add B and set 70/30; review; go back and verify values remain. Also test a third primary and removal without silently reallocating primary shares.

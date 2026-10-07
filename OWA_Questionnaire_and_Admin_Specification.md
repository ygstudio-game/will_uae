# OWA questionnaire and admin specification

Version 1 | 3 October 2026 | Developer handover

## Purpose and decision status

Build Online Wills Advisor as a guided Will-preparation platform. Customers pay for preparation, upload documents, supply their instructions, view a generated English–Arabic Will, confirm the draft and pay the court fee. Admin manually verifies the documents and draft, makes corrections, and coordinates submission to ADJD. The court or admin delivers the registered Will outside the portal.

This specification consolidates the latest decisions in the conversation. It does not amend the source document, confirm current ADJD eligibility or charges, or approve legal clauses. Source: **ADJD- Non-Muslim Will Template.docx**, supplied in this conversation. Its existing fields and conditional clauses were read directly. Earlier contradictory choices are superseded by the decisions below.

**Confirmed** means agreed by the owner. **Implementation rule** means a proposed technical consequence of those decisions, not an additional legal requirement. **Open item** means a decision or approved wording is still needed; do not silently invent it.

## 1. Confirmed scope and pricing

| Item | Confirmed requirement |
|---|---|
| Platform age rule | Testator aged 21 or older; calculate from date of birth. This is OWA’s chosen threshold, not a statement of the current legal minimum. |
| Intended audience | Muslim and non-Muslim expatriates with UAE assets. Template suitability for this whole audience remains a legal review item. |
| Residence | UAE residents and people living abroad who have UAE assets. |
| UAE assets | Ask for a declaration that UAE assets are held. No itemised asset inventory or ownership-document requirement. |
| Packages | Individual Will or Wills for Couples, comprising two separate Wills. |
| Questionnaire | English only at launch. |
| Output | Bilingual English–Arabic draft. |
| Sign-in | Email OTP; no password. |
| Application expiry | No completion deadline after the OWA payment. Progress can be saved and resumed. |
| Customer draft access | View within the signed-in dashboard. No share links, invitations or download button. |
| Admin draft access | View, edit data, generate and download Word/PDF; upload corrected draft versions. |
| Payment gateway | To be decided. Keep the integration replaceable. |

| Package | OWA fee at initial checkout | Court fee at later checkout | Total disclosed upfront |
|---|---:|---:|---:|
| Individual Will | AED 999 | AED 950 | AED 1,949 |
| Wills for Couples | AED 1,799 | AED 1,900 | AED 3,699 |

VAT is recorded as not applicable on the owner’s instruction. AED 950 per Will is the owner’s specified collection amount; this specification does not independently verify the current court tariff. Disclose both payment stages before initial purchase. The intended OWA service-fee policy is non-refundable after successful payment, subject to applicable legal requirements. Refund decisions and communication are handled outside the portal through the team; no customer refund-request feature is in scope.

## 2. Complete journey

1. View prices, inclusions, a sample Will and the preparation/registration process.
2. Complete a short suitability questionnaire.
3. Review a personalised package summary showing the amount payable now and later.
4. Enter checkout contact details and pay the OWA service fee.
5. Open the application dashboard. Returning customers sign in using email OTP.
6. Complete testator details, document uploads and current address.
7. Select beneficiaries and their percentages, executors, and guardians/children where applicable.
8. For couples, complete both Wills, using the agreed copy options.
9. Complete required-field checks and generate the bilingual draft or both drafts.
10. View and confirm the draft(s), then pay the court fee through OWA checkout.
11. Lock customer self-service edits. Admin receives a notification and verifies within 2–3 working days.
12. Resolve flags, obtain replacement documents and correct the draft through admin. Correspondence is by email or WhatsApp; the latest draft appears in the dashboard.
13. Admin/legal expert submits to ADJD and updates the shared application status.
14. Admin marks registration complete. The registered Will is delivered outside OWA’s portal.

Court-fee collection occurs **before** admin verification. Payment must never be labelled as verification, submission or registration completion.

## 3. Screens before initial payment

### Screen 01 — Service and package selection

Show “Individual Will” and “Wills for Couples.” The couples option produces two separate Wills and can be completed by one person. Show the pricing table above, an illustrative sample document, included admin verification, submission by OWA’s legal expert, and the distinction between draft preparation and court registration.

Primary action: **Start my Will**.

Do not promise immediate manual verification or immediate court registration. Automated draft generation follows completion of all required data and uploads; admin verification takes 2–3 working days after court-fee payment.

### Screen 02 — Short suitability questionnaire

Collect only what is needed to establish the intended route and package. Do not collect passport numbers or identity uploads before initial payment.

| Question | Input and behaviour |
|---|---|
| Who are you preparing Wills for? | Individual / couple. |
| Are you aged 21 or over? | Required yes/no; for a couple, confirm for each testator. Full DOB is captured after payment and rechecked. |
| Are you an expatriate/non-UAE national? | Required scope question. Nationality is later extracted from identity documents. Cases outside the agreed expat scope need team handling. |
| Do you have assets in the UAE? | Required declaration for each testator. No ownership upload. |
| Where do you currently live? | UAE / another country; capture country if abroad. Neither answer alone prevents continuation. |
| Religion | Muslim / non-Muslim, for template routing and later review; both are within the owner’s intended scope. |
| Do you have children under 18? | Yes/no for each testator; this determines the guardianship branch. |

**Implementation rule:** under-21 or no-UAE-assets answers do not lead to the standard payment route. Explain the mismatch with OWA’s stated service scope and offer contact with the team. Do not claim that such customers are legally prohibited from making a Will.

Do not describe a positive questionnaire result as court acceptance. Applicable template wording and route must be approved for both religious groups before that automated route goes live.

### Screen 03 — Personalised order summary

Show the selected package, number of Wills, the relevant children/guardianship branch, bilingual deliverable, document and information stages, manual verification, and submission support. Show AED payable now, AED payable later, combined total and refund terms together.

Primary action: **Continue to payment**.

### Screen 04 — OWA checkout

Collect payer/account-holder name, email and phone with country code. These contact details are separate from legal identity details later extracted from documents. Show package, payable amount, separate later court fee and an unticked acknowledgement of the displayed service terms/refund policy.

On confirmed payment success, create or activate the paid application and open the dashboard without a separate password-registration form. Send a receipt/confirmation and instructions for email OTP return access.

**Implementation rule:** a checkout email is not, by itself, proof of control of an existing account. Never expose another application simply because the payer enters its email. Verify email ownership before linking to an existing account or granting future access. A new application may open in the securely bound checkout session; email verification is required for persistent account access to sensitive records.

Failed or cancelled payment preserves the short questionnaire and does not unlock paid preparation. Returning customers with a paid application can resume without paying again.

## 4. Screens after initial payment

### Screen 05 — Application dashboard

Show package, payment stages, current progress, next action and save status. For a couple, show two Will questionnaires/drafts under **one shared application status**. Each questionnaire can be saved unfinished, but both must be complete before either draft is generated or the combined court-fee checkout unlocks.

Suggested progress sections: Personal details; Beneficiaries; Executors; Children and guardians if applicable; Draft review; Court-fee payment; Admin verification; Submission and registration.

No shared-view links or separate partner accounts/approvals are required. The account holder may show the drafts to their partner. Record who confirmed the drafts; do not label an unrecorded partner action as personal approval.

### Screen 06 — Testator identity and documents

For every testator, collect these fields, preferably through extraction:

| Field | Source / rule | Template destination |
|---|---|---|
| Full legal name in English | Passport/extracted record; manual fallback if unreadable | Opening, attestation and any other relevant appearances |
| Arabic name | Use Arabic on the identity document when available; otherwise AI transliteration for admin verification | Matching Arabic fields |
| Nationality | Extract; manual fallback | Opening |
| Date of birth | Extract; manual fallback; validate 21+ | Opening |
| Passport number | Extract; required | Opening and attestation |
| Emirates ID | UAE residents, if applicable; no invented value where absent | Corresponding identity fields |
| Current residence country | Customer entry | Address and residence review |
| Full current address | Customer entry; street/building, unit where applicable, city, country; region/postcode where relevant | Opening address |
| Country of domicile | Separate customer question, as requested by the template | Execution and attestation |
| Contact email and phone | Account/contact data; allow distinction from legal identity | Operations, not automatically inserted into clauses |

Do not infer domicile from nationality or current address. Customer-facing explanatory text for domicile remains a legal/content review item.

**Identity uploads for every named person:** UAE residents upload a passport and Emirates ID if applicable; non-residents upload a passport. Reuse the same profile and attachments whenever that person is selected for another role. Do not require repeated uploads for the same person.

AI extracts, autofills and checks against documents. There is **no separate customer confirmation screen for extracted identity data**. If extraction fails, offer a clearer upload or manual entry while retaining the required attached document. Manually entered or uncertain fields are flagged for admin. Customer-entered choices are reviewed and saved by the customer.

AI document flags do not automatically block progression. Missing mandatory documents or required values still prevent generation; a readable/manual value with a review flag can proceed to the draft, payment and subsequent admin review.

### Screen 07 — Address and proof

Require one proof of current address for each testator. Accept a utility bill, bank statement or tenancy agreement. No automatic document-age or tenancy-expiry cut-off was requested. Admin determines whether the evidence supports the current address.

For couples at the same address, offer “Use the same address.” One proof may support both even if it names only one partner, subject to admin review. Different addresses require separate proof. This address-proof requirement applies to testators; it was not extended to every beneficiary, executor or guardian.

Compare the entered address with the uploaded evidence; flag discrepancies or unreadable information for admin rather than treating extraction as proof of authenticity.

For a testator living abroad with UAE assets, collect their actual overseas country/address and flag the template’s UAE-residence statements for admin correction before submission. Do not substitute the UAE property address as the customer’s residential address. Clearly mark the unverified draft while the declaration requires correction.

### Screen 08 — Beneficiaries and estate percentages

Question: **Who should receive your estate, and what percentage should each person receive?**

Add or select **one to five beneficiaries per Will**. Show “Beneficiary 1,” “Beneficiary 2,” etc., without primary/substitute priority. For one beneficiary, set 100%. For multiple beneficiaries, require individually assigned positive percentages totalling exactly 100% before generation. Show a live “Allocated / Remaining” total.

Collect/reuse the person’s identity profile and required uploads. Do not duplicate a person within the same allocation list; edit their existing share instead.

The latest owner decision is simultaneous percentage distribution. Do not implement the superseded one-primary-plus-substitutes journey or add survivorship questions. The source Section Seven must be revised by the legal team to match this structure in both languages. Omission of a questionnaire question must not be mistaken for approval to delete or reinterpret legal fallback provisions.

**Implementation rule:** use fixed-point percentages, not floating-point equality. Proposed precision is up to two decimal places; show an explicit remainder so users can finish at exactly 100%.

### Screen 09 — Executors and trustees

Question: **Who should carry out the instructions in your Will?**

| Slot | Entry requirement | Source appointment structure |
|---|---|---|
| Executor 1 | Required | Initial executor/trustee |
| Executor 2 | Optional | Substitute if the first is unable/unwilling to act or dies before proving the Will |
| Executor 3 | Optional | Further substitute if all previously appointed executors/trustees die before proving the Will |

Maximum three. Preserve the source’s conditions rather than treating all executors as concurrent appointments. Select an existing person or add one; reuse documents across roles. Render only populated appointments with approved wording for omitted optional slots. Sequential UI: offer slot 3 after slot 2, avoiding an unexplained gap.

### Screen 10 — Children and guardian appointments

Display this branch only if the testator has children under 18. Collect each child’s full name, nationality, date of birth, passport number and applicable identity documents using the shared person-profile model. Allow up to **five children per Will**, expanding the source’s three entries through approved repeatable template blocks.

Use DOB to determine the under-18 branch; the beneficiary trust-release age of 21 in the source is a separate provision and must not automatically change.

One set of guardian appointments applies to all listed minor children.

| Slot | Requirement chosen by owner | Appointment condition in source |
|---|---|---|
| Temporary guardian | Mandatory when this branch applies | Appointed upon the testator’s death |
| Permanent guardian | Mandatory when this branch applies | Acts if the temporary guardian predeceases the testator or is unable/unwilling to act |
| Interim guardian | Optional | Acts while the permanent guardian cannot take custody during the interim period |
| Backup interim guardian | Optional; available after an interim guardian is added | Replaces the interim guardian if they predecease the testator or cannot/will not act |

Interim appointments continue until the permanent guardian can take custody. Retain these distinctions and order; do not collapse temporary and interim into one field. The owner set the required/optional rules; the source itself does not explicitly label each field mandatory or optional.

Each selection reuses or creates a person profile and required identity attachments. The source asks nationality, DOB and passport details for these appointments and Emirates ID where shown/applicable. OWA’s collection rule can retain applicable identity details even where the original clause does not display every value.

### Screen 11 — Couple copying and second Will

One person may complete both questionnaires. Shared identity records, children, addresses and documents can be reused. Offer an explicit **Copy selections from the first Will** action for beneficiaries and guardians, followed by review/editing. Executors are selected separately for the second Will.

When the second testator appears as a beneficiary in the first Will, replace that beneficiary with the first testator in the copied second Will and preserve the percentage. Apply the agreed partner swap to guardian selections too. Other copied people and shares remain unchanged unless edited. Show the swaps clearly in the copied summary.

Store roles and shares separately for each Will: changing a share in Will 2 does not change Will 1. Identity corrections to a shared person do update all their appearances. Do not repeat the copy operation automatically on later edits, as that would overwrite independent choices.

**Implementation rule:** flag conflicting/self selections and avoid silently merging duplicate beneficiary shares after a swap. The testator cannot be copied as a beneficiary of their own Will. Validate the copied result before generation.

### Screen 12 — Completion summary and generation

Show all manually selected people, shares, executor order, guardian roles, children and address. Indicate missing required values/uploads. Let customers go back and edit without extra charges. Persist progress throughout.

Block generation for: absent required fields/documents; no beneficiary; more than five beneficiaries; shares not 100%; no first executor; more than three executors; required guardians absent in the minor-children branch; more than five listed children; or incomplete second Will in a couple application.

OCR uncertainty, apparent ID expiry and document disagreements generate admin flags instead of automatic customer blocks. Manual entry is a fallback for unreadable required values, not a waiver of a required upload. A known failure of the chosen scope rule, such as DOB under 21, is separate from an OCR warning and needs team resolution rather than silent acceptance.

After completion, populate the approved template in both languages from the same records, retaining fixed legal clauses except approved variants. No customer-authored legal clauses or special-wishes input is included at launch.

Check the generated output against source data and documents after generation. Detect missing placeholders, inconsistent repeated identity data, wrong person-to-role mapping, English–Arabic differences and incorrect percentages. Mechanical generation failures require regeneration; do not show a broken file as a completed draft. Content/document flags remain visible to admin for manual verification.

### Screen 13 — Draft view and confirmation

Show each complete bilingual draft inside the authenticated dashboard, labelled **Draft — pending admin verification**. Customers can view but have no download, public sharing or recipient-management feature. This UI restriction cannot prevent screenshots or copying.

The account holder confirms the draft(s) and continues to court-fee checkout. One person can confirm both Wills in a couple application; no separate email invitation or partner approval is required. This action is platform confirmation, not formal signing/attestation.

Edits and regeneration are included without additional OWA charges until confirmation and successful court-fee payment are both complete. Any edit after confirmation invalidates that confirmation. Confirm the new version before payment. No drawn signature, electronic signing or court attestation is performed by this screen.

### Screen 14 — Court-fee checkout

Collect AED 950 for an individual or AED 1,900 for the couple’s two Wills through OWA checkout. For couples, both drafts must be generated and confirmed before the combined payment unlocks; no separate court-fee checkout per Will.

After confirmed success: issue payment confirmation, lock customer self-service editing, mark **Awaiting admin verification**, notify admin and display the 2–3 working-day verification timeframe. Preserve a record of the exact draft version(s) associated with confirmation and payment.

If payment fails, preserve progress and allow retry without duplicate collection. If another tab changes a draft, require confirmation of the current version; never charge against a stale confirmation unnoticed.

## 5. Admin workspace and corrections

Admin has a queue of paid applications ready for verification, with one shared status per application. Show package, court-fee payment, submitted data, uploaded documents, draft versions, AI/manual-entry flags and correspondence notes. Admin manually checks **every completed draft**, not just flagged applications.

Required actions:

- Compare identity details, expiry dates, residential evidence, customer choices and both language versions.
- Verify Arabic names from documents or review AI transliterations.
- Correct structured fields directly and regenerate affected drafts.
- Request replacement documents; customers upload these through their dashboard even after general self-service editing is locked.
- Download each draft as Word or PDF.
- Upload a corrected draft edited outside the portal. Publish it as the latest dashboard version and notify the customer by email.
- Retain earlier drafts and a record of admin edits, flag resolutions, timestamps and responsible admin.
- Coordinate clarification/confirmation and submission timing through email or WhatsApp. There is no mandatory additional dashboard approval after corrections.
- Submit through the legal expert and manually update submission/registration status.

**Implementation rules:** do not record silence or an admin upload as fresh customer approval. Keep any actual email/WhatsApp confirmation references distinct from the earlier dashboard confirmation. Do not allow automatic regeneration to overwrite an externally corrected version. Require deliberate admin replacement and preserve history. Updated identity records and externally corrected documents can diverge; show the authoritative current draft and warn before regeneration.

Proposed upload support: DOCX converted to a read-only dashboard preview/PDF, plus PDF upload. Track Word and PDF derivatives by version so downloaded formats never silently represent different drafts. Conversion failures preserve the previous published draft and alert admin. These formats are implementation defaults, not separately confirmed requirements.

Unresolved issues must be addressed before admin submits. Court-fee payment alone never clears flags. Admin may record exceptions with a reason instead of pretending the original AI reading was verified.

## 6. Shared status and payment records

| Application status | Meaning / transition |
|---|---|
| In progress | OWA fee paid; questionnaires or uploads incomplete |
| Draft ready | Draft(s) generated; customer can review and confirm |
| Court fee pending | Draft(s) confirmed; court-fee payment outstanding |
| Awaiting admin verification | Court fee collected; manual verification outstanding |
| Action required | Admin has requested documents or clarification |
| Under admin review | Verification/corrections in progress |
| Ready for submission | Admin has resolved review and coordinated required confirmation outside the portal |
| Submitted to ADJD | Admin records actual submission |
| Registration completed | Admin records completion; final Will delivered separately |

These operational labels implement the agreed journey. Couple applications have no customer-facing per-Will statuses. “Submitted to ADJD” means both have been submitted; “Registration completed” means both have completed registration. Admin handles differences in progress outside the customer status display and may keep internal notes/evidence.

Keep financial states separate: OWA fee pending/paid; court fee pending/collected; court fee paid to ADJD. Retain transaction references and timestamps. Do not conflate receipt by OWA with remittance to ADJD. No registered-Will upload/download feature is required in the customer portal.

## 7. Notifications and reminders

| Trigger | Recipient | Content / behaviour |
|---|---|---|
| Email OTP requested | Account email | Time-limited sign-in code; no password |
| OWA payment succeeds | Customer | Receipt, package, remaining court fee and resume instructions |
| Paid application incomplete after three days of inactivity | Customer | One reminder to complete details/uploads |
| Generated draft remains unpaid for court fees after three days | Customer | Reminder to review/continue and pay; stop once paid |
| Court-fee payment succeeds | Customer and admin | Receipt to customer; verification queue notification to admin |
| Admin changes application status | Customer | New status and dashboard link |
| Admin publishes a revised draft | Customer | Draft updated; dashboard link, no Will attachment |
| Replacement documents requested | Customer | Dashboard upload instructions; team can also communicate through WhatsApp |

The three-day rule is agreed. **Implementation default:** send at most one reminder per relevant stage, do not start an indefinite recurring sequence, suppress reminders while admin/court action is pending, and deduplicate concurrent reminders. Exact scheduling/reset semantics were not separately decided. WhatsApp communication is manual at launch unless a later integration is approved; no automated WhatsApp feature was agreed.

## 8. Data model and validation essentials

Proposed records:

| Record | Key contents |
|---|---|
| Account | Verified email, phone, OTP access and sessions |
| Application | Package, owner, shared status, prices and payment references |
| Will | Testator, address, domicile, language output, completion and version references |
| Person | English/Arabic names, DOB, nationality, passport/EID fields and residence classification |
| Role assignment | Will, person, beneficiary share or executor/guardian slot |
| Upload | Application/person association, purpose, document type, extraction and version |
| Review flag | Affected field/document, source values, reason, admin resolution |
| Draft version | Input snapshot, template version, generated/uploaded origin, Word/PDF/preview, current version |
| Confirmation | Account actor, timestamp and confirmed draft version(s) |
| Audit event | Admin/customer action, changed data, time and relevant versions |
| Notification | Trigger, stage, recipient, send result and deduplication key |

Shared person records are scoped to the application/account, not a globally searchable identity directory. Beneficiary, executor and guardian assignments refer to people, so one upload set can support several roles. Amounts use AED minor units; percentage sums use fixed-point arithmetic. Preserve Unicode and Arabic directionality, identifiers as strings and unambiguous dates. Never infer user choices from a passport.

Use secure account-based authorisation for draft previews, documents, exports and uploads, including backend endpoints. Customer view-only access is an access-control rule, not just a hidden button. Protect admin access, audit modifications, limit OTP attempts/resends and expire codes. Avoid logging full identity documents or codes. File types, size limits, storage region and retention/deletion policy remain implementation/privacy decisions to settle; do not assume “application has no deadline” means unlimited retention of every sensitive upload is approved.

Use verified payment callbacks as the payment source of truth, with duplicate-event protection and server-controlled amounts. Redirects alone must not unlock the application. Preserve all answers across back navigation, failed payments and resumptions. Preview or upload failures must not cause double payment or loss of an earlier draft.

## 9. Template mapping and unresolved wording

| Source section | Population / treatment |
|---|---|
| Opening identity | Testator person record; actual current address; avoid hard-coded UAE suffix for an overseas address |
| One — Declaration | Preserve fixed clause except approved changes; source says “over … twenty-one,” while OWA’s rule is 21 or older. Confirm inclusive wording. |
| Two — Executors and trustees | 1 required + up to 2 optional, preserving appointment conditions |
| Three — Debts and funeral expenses | Fixed clause |
| Four — Letter of wishes | Fixed clause; no customer special-wishes field |
| Five — Jurisdiction | Fixed clause |
| Six — Insurance proceeds | Fixed clause; existing nomination wording remains for legal review alongside any revised distribution clause |
| Seven — Distribution | Approved exception: 1–5 beneficiaries with chosen percentages totalling 100%; both language versions must support this |
| Eight — Trustee powers | Fixed clause |
| Nine — Guardianship | Conditional branch, four appointment slots and up to five children; omit unused optional appointment blocks coherently |
| Execution and attestation | Domicile and repeated testator identity; non-resident residence wording flagged for correction; no simulated customer signature |

The source Section Seven currently includes a sole first beneficiary, conditional substitute shares, a descendant fallback for one substitute, a 21-year trust provision and proportional redistribution of otherwise undisposed shares. The revised model cannot safely be implemented just by repeating the original substitute rows. Legal reviewers must settle the entire affected English–Arabic clause, retaining or revising each dependency deliberately. The user has removed survivorship choices from the questionnaire; the legal fallback outcome remains unresolved.

The source Section Nine uses an unusual temporary-then-conditional-permanent sequence. Preserve the read wording until approved changes are supplied, rather than assigning common meanings to labels. The under-18 interface rule and the source’s “age of full capacity” language need alignment; do not conflate either with the 21-year beneficiary trust clause.

**Before production:** obtain approved bilingual variants for distribution, non-resident declarations, applicable customer scope, optional appointment omissions and repeatable child/beneficiary blocks. Admin correction is agreed for non-resident cases, but no draft should be presented as verified while it contains an unresolved inaccurate residence statement.

## 10. Open items without reopening confirmed choices

1. Payment provider and collection/remittance reconciliation procedure.
2. Approved English–Arabic legal wording and suitability across the intended religious/residency groups.
3. Customer terms, final refund wording and treatment of unused court fees, handled operationally outside the portal.
4. File formats/size limits, OCR provider, hosting/storage, retention/deletion and admin authentication.
5. Production email sender, admin notification recipients and working-day calendar for the review timeframe.
6. Handling out-of-scope cases, such as more than five children/beneficiaries, before taking payment for a route that cannot accommodate them.
7. Confirmation of court-fee amounts before launch and how changes are handled for long-inactive applications; no completion deadline does not by itself fix future court tariffs.
8. Exact OTP/account creation implementation and reminder reset semantics. Recommended technical defaults above are distinguishable from confirmed business decisions.

## 11. Developer acceptance checks

Use fictional identities and documents. These checks establish implementation behaviour, not legal validity.

1. Individual journey charges AED 999 then AED 950; couple journey charges AED 1,799 then AED 1,900. Both stages are disclosed before purchase; repeated callbacks do not duplicate charges or applications.
2. A paid customer signs in via email OTP and resumes without paying again. Entering another existing account’s email at checkout does not expose its data.
3. Non-residents can proceed using overseas addresses and passport-only identity requirements; residence wording is flagged for admin and not labelled verified prematurely.
4. One named person can serve multiple roles without duplicate document uploads; identity corrections propagate while role choices and shares remain per-Will.
5. One beneficiary receives 100%; up to five can split 100%; missing, zero/negative, excessive or non-totalled allocations cannot generate a draft. The generated legal clause matches the approved simultaneous-distribution variant.
6. Executor 1 is required; optional executor rows render with correct conditions and no blank placeholder text.
7. Guardianship appears for the under-18 branch. Temporary and permanent guardians are required; interim and backup are optional and ordered. Five child entries render correctly in both languages.
8. Couple copy swaps partners where agreed, preserves beneficiary share, reuses children/documents and leaves executors separately selectable. Later independent edits are not overwritten by automatic recopying.
9. Either couple questionnaire can save incomplete, but neither draft generation nor combined court checkout unlocks until both Wills are complete.
10. Blurry/expired identity documents trigger flags and manual-entry/reupload options, not automatic rejection. Missing mandatory data/uploads still block generation. Admin sees every flag and reviews every completed draft.
11. Address proof accepts the three agreed document types without an automatic age cut-off; one document can support a couple at the same address.
12. English/Arabic identities, dates, shares and roles remain aligned. No sample names, unfinished placeholders or automatic signatures appear. Test guardian optional branches and maximum-size beneficiary/child lists.
13. Customer confirmation references the current draft version. Edits invalidate it. Successful court-fee payment locks self-service edits but still allows admin-requested replacement uploads.
14. Admin corrections create versions, preserve history and notify customers. Uploaded external corrections cannot be overwritten by background regeneration. Word/PDF exports refer to the correct version.
15. Court-fee payment triggers admin notification and Awaiting admin verification, never Submitted or Registered. Couple status reaches submission/completion only when both Wills have reached that milestone.
16. Three-day reminders are deduplicated, stop after the relevant completion/payment and do not chase customers waiting for admin/court action.
17. Customer access has no sharing or download feature; backend access is restricted to the application owner/authorised admin. Registered-Will delivery remains outside the portal.

## Delivery boundary

This handover specifies the platform; it does not build, deploy or modify the original Will template. Implement the screens and data model against these decisions, then connect approved bilingual templates and the selected payment provider. Validate generated drafts with the legal/admin team before production use.

# OWA — revised questionnaire and developer handover

Version 3 | 6 October 2026 | Consolidated requirements and delivery plan

## 1. Purpose and authoritative sources

OWA prepares bilingual English–Arabic Wills from a guided questionnaire and uploaded identity documents. Customers pay the OWA service fee, complete the questionnaire, view and confirm their generated drafts, and pay the court fee through OWA. Admin then verifies documents and drafts, corrects issues, coordinates submission and updates progress.

**Governing layout and clause reference: Will Form (3).pdf.** This replaces ADJD- Non-Muslim Will Template.docx as the source for development. The old temporary-first guardianship arrangement is superseded. The client’s Wills Questionnaire remains an intake reference; its sample personal information must never become application defaults or test data.

This handover replaces versions 1 and 2. Confirmed requirements below consolidate the latest owner instructions. Items labelled implementation defaults are practical developer recommendations, not separately approved business or legal decisions. This document defines the software; it does not certify template suitability, current court rules or legal validity, and it does not constitute a built platform or an approved amended bilingual Will.

## 2. Agreed service and prices

| Requirement | Final specification |
|---|---|
| Packages | Individual Will; Wills for Couples containing two separate Wills |
| Intended customers | Expatriates with UAE assets, including residents and non-residents; intended Muslim and non-Muslim coverage subject to template suitability review |
| Platform age threshold | 21+ for each testator; an OWA business rule |
| Questionnaire | English at launch; simple, predominantly based on the template |
| Generated document | Bilingual English–Arabic, preserving the new template’s visual style and clause structure except specified changes |
| Account | Email OTP; no password |
| Completion deadline | Paid applications remain open indefinitely; autosave and resume |
| Admin verification | Every application, normally within 2–3 working days after court-fee payment; AI only flags |
| Customer draft access | Signed-in viewing; no customer download button, public share link or invitation feature |
| Registered Will | Delivered by court/admin outside the platform; dashboard shows status only |

| Package | Initial OWA service fee | Later court-fee collection | Total disclosed before purchase |
|---|---:|---:|---:|
| Individual | AED 999 | AED 950 | AED 1,949 |
| Couples | AED 1,799 | AED 1,900 | AED 3,699 |

VAT is recorded as not applicable on the owner’s instruction. Court fees are the owner’s specified collection amounts, not independently verified tariffs. Gateway selection is deferred. Both payment stages must be visible before initial purchase. The intended service-fee policy is non-refundable after successful payment, subject to applicable requirements and final terms. Refunds and unusual package changes are handled manually; no automated refund or conversion workflow is specified.

## 3. User flow before and after payment

There are two separate payment milestones: initial OWA service payment, then court-fee payment after draft review. Testator age is 21+; the children/guardianship question is under 18. Marital status does not control whether the children question appears.

### Stage 1 — Before initial payment

Entry: website service page → Start my Will → short form → order summary → checkout.

| Order | Exact field / question | Input and behaviour |
|---|---|---|
| 1 | Your full name | Required text; carry forward into checkout and the questionnaire, subject to later passport verification |
| 2 | Who would you like to prepare a Will for? | Myself / My partner and me; maps to Individual / Couples |
| 3 | Are you aged 21 or above? | Required Yes / No; applies to the testator, not guardianship |
| 4 | Are you a non-UAE national? | Required Yes / No |
| 5 | Do you own any assets in the UAE? | Required Yes / No; no asset inventory or evidence upload here |
| 6 | Are you married? | Required Yes / No; collect context without automatically selecting a package or appointing a spouse |
| 7 | Do you have any children under 18? | Required Yes / No; show regardless of marital status |

For couples, collect answers for each testator with clearly labelled “You” and “Your partner” groups. Use “Is your partner aged 21 or above?”, “Is your partner a non-UAE national?”, “Does your partner own any assets in the UAE?”, “Is your partner married?” and “Does your partner have any children under 18?” Do not assume both have identical children or scope answers. Full partner identity and contact details are collected after payment; no extra pre-payment upload is required.

Implementation default: an answer outside the standard 21+/non-UAE-national/UAE-assets service scope routes to a scope explanation and chatbot/team help before standard checkout. Do not call this a legal eligibility determination. Marriage and children answers do not reject a customer. A married individual can still select an Individual Will. The children answer determines the later form branch.

Primary form action: **Continue to order summary**. Preserve answers on Back. The summary shows package, inclusions, required document checklist, payable now, later court fee and total:

| Package | Pay now | Court fee later | Total |
|---|---:|---:|---:|
| Individual Will | AED 999 | AED 950 | AED 1,949 |
| Wills for Couples | AED 1,799 | AED 1,900 | AED 3,699 |

Checkout reuses full name and collects required email, phone with country code and acceptance of service terms. Button: **Pay AED 999** or **Pay AED 1,799**. No identity documents, beneficiary names, guardian names or addresses are required before this payment. Website chatbot is available; paid ticketing is not.

### Stage 2 — After initial payment, before court payment

| Screen / step | Customer interaction | Platform response / next action |
|---|---|---|
| Payment confirmation | Views receipt and selects **Start questionnaire** | Opens the securely authorised paid dashboard; returning access uses email OTP |
| Your details | Reviews carried-forward name/contact details; uploads passport, applicable Emirates ID and address proof; fills address, domicile and missing extracted fields | OCR autofills and flags uncertainty; saves progress without asking for duplicate entry |
| Children | If the saved answer is Yes, adds up to five children with required details/documents; may correct the earlier answer | Shows the relevant branch; no repeated mandatory Yes/No question |
| Executors | Selects one required executor and up to two substitutes | Reuses an existing person or opens **Add a new person** |
| Guardians | For children under 18, selects Permanent and Substitute Permanent guardians; optionally Temporary Guardian | Applies one set to the listed children; suggests spouse only as a selectable option |
| Beneficiaries | Adds one to five and assigns estate percentages | Shows allocated/remaining shares; requires total 100% |
| Second Will, couples only | Copies agreed details, reviews partner swaps and selects executors separately | Saves both Wills independently while reusing shared identity profiles/documents |
| Review information | Checks summary and follows highlighted missing-field/upload links | Enables **Generate draft** only when required information is complete; both Wills for couples |
| Draft viewer | Views bilingual draft(s); can choose **Edit information** or **Confirm and continue** | Shows Pending admin verification; edits regenerate and invalidate any earlier confirmation |
| Court-fee checkout | Pays AED 950 individual or AED 1,900 couples | Confirms payment, preserves confirmed versions, locks customer questionnaire editing and notifies admin |

Throughout this stage, show progress, **Back**, **Save and continue**, save status and **Submit a support request**. Applications have no completion deadline. Reuse a person’s documents across roles. Required missing documents/fields block generation; AI uncertainty/expiry flags alone do not. A missing passport opens assistance through a ticket, without waiving the requirement.

For couples, both questionnaires must be complete before either draft is generated. One account holder may review/confirm both and pay the combined court fee. No separate partner email approval is required.

### Stage 3 — After court-fee payment

| Step | Customer interaction | Admin / platform action |
|---|---|---|
| Awaiting verification | Views payment confirmation and 2–3 working-day review timeframe | Queues the application and emails admin |
| Manual review | Waits unless further information is requested | Admin checks every Will and its documents; AI only flags |
| Action required, when needed | Opens a ticket, replies and uploads requested replacements | Admin receives notification, resolves issues and corrects the draft |
| Updated draft | Receives email and views the latest version | Admin publishes a corrected version; no compulsory additional dashboard confirmation |
| Submission | Views **Submitted to ADJD** | Admin records actual submission after resolving review and coordinating through tickets/email/WhatsApp |
| Completion | Views **Registration completed** | Admin records actual registration; court/admin delivers the registered Will outside the platform |

General questionnaire editing is locked after successful court payment, but requested uploads, tickets and draft viewing remain available. Customers have no draft download button, public sharing link or registered-Will upload/download feature. Admin can download Word/PDF and upload corrected versions.

Confirmation is a platform review action, not signing or attestation. Payment is not submission or registration. For couples, show one shared application status; Submitted means both submitted and Registration completed means both completed. Do not treat silence as customer approval.

### Failure and return paths

- Failed initial payment: preserve short-form answers and permit retry; do not unlock paid preparation/ticketing until verified success.
- Failed court payment: retain the draft and confirmation if unchanged; retry without another OWA service charge.
- Missing data: link directly to the affected field; preserve completed sections.
- OCR uncertainty: allow manual completion and retain admin flags rather than rejecting automatically.
- Generation error: preserve inputs and allow retry; do not display a broken draft as ready or request another service payment.
- Customer leaves: resume the saved stage through email OTP; use the agreed three-day reminder behaviour.

## 4. WILLS QUESTIONNAIRE

Use six clear sections with progress, autosave, Back/Continue and a visible support action. Avoid turning every field into a separate screen. Required fields and uploads must be identified clearly.

### A. Your details

| Question / field | Requirement and behaviour |
|---|---|
| Full legal name | Required; extract English and available Arabic spelling from identity documents |
| Date of birth | Required; calculate age and check the 21+ platform rule |
| Nationality | Required; extract, otherwise manual entry |
| Passport | Upload compulsory; number and relevant identity/expiry data extracted where possible |
| Emirates ID | UAE residents upload alongside passport where applicable; passport alone for non-residents; missing/applicability exceptions flagged for admin |
| Residential address and country | Compulsory; manually enter actual current address; allow reuse of an existing shared address |
| Country of domicile | Separate required template field; do not infer from nationality or residence |
| Phone with country code | Compulsory for each testator |
| Email | Compulsory for each testator |
| Proof of address | Compulsory for testators only: utility bill, bank statement or tenancy agreement |

For couples, phone numbers must differ; the same email is allowed. One address-proof document can support both at a shared address, even if it names only one partner, subject to admin review. Different addresses require their own supporting proof. No automatic proof-age or tenancy-expiry cut-off is specified.

Use collected address/country information rather than an unnecessary duplicate residence question. Flag overseas addresses and missing Emirates ID for review. Absence of an Emirates ID is a review indicator, not sufficient evidence by itself to establish residence status. Keep the source residence clause initially as instructed; admin must resolve any mismatch before marking the Will verified or submitting it. Never substitute a UAE asset address for a person’s actual residential address.

### B. Children

Reuse the pre-payment answer to **Do you have any children under 18?**, allowing correction. If yes, add up to five children. Collect each child’s name, DOB, nationality, passport details, applicable identity uploads and compulsory address. Allow “Use the testator’s address.” Contact phone/email is optional.

A passport is compulsory for each child. If unavailable, display **Submit a support request**, prefilled with “Child passport assistance” and the application reference. Save progress; opening a ticket does not waive the document requirement or automatically unlock draft generation. Birth certificates are not an agreed passport replacement.

Use DOB for the under-18 branch. The template’s separate beneficiary trust-age clause must not be changed to 18 merely because the guardianship questionnaire uses that threshold.

### C. Executors

Question: **Who should carry out the instructions in your Will?**

| Appointment | Requirement |
|---|---|
| Executor 1 | Compulsory |
| Executor 2 | Optional substitute |
| Executor 3 | Optional further substitute, offered after Executor 2 |

Maximum three, in the preference/conditional order of the template. These are not simultaneous co-executors. Select an existing person or add a profile. Preserve the source’s fallback conditions and omit unused optional blocks coherently.

### D. Guardians

Show when there are children under 18. One set of appointments applies to all listed children.

| Order / label | Requirement | Mapping to the new template |
|---|---|---|
| 1. Permanent Guardian | Compulsory | Page 6 appointment: “to act as permanent guardian of my child/ren as follows” |
| 1.1 Substitute Permanent Guardian | Compulsory | Page 7 first appointment, following the permanent guardian’s predeceasing / inability / unwillingness condition |
| 2. Temporary Guardian | Optional | Page 7 interim appointment: acts for the interim period while the referenced permanent guardian cannot take custody |

“Temporary” and “Interim” describe the same optional questionnaire role. Do not create separate temporary and interim inputs. Do not include the source’s fourth backup-interim appointment in this selected three-role arrangement.

Suggest the spouse as an option for Permanent Guardian when details are available; do not preselect without customer choice. For the Temporary Guardian, OWA accepts Emirates ID as its business criterion for UAE presence; no additional physical-presence question is requested. This criterion must not be represented as independently proven current physical location.

Guardians require passport plus Emirates ID for UAE residents where applicable; non-residents require passport. Every guardian’s address is compulsory and manually entered or reused; phone/email optional. Fill unreadable/missing extracted identity fields manually.

Preserve the new PDF’s corresponding English and Arabic clauses and conditional references. Remove the unused backup-interim block and its connecting words as one coherent variant. If Temporary Guardian is omitted, omit the whole optional interim section. Do not leave blanks, dangling “then” text or a reference to an absent appointment. The latest user-supplied order supersedes the earlier temporary-first interpretation.

### E. Beneficiaries and estate distribution

Question: **Who should receive your estate, and what percentage should each receive?**

- Add one to five beneficiaries; label them Beneficiary 1, Beneficiary 2, etc.
- One beneficiary receives 100%.
- Multiple beneficiaries receive positive customer-assigned shares totalling exactly 100%.
- Display Allocated and Remaining percentages as customers enter shares.
- All listed beneficiaries belong to the simultaneous distribution arrangement. Do not call later entries substitutes or collect survivorship choices.
- Reuse identity profiles and documents; every beneficiary needs an address, with optional phone/email.

The owner explicitly removes the introductory condition beginning “If the above beneficiary … does not survive me, but in such event only …” from this distribution arrangement. The generated variant must list the selected beneficiaries and their percentages in both languages, expanding the source’s three entries to a maximum of five. The related descendant, trust and proportional-redistribution provisions require a coherent bilingual template review; do not silently change their meaning while editing rows.

### F. Review and generate

Show the entered information, role selections, shares, required uploads and any missing fields. Allow direct navigation back to edit. There is no additional mandatory OCR-extraction confirmation screen.

Block generation for incomplete mandatory data/uploads, invalid shares, missing Executor 1, missing required guardians in the minor-child branch, exceeded limits or an incomplete second Will in a couples application. OCR uncertainty, apparent expiry or document mismatch alone creates a review flag; it does not automatically reject the customer. Mechanical generation failure must never be presented as a completed draft.

Do not add customer-written legal clauses, gifts, funeral instructions, corporate/joint-executor choices, title-deed uploads or a full asset inventory to this launch questionnaire. Fixed template clauses remain fixed except specified approved variants. Use paid support for unusual requests.

## 5. Shared people, uploads and OCR

One person has one identity profile and one set of document versions within the application, reusable as beneficiary, executor, guardian or child. Reusing a person must not require duplicate uploads. Role assignments, shares and appointment order belong to the individual Will; correcting shared identity data updates every affected appearance.

**Universal collection rule:** address is compulsory for everyone. Only testators need proof of address and compulsory phone/email. Non-testator contacts are optional. Passport uploads are compulsory for all named people; UAE residents also provide Emirates ID where applicable. Manual entry fills information that extraction cannot read; it does not replace compulsory uploads.

AI extracts names, identifiers, nationality, DOB and available expiry dates; compares records; and flags uncertainty, expiry and inconsistencies. Use Arabic spelling from documents where available, otherwise transliteration marked for admin verification. Admin manually checks every Will and supporting documents, including records without AI flags. OCR is not proof of authenticity.

Keep historical upload versions and person/document assignments. Do not silently overwrite customer choices or replace another person’s document because names appear similar.

## 6. Couples behaviour

Both Wills must be complete before either draft is generated and before combined court-fee payment. One account holder may enter information and confirm both drafts.

Offer **Copy details from the first Will** for beneficiaries and guardians; reuse children, people, addresses and attachments. Select executors separately for the second Will. When the second testator is a beneficiary in Will 1, replace them with the first testator in the copied Will 2 while preserving their percentage. Apply the agreed spouse substitution to guardian selections where relevant. Show these swaps for review. Never make someone a beneficiary of their own Will.

After copying, role choices and percentages can be edited independently. Do not repeatedly recopy and overwrite changes. Shared identity corrections still propagate. Use one customer-facing application status, with internal notes if the two court processes differ.

## 7. Draft versions, confirmation and admin

Customer editing and regeneration are included until draft confirmation and successful court payment are both complete. Editing a confirmed draft invalidates its confirmation; require confirmation of the current version before court payment. Store the exact version(s), actor and timestamp associated with confirmation/payment.

After court payment, admin can edit structured data and regenerate, download DOCX/PDF, or upload an externally corrected draft. Customers can still reply to tickets and upload requested replacement documents from the dashboard. Admin publishes the latest version and the customer receives an email. No compulsory additional dashboard reconfirmation or extra correction payment is required.

Admin and customer coordinate any required response and submission timing through tickets, email or WhatsApp. The system must not interpret silence or an admin upload as customer approval. Preserve notes/references to actual communications.

External corrections are versioned and cannot be overwritten by background regeneration. DOCX-to-preview/PDF conversion is an implementation default; a PDF-only upload must not be falsely paired with an old Word file as the same current version. Publish matching derivatives or clearly identify unavailable formats. Failed conversion leaves the previous published version intact.

### Admin workspace

Provide an application queue, payments, all people/documents, AI flags, draft history, tickets and audit history. Admin can request documents, resolve flags with reasons, correct fields, regenerate/upload drafts, record court-fee remittance separately and update application status. Manual verification applies to every application.

| Shared status | Meaning |
|---|---|
| In progress | Initial fee paid; information/uploads incomplete |
| Draft ready | Draft(s) available for customer review |
| Court fee pending | Current drafts confirmed; payment outstanding |
| Awaiting admin verification | Court fee collected; review pending |
| Under admin review | Manual checks/corrections underway |
| Action required | Customer information/documents requested |
| Ready for submission | Admin has resolved review and coordinated submission |
| Submitted to ADJD | Actual submission recorded; both Wills for couples |
| Registration completed | Actual completion recorded; both Wills for couples |

These operational labels implement the agreed journey. No registered-Will upload/download feature is included. Court-only attestation, signatures, officer identity and registration fields are not questionnaire inputs and must not be automatically completed as if an official act occurred.

## 8. Support and notifications

### Before initial payment

Use the website chatbot, to be integrated by the developer after the questionnaire/process is settled. Its knowledge base covers the platform’s public process, packages, documents, payment stages, FAQs and support boundaries. Do not expose customer records or uploaded identity documents in the public knowledge base. Paid dashboard ticketing is unavailable before initial payment.

### After initial payment

Customers can create tickets, reply and attach supporting files within the platform. Admin can create a ticket to request information or replacement documents, reply and resolve it inside the admin workspace. Link every ticket to its application. Missing-passport assistance uses this system, replacing the earlier email-only button proposal.

Implementation default statuses: Open, Awaiting customer and Resolved. Admin receives email for each customer-created ticket and customer reply. Customers receive email when admin creates a ticket or replies. Notifications link to authenticated content; do not attach identity documents to emails.

| Event | Notification |
|---|---|
| OTP request | Time-limited email code |
| Initial payment success | Customer receipt and resume instructions |
| Incomplete paid application inactive for three days | Customer completion reminder |
| Draft awaiting court payment for three days | Customer review/payment reminder |
| Court payment success | Customer receipt and admin verification email |
| Admin status update | Customer status email |
| Revised draft published | Customer email pointing to current dashboard draft |
| Ticket created/replied to | Relevant admin/customer email as above |

Three-day reminders are agreed. Default to one reminder per stage, deduplicate, stop on completion/payment, and suppress reminders while waiting on admin/court. Recurring reminder campaigns are not specified. WhatsApp remains manual; no automated WhatsApp integration is included.

## 9. Template production rules

| Source area | Required treatment |
|---|---|
| Page 1 identity/address | Populate actual identity and residential information; flag conflicts with fixed residence wording for admin |
| Declaration | Preserve; review source’s “over twenty-one” wording against the selected 21+ platform threshold |
| Executors | One required plus two optional ordered appointments; omit unused blocks coherently |
| Fixed debt, wishes, jurisdiction, insurance and trustee clauses | Preserve unless the template reviewer approves a necessary connected change |
| Distribution | One to five simultaneous beneficiaries, 100% total; remove the specified conditional introduction in both languages |
| Children | Expand to five entries, preserving the bilingual layout style |
| Page 6 permanent appointment | Required Permanent Guardian |
| Page 7 first appointment | Required Substitute Permanent Guardian with its preceding condition |
| Page 7 interim appointment | Optional Temporary Guardian; no separate fourth backup role |
| Domicile and repeated identity | Reuse corresponding fields consistently |
| Signatures and court fields | Leave for the actual signing/registration process |

Match the source’s English-left/Arabic-right presentation, hierarchy, spacing and field placement as closely as practical. Expanding three people to five may require continuation space/pages; do not promise an identical page count or shrink text until unreadable. Test long English/Arabic names and addresses, optional omissions and maximum entries. Addresses/contacts collected for operations need not be inserted where the template has no corresponding field.

Before production, review actual rendered bilingual outputs for the approved audience, distribution revision, optional guardianship omissions and non-resident handling. No further general customer question sequence is needed for this: it is template production and review work.

## 10. Technical implementation defaults and safeguards

These defaults support the agreed flow and should be included in the developer’s estimate:

- Records: Account, Application, Will, Person, Role Assignment, Upload Version, Review Flag, Draft Version, Confirmation, Payment, Ticket/Reply, Notification and Audit Event.
- Scope shared people/documents to authorised applications/accounts; never expose a global searchable identity directory.
- Use fixed-point AED values and percentages, with up to two decimal places for allocations. Reject duplicate beneficiary rows; edit the existing share instead.
- Require different Permanent and Substitute Permanent selections to avoid a meaningless fallback; flag conflicting/self appointments for resolution. Do not infer appointment eligibility from an OCR result.
- Keep account ownership secure. Entering an existing email at checkout must not expose that account’s documents. Verify email ownership for persistent access. Couple testator phone numbers being different does not create two accounts.
- Use authenticated, server-authorised access to drafts, uploads, tickets and exports; not merely hidden UI buttons. Admin access needs strong authentication, permissions and audit logging.
- Limit OTP attempts/resends, expire codes, protect sessions and avoid logging identifiers/documents/codes unnecessarily. View-only screens cannot prevent screenshots.
- Payment webhooks, not redirects, determine success. Deduplicate callbacks, retries and receipts; server controls amounts. Preserve saved answers on cancellation, failure or generation error.
- Save input snapshots and template version with each generated draft. Do not show one language or file format from a different revision.
- Recheck stale data/ages on resumed applications and flag documents that have since expired. Explain changed required fields without deleting old answers.
- For cases beyond five children/beneficiaries, surface the limit before purchase where known; use chatbot/team handling before payment or tickets after payment. No automatic expansion or paid upsell is specified.
- Keep court-fee collection distinct from remittance to ADJD. A payment callback cannot mark a Will submitted or registered.

The owner chose to skip automated policies for a beneficiary dying before submission and a couple changing to an individual package. Do not invent workflows for these cases; leave them to admin handling.

## 11. Acceptance checklist

Use fictional data, not the example client’s personal information.

1. Pre-payment form includes full name, package, testator age 21+, non-UAE nationality, UAE assets, marriage and children under 18. The children question appears for either marriage answer; answers carry forward and couples are checked individually. Prices and both stages display correctly; payment retries/webhook duplicates do not create duplicate charges or applications.
2. Initial payment unlocks questionnaire/tickets; court payment is not required to request assistance. Unpaid visitors use chatbot support.
3. OTP access and all backend document/ticket endpoints prevent cross-account access.
4. A shared person selected in several roles reuses documents; corrections propagate; per-Will shares remain independent.
5. Everyone has an address; only testators need proof and mandatory contacts. Couple phones differ; emails can match; shared address proof works.
6. Passports are required, including children. Required missing uploads block generation while the ticket option preserves progress.
7. OCR uncertainty/expiry flags do not reject automatically; manual entry works; all completed applications require admin review.
8. One beneficiary is 100%; two through five share exactly 100%; generated clauses show simultaneous distribution without the removed conditional introduction.
9. One to three executors render in source order, without dangling optional text.
10. Minor-child cases require Permanent plus Substitute Permanent; Temporary is optional. No fourth backup input appears. Test absent/present Temporary and one/five children in both languages.
11. Couple copy swaps partners appropriately, keeps executors separately chosen and does not overwrite later independent edits. Both forms are required before either draft/payment unlocks.
12. Customer confirmation is tied to current versions; changes invalidate it. Court payment locks customer edits but permits requested uploads and support.
13. Admin uploads/corrections preserve history, notify the customer and show the latest version without demanding another dashboard approval.
14. Test long Arabic/English names, long addresses, maximum entries, missing optional fields, page breaks, repeated identities and absence of sample data/unfilled placeholders.
15. No court signatures or registration fields are fabricated; no registered-Will download feature appears.
16. Three-day reminders stop appropriately; ticket notifications reach the right recipients without sensitive attachments.
17. Couples display one status; partial court progress cannot falsely mark both submitted or registered.
18. Failed generation/conversion preserves progress and the last valid version without another service payment.

## 12. What the owner receives and how to proceed

### Available now

This revised handover contains the consolidated business decisions, customer questionnaire, template mapping, admin and ticket workflows, payment rules, notifications, implementation defaults and acceptance checks. It can be given to a developer for an estimate and phased delivery. It is not source code, a clickable prototype or the completed bilingual template engine.

### Delivery sequence

| Phase | Developer / reviewer work | Concrete output for owner to review |
|---|---|---|
| 1. Scope and estimate | Read this handover and new PDF; identify assumptions/dependencies; split build into milestones | Written scope, exclusions, cost, timetable and responsibility list |
| 2. Form and dashboard design | Design simple questionnaire, paid dashboard, draft viewer, tickets and admin queue | Clickable prototype covering individual and couple journeys |
| 3. Template proof | Build field mapping and bilingual repeatable/optional blocks using fictional data; obtain template review | DOCX/PDF samples for simple, five-beneficiary, five-child, couple and optional-guardian cases |
| 4. Core build | Accounts/OTP, initial payment, autosave, shared profiles, uploads/OCR and both questionnaire flows | Working staging platform that saves complete applications |
| 5. Draft/payment/admin build | Generation, version confirmation, court checkout, admin corrections, tickets, notifications and statuses | End-to-end staging journey through registration status |
| 6. Acceptance and launch | Run section 11 checks, review rendered outputs, configure production services and operational access | Accepted release, deployment, admin training and support instructions |
| 7. Chatbot integration | Use final questionnaire/process and public help material as knowledge base; test escalation boundaries | Website chatbot connected to the agreed pre-payment support journey |

Template proof should precede heavy document-generation development so the required layout and conditional blocks are demonstrated early. Chatbot implementation can follow the settled questionnaire in parallel with later build work; it need not delay form design.

### Remaining production inputs—not another long questionnaire

| Input | Owner / responsibility |
|---|---|
| Bilingual template variants and suitability sign-off | Owner’s legal/template reviewer, with rendered developer samples |
| Payment gateway credentials and reconciliation process | Owner and developer; supplied securely |
| Final terms, privacy/retention rules and refund handling | Owner with relevant reviewers |
| Hosting, storage, OCR, document conversion and file limits | Developer recommendation for owner selection |
| Domain, email sender, admin recipients and admin accounts | Owner supplies; developer configures |
| Working-day calendar and notification copy | Owner/admin team validates |
| Current launch pricing/court collections | Owner confirms before checkout goes live |
| Logo/brand assets and public help content | Owner provides or approves |

Proceed to developer scoping and a clickable prototype using this baseline. Resolve production inputs alongside implementation; do not reopen settled form decisions unless the template proof or an acceptance test exposes a specific conflict.

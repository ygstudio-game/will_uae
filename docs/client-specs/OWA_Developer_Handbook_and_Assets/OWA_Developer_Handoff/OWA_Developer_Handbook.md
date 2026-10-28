# OWA developer handbook

Handoff edition · 28 October 2026

This handbook accompanies the current prepayment and full-journey HTML prototypes. It consolidates the latest product decisions and identifies implementation gaps. It supersedes conflicting payment, OTP, screen-order and theme instructions in earlier handovers. It is a software specification, not approval of legal wording or verification of current court tariffs.

## 1. Start here

Open `prototypes/OWA_PrePayment_Review.html` to review the four-step purchase flow. Open `prototypes/OWA_Full_Journey_User_Test.html` to test the complete customer and admin journey. Both are standalone browser prototypes with embedded assets and no build step. Use fictional information only. Demo OTP is `123456`; payments, extraction and account access are simulated.

For local development, run `python3 -m http.server 8080` from the extracted handoff directory and open `http://localhost:8080/prototypes/OWA_Full_Journey_User_Test.html`. This serves files locally; it does not add backend capabilities. Different files/origins may use different saved test state. Use the test controls to reset a scenario.

`source/prepayment` and `source/full-journey` contain the same HTML split into `index.html`, `styles.css` and `app.js` for inspection. The split files retain the original CSS cascade and function order. They are not a production component library. Do not copy old generation scripts over these files: those scripts predate the latest screen changes.

Precedence: latest owner decisions recorded here → current prototype interactions → older notes. Where the handbook explicitly marks a production gap, resolve it before release rather than treating the demo as the business rule.

## 2. Non-negotiable product decisions

| Area | Required behavior |
|---|---|
| Entry | Existing website CTA opens package and scope questions. No duplicate landing page; no price on the first screen. |
| Packages | Individual Will: one Will. Wills for Couples: two separate Wills, not automatically identical distributions. |
| OWA charge | AED 999 individual; AED 1,799 couples. Charge only this service fee through OWA. |
| Court fee disclosure | AED 950 per Will; AED 1,900 for two. Paid directly to ADJD later; never an OWA checkout line item. These are owner-specified amounts pending release-time verification. |
| Checkout display | Show payable now. Do not display combined service-plus-court totals. Court note is a plain sentence, outside the review summary card. |
| Verification | Answer questions and pay first. Verify email after payment before protected questionnaire access. Returning access uses email OTP. |
| Documents before payment | None. Collect only short intake and contact details. |
| Paid support | Tickets unlock after verified OWA payment; admin can initiate a ticket. Prepayment help is the website chatbot. |
| Saved applications | Paid applications remain open indefinitely; save and resume. Reminders after three days of inactivity; repeat cadence still needs confirmation. |
| Draft access | Signed-in viewing. No customer download or public sharing feature. Admin can export Word/PDF and upload corrected drafts. |
| Registered Will | Sent separately by court/admin. Dashboard shows status; no registered-Will download feature. |
| Couples status | One shared customer-facing application status. Internally track both Wills to prevent premature completion. |

The previous “View template reference” disclosure and boxed “AFTER PAYMENT” panel have been removed from the review screen. Do not restore them. The sample bilingual Will interaction remains.

## 3. Screen and interaction map

| Screen | Inputs and interactions | Continue condition / destination |
|---|---|---|
| 1. Choose your Will | Entire Individual/Couples card is selectable; image and text are part of the same button. For each testator: age 21+, non-UAE national, UAE assets; Yes/No with no assumed answer. | Complete scope answers. A No routes to team help before standard checkout, without declaring legal ineligibility. |
| 2. About you | Account-holder full name; married Yes/No; children under 18 Yes/No. For couples, separate partner marriage/children answers. | All required answers. Children question appears regardless of marriage. Partner full identity comes later. |
| 3. Review | Package/name, interactive inclusions: guided questions, bilingual draft, in-app support, ADJD submission. Sample viewer; email; international phone; editable package/details; FAQ. | Valid contacts and prior intake. “Continue to payment” opens a distinct payment screen, with no OTP gate. |
| 4. Payment | Order summary, OWA fee, separate court note, contact edit, provider payment interface, unticked terms acceptance, policy links, primary Pay button. | Verified provider success in production. Prototype button simulates payment only. |
| Processing / error | Pending prevents duplicate submissions. Decline returns to Payment with entered answers preserved. Retry is explicit. | Reconcile unknown results before allowing another attempt. |
| Success | Confirm OWA amount and reference; primary action toward questionnaire. | Email ownership verification before account data is shown. Payment alone does not prove ownership of the typed email. |
| Dashboard | Progress, next action, latest draft, court guidance and ticket entry. | Resume correct saved stage; never re-charge an already-paid application. |
| A–F questionnaire | Details → Children → Executors → Guardians → Beneficiaries → Review/draft. | Validate required fields/uploads; link errors to the relevant section. |
| Customer draft review | Generate current bilingual drafts, review and confirm submission to OWA review. | Couples: both questionnaires complete before draft generation; one account holder can confirm both. |
| Admin review | Review documents/flags; request replacements; publish corrected version; update status. | Enforce permission and transition checks on the server. |
| Court and completion | Official payment guidance; admin records payment/submission/registration milestones. | No OWA court checkout. Completion requires actual court/admin confirmation. |

Back, package changes, preview dialogs and help must preserve answers. Clear success/error text must accompany color indicators. Payment success, customer confirmation, admin review, court submission and registration are separate events.

## 4. Design system and assets

The latest reference is the violet, teal and sea-glass healthcare UI supplied by the owner. Use its palette, soft satin-like texture and rounded grid treatment, while keeping the OWA content and flow. Do not reproduce the reference's health statistics or interface.

| Element | Current treatment |
|---|---|
| Header | Deep plum `#21152F`, white OWA wordmark and descriptor. |
| Individual card | Violet gradient: `#4F2489`, `#3E0D86`, `#7351B2`; soft highlight `#B29ADD`. |
| Couples card | Teal gradient: `#147E95`, `#00607A`, `#2E9D9F`; soft highlight `#83C5D2`. |
| Supporting panel | Green `#2D8978`, `#005E53`, `#319F88`; selected indicator `#D1F5DC`. |
| Body | White readable form surfaces; dark ink `#241B35`; pale lavender accents. |
| Primary action | Keep the existing OWA red CTA from the extracted stylesheet. Do not turn every element into a gradient. |
| Radius | Package cards 21px; general cards 16px; checkout 20px; controls around 10–12px. |
| Type | Inter for interface text; Playfair Display for editorial headings where already used; Georgia-style serif OWA wordmark. Package titles currently use Arial. Preserve current appearance before any typography consolidation. |

`assets/css/satin-theme.css` is the exact latest theme override. `source/*/styles.css` is the authoritative complete cascade, including previous layout and responsive fixes. `assets/css/design-tokens.css` is a documented starter token layer, not a drop-in substitute for that cascade.

The texture is made with layered CSS radial and linear gradients. No separate texture image is required. Copy the exact gradient declarations for fidelity. Avoid animated texture behind form text.

People assets: `assets/people/individual.jpg` and `couples.jpg`. Use as illustrative stock photography, never as customer testimonials or team portraits. Portraits are right-aligned within package cards, use `object-fit: cover`, reserved width/height, and the supplied crop positions. Existing prototypes embed these files; the extracted copies are for a production asset pipeline. Keep photos out of payment fields and sensitive legal content.

`assets/brand/owa-wordmark-current.svg` and `header-component.html` reproduce the current text-based header mark. The SVG uses a font-dependent serif text wordmark; it is not an approved outlined brand master. The older bold logo is deliberately excluded because it does not match the latest header. Obtain a final outlined master if required for print or exact cross-platform branding.

Embedded font files are extracted to `assets/fonts/` with their current CSS. Preserve license metadata and resolve the standalone license notices before redistributing a production font package. See `ASSET_REGISTER.md` for provenance and limitations.

Responsive implementation: preserve two-column desktop layouts and single-column mobile flow; use the supplied media queries, not fixed screenshot dimensions. The sticky mobile payment dock must reserve bottom space, respect safe areas and never cover fields, consent or court-fee text. It must scroll/focus the terms control when consent is missing, not bypass it. Test at 320, 360, 390, 768, 1024 and 1440 CSS pixels and with text zoom.

## 5. Questionnaire and shared people

Store each person once per authorized application, with documents referenced by roles. Reusing someone as beneficiary, executor or guardian must not request duplicate documents. Correcting a profile invalidates every affected generated draft. Do not expose profiles across unrelated customers.

| Person/section | Required information and behavior |
|---|---|
| Testator | Legal name, DOB, nationality, passport number/upload, actual residential address/country, email, phone, address proof; Emirates ID number/upload for UAE residents where applicable. Template mapping also requires country of domicile: add/confirm this because the current profile validator does not enforce it. |
| Other named people | Name, DOB, nationality, passport number/upload, compulsory address/country; applicable Emirates ID. Phone and email optional. |
| Proof of address | Testators only. Utility bill, bank statement or tenancy agreement. Shared address proof can support both partners, subject to admin review; do not require it from other people. |
| Children | Up to five; under 18 branch determined by DOB. Passport required; missing documents open support assistance rather than silently waiving the rule. |
| Executors | First required; second and third optional ordered substitutes. No duplicate person within the ordered appointments; no self-appointment. |
| Guardians | For children under 18: Permanent required; Substitute Permanent required; Temporary optional. Temporary and Interim are the same role. One set applies to all children. |
| Guardian selection | Suggest spouse as an option, never auto-appoint. Owner accepts Emirates ID as the temporary guardian's UAE-presence criterion; implement as an OWA rule, not proof of current physical location. |
| Couples | Different testator phone numbers, same email allowed. Copy children, beneficiaries and guardians on explicit request, swapping partner-beneficiary to the other testator. Executors remain separately selected. Show a replacement warning before copying. |

OCR pre-fills; customer completes missing/unreadable fields. Admin manually reviews every application. Expiry/low-confidence flags are review signals, not automatic rejection decisions. Keep source values, extraction confidence and subsequent edits auditable. Missing Emirates ID/non-resident and overseas-address mismatches need admin handling; do not silently insert a UAE property address as residence.

## 6. Beneficiaries: current agreed model

Use **one to three primary beneficiaries**, plus **one shared fallback group of A alone or A and B**. This replaces the earlier flat list of up to five simultaneous beneficiaries and the intermediate per-primary substitute interpretation.

Primary shares total 100%. One primary receives 100%. A alone receives 100% of the fallback group; A/B shares total 100% independently. The primary and fallback groups are alternatives, not a combined 200% estate allocation.

| Scenario | Intended distribution |
|---|---|
| All primaries survive | Original primary percentages. |
| Some primaries survive | Surviving primaries receive the residue pro rata to their original percentages. A/B do not activate. |
| One primary survives | That primary receives 100%. |
| No primary survives | Shared fallback activates: A 100%, or A/B according to the fallback percentages. |
| Active A fails to survive or take vested interest | Preserve the source clause directing A's share to A's surviving children equally. Do not automatically copy this clause onto B. |

Example: primary shares 50/30/20. If the 50% primary does not survive, the surviving 30/20 shares become 60/40. Formula: original surviving share ÷ sum of surviving original shares × 100. This explains clause behavior; do not change the stored original allocations automatically.

Validate no self-beneficiary, no duplicate appointment within a group, positive permitted precision and an exact 100% total using decimal-safe arithmetic. The existing UI requires the shared fallback group; final bilingual wording must encode the same model. Unresolved cases such as B failing, A having no surviving children and every route failing need template-owner instructions. Do not invent legal outcomes in code.

## 7. Templates, versions and document access

Source references are `Will Form (3).pdf`, Section Seven for distribution, the latest owner guardian order and the supplied questionnaire. Original client identity documents and filled questionnaires are deliberately not included in this developer package.

Generate from a versioned, approved English–Arabic template with stable field identifiers and repeatable blocks. Render Arabic with RTL support and an appropriate approved font. Template field map must cover names, dates, passport numbers, addresses, domicile, roles and allocation percentages. Remove entire unused optional clauses and connecting text coherently; do not leave blanks or dangling references.

The current browser draft is a simulation, not a production court-ready Word/PDF generator. Obtain the final bilingual clause variants and verify layout against the supplied form before release. Do not assume a screenshot or generated sample constitutes legal approval.

Each generated/published version needs an immutable snapshot, template version, creator, timestamp and reason. Changed details mark affected drafts stale. Retain the last customer-confirmed version and subsequent admin-published version separately. Admin corrections coordinated by email/WhatsApp do not force another dashboard approval or payment, per owner instruction; record communication and publish the latest customer-visible version. Do not interpret silence as consent.

Customers view only authorized current drafts. Hiding a download button is a UX restriction, not prevention of screenshots or browser saving. Admin Word/PDF export and corrected PDF upload require real document storage and generation services; the current upload preview is session-only.

## 8. Backend boundaries and suggested data model

This is implementation guidance, not a mandated framework. Use the team's maintained stack; no current library/version recommendation is implied.

| Entity | Minimum responsibility |
|---|---|
| Account / Session | Verified email ownership, OTP challenges, authorized session and recovery. |
| Application | Owner, package, intake, service status, timestamps and revision. |
| Will | Testator reference, child references, ordered executors, guardian appointments and two allocation groups. |
| Person | Reusable identity/contact/address data with version and provenance. |
| Document | Private object key, type, linked people, validation/scan state, extraction status and review flags. |
| DraftVersion | Immutable field snapshot, template version, generated files, publication and confirmation records. |
| ServicePayment | Provider reference, AED minor-unit amount, status and idempotency key. |
| CourtMilestone | External court-payment evidence/reference, reviewer, time and submission/registration records; separate from service payment. |
| Ticket / Message | Application ownership, participants, attachments, status and notifications. |
| AuditEvent | Actor, action, affected entity/version and timestamp, without unnecessary raw sensitive data. |

Suggested service boundaries: intake save; payment intent creation; provider webhook; OTP request/verify; authenticated application read/update; signed document upload; extraction job; draft generation/publication; customer review submission; admin transition; ticket message/attachment. Revalidate all rules server-side. Do not trust localStorage, client role toggles, browser-calculated prices or redirect parameters.

OWA payment: calculate 99900 or 179900 AED minor units server-side from the package. Bind payment to an application and versioned price. Use idempotent intent creation and verified provider callbacks. Pending/unknown is not failed. Deduplicate paid activation, emails and receipt creation. Never charge the court amount through this endpoint. Gateway, tax/invoice presentation and refund text need owner/provider confirmation before live charging.

After payment, email typo/recovery must not expose an account or trigger another charge. Use a secure payment-linked recovery process with support escalation. OTP limits, expiry, resend policy and session lifetimes are production settings still to define. The demo code and role switch must be removed from production.

Private document storage, object-level authorization, server-side file type/size checks, malware scanning, restricted signed viewing URLs and audit access are required implementation controls. Do not use the prototype's localStorage or data URLs for real passports, Emirates IDs or drafts. Define retention/deletion and consent policy with the owner before handling live documents.

## 9. Admin, tickets and direct court payment

Admin queue begins after customer submits the completed drafts for OWA review. This no longer depends on a court payment through OWA. Admin reviews flags and documents, starts/replies to tickets, corrects details and publishes revised drafts. Email notifications go to admin for new tickets and ticket updates; customer notifications and reminders require a real messaging service.

Suggested status path: In progress → Awaiting OWA review → Action required (when needed) → Ready for court → Submitted to ADJD → Registration completed. Treat this as a server-validated state machine, not an unrestricted dropdown. Preserve a history of transitions. A customer action may return an application to review after corrections.

Production gap: the prototype can advance status without fully proving direct court payment and both-Will external completion. Implement explicit evidence/confirmation fields and server guards before release. Resolve the precise order of court submission vs official court-payment instruction with operations; do not invent an ADJD API or payment URL.

The owner selected a 2–3 working-day review timeframe. Its old trigger was court-fee payment through OWA, which was removed. Confirm the new trigger and working-day calendar before displaying an SLA or scheduling overdue alerts.

## 10. QA and release checklist

Functional checks rerun for this handoff: 19 prepayment assertions, 16 full-journey integration assertions, and payment recovery/mobile-consent checks passed. These are Node VM checks with a stubbed DOM. They do not demonstrate visual responsiveness, live gateway behavior, security, accessibility conformance, bilingual layout correctness or increased conversion.

Run from the extracted package root:

```sh
node tests/prepayment.cjs prototypes/OWA_PrePayment_Review.html
node tests/full-journey.cjs prototypes/OWA_Full_Journey_User_Test.html
node tests/payment-recovery.cjs
```

Before release, verify:

- Both package paths, scope No, missing answers, children with unmarried testator, partner-specific answers and Back navigation.
- Correct OWA amount, separate court disclosure, no prepayment OTP, unticked consent and no duplicate charge on reload/retry/callback.
- Payment cancel, decline, pending, authentication challenge, interrupted browser and already-paid return; authenticated ownership after email verification.
- Shared person edits, duplicate identity detection, valid dates, required documents/addresses, different partner phones and shared proof handling.
- Guardian optional omission, child age boundaries, executor order, couples copy/swap and both-Will readiness.
- Primary/fallback totals, pro-rata examples, duplicate/self-selection, rounding and approved bilingual clause variants.
- Keyboard selection, visible focus, modal focus return, field labels, error focus, screen-reader status announcements and sufficient contrast on every gradient.
- At narrow widths and 200% zoom: no overflow, clipped labels, unreadable muted text, sidebar overlap or sticky dock obscuring controls. Reserve image dimensions and verify layout shift in a real browser.
- Actual admin permissions, private draft/document access, upload validation, durable revisions, notification delivery and state transition evidence.
- Remove test controls/code, simulated success, fake extraction and placeholder policies only when their production integrations replace them.

Measure an anonymous funnel: intake started → scope complete → about complete → review → payment initiated → provider-confirmed payment → verified account → questionnaire complete. Keep names, emails, phones, family answers, document content and card data out of analytics. Separate scope exits from payment abandonment. No CRO uplift or “global benchmark” claim has been measured.

## 11. Delivery plan and unresolved inputs

1. Implement the four prepayment screens from the packaged source, preserving content and current responsive behavior; add real browser QA.
2. Integrate gateway, server payment records, postpayment verification and account recovery.
3. Build durable questionnaire/person/document storage, OCR review and autosave concurrency handling.
4. Finalize bilingual field mapping and clause variants; implement Word/PDF generation and draft versioning.
5. Implement ticketing, admin review, direct court-payment evidence and guarded milestones.
6. Complete provider sandbox, role-access, bilingual output and mobile/accessibility acceptance tests before live launch.

Owner/operations inputs still needed: final gateway and supported methods; approved terms/privacy/refund and tax/invoice wording; final bilingual template variants and edge-case instructions; direct court-payment evidence/process and submission sequence; 2–3-day review trigger; repeated reminder cadence; chatbot knowledge base and messaging providers; retention policy; production font license notices and final brand master if required.

These gaps are explicit release items, not reasons to redesign the approved intake or add unnecessary questions before payment.

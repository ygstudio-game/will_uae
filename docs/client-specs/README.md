# Client Specifications & PM Alignment Index

This folder centralizes all external client specifications, questionnaire revisions, handover briefs, and PM decision logs for the **UAE Will Preparation Platform (ADJD Non-Muslim Will)**.

---

## 📋 Document Registry & Version History

| File | Internal Version | Date | Status | Description |
|---|---|---|---|---|
| [`v4_OWA_Beneficiary_Section_Developer_Note.md`](./v4_OWA_Beneficiary_Section_Developer_Note.md) | **Version 4 Clarification** | 08 Oct 2026 | 🟢 **ACTIVE / AUTHORITATIVE** | Confirmed beneficiary distribution rules (1–3 primaries + shared A/B substitute group + A's children fallback). Applies to Section E and Section Seven. |
| [`v4_OWA_Beneficiary_Screens_and_Flow.html`](./v4_OWA_Beneficiary_Screens_and_Flow.html) | **Version 4 Prototype** | 08 Oct 2026 | 🟢 **ACTIVE / AUTHORITATIVE** | Interactive 3-screen reference prototype and developer walkthrough for beneficiary flow. |
| [`v3-OWA_Questionnaire_and_Admin_Specification.md`](./v3-OWA_Questionnaire_and_Admin_Specification.md) | **Version 3** | 06 Oct 2026 | 🟢 **ACTIVE / CORE SPEC** | Core client specification & developer handover. Designates `Will Form (3).pdf` as the governing layout and supersedes previous versions. |
| [`v1-OWA_Questionnaire_and_Admin_Specification.md`](./v1-OWA_Questionnaire_and_Admin_Specification.md) | **Version 1** | 03 Oct 2026 | ⚪ *SUPERSEDED* | Initial client handover specification. Replaced by Version 3. Kept for historical reference. |
| [`QUESTIONS_FOR_PM.md`](./QUESTIONS_FOR_PM.md) | — | 03 Oct 2026 | 🟢 **ACTIVE / RESOLVED** | Formal record of 7 resolved core architectural & legal questions signed off by PM Biswa. |
| [`summary.md`](./summary.md) | — | 03 Oct 2026 | 🟡 *REFERENCE NOTES* | Raw transcript of stakeholder/PM WhatsApp chats and intake instructions. |

---

## 📎 Linked External References (Root Level)

- [`Will Form (3).pdf`](../../Will%20Form%20(3).pdf) — Governing court will template cited in Version 3 specification.
- [`Reference YB WILLS/`](../../Reference%20YB%20WILLS/) — Full UI screenshot references (18 screens) and ADJD source forms.

---

## 🔄 Procedure for Future Version Updates

When new versions or revised specifications are received:
1. **Naming Standard**:
   - Inspect the document header for the official version number (e.g., `Version 4`).
   - Save the file as: `v<VersionNumber>-OWA_Questionnaire_and_Admin_Specification.md` (e.g. `v4-OWA_Questionnaire_and_Admin_Specification.md`).
   - Remove duplicate OS browser download numbering like `(4).md` or `(5).md`.
2. **Registry Update**:
   - Add the new file to the table above.
   - Update the status of the preceding version from 🟢 **ACTIVE** to ⚪ *SUPERSEDED*.
3. **Reference Verification**:
   - Update any active design specs in `docs/superpowers/specs/` or `PROJECT_CONTEXT.md` to reference the latest file path.

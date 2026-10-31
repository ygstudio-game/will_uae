# OWA developer handoff

Open **OWA_Developer_Handbook.html** first. The Markdown copy is editable.

- `prototypes/`: latest standalone prepayment and full-journey HTML, copied without modification.
- `source/`: equivalent HTML/CSS/JS extracted for development. Serve over localhost.
- `assets/`: two people photos, embedded font files/metadata, current wordmark component and theme CSS.
- `ASSET_REGISTER.md`: provenance and production licensing notes.
- `tests/`: runnable Node VM checks; no npm install required.
- `docs/QA_REPORT.md`: current verification scope and limitations.
- `manifest.json`: SHA-256 checksums of packaged files, excluding the manifest itself.

Run `python3 -m http.server 8080` here, then open `http://localhost:8080/prototypes/OWA_Full_Journey_User_Test.html`.

Prototype only: demo OTP 123456, simulated local payment controls/OCR, browser storage and customer/admin test switch. Main checkout links open live Nomod payment pages: Single AED 999 and Mirror/Couples AED 1,799. This preview does not verify those payments or activate real accounts. No local card collection, email delivery, authentication backend or court integration. Do not enter actual identity documents. Do not deploy this as a live payment or document service.

Latest rules: four prepayment screens; no initial landing or first-screen price; no OTP before payment; OWA AED 999/1,799 only; AED 950 court fee per Will paid directly to ADJD later. Old source-generation scripts and conflicting handovers are excluded.

Nomod update: 31 October 2026. See handbook section 12. Run `node tests/nomod-check.cjs prototypes/OWA_PrePayment_Review.html prototypes/OWA_Full_Journey_User_Test.html` for package routing, CTA and no-false-payment checks.

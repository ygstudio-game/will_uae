# Questions for the Project Manager (PM) — STATUS: RESOLVED
## UAE Will Preparation Platform (ADJD Non-Muslim Will)

All architectural and policy questions have been reviewed and confirmed by the Project Manager (see `summary.md`). Below is the resolved record of decisions.

---

### 1. Document Upload & Storage Policy
- **Decision**: **1-Year Retention Policy**
- **Details**: Uploaded identity documents (Passports, Emirates IDs, Utility Bills, Title Deeds) will be securely retained for 1 year, and then automatically purged.

### 2. LLM Document Processing & User Privacy
- **Decision**: **Seamless Server-Side Processing (No Consent Modal Needed)**
- **Details**: Personal document extraction via LLM Vision (Gemini 1.5 Flash / GPT-4o-mini Vision) is handled transparently server-side. No user consent checkbox or intrusive popups required.

### 3. Arabic Name Transliteration Engine
- **Decision**: **Emirates ID extraction + AI Phonetic Transliteration from Passport**
- **Details**:
  - If an **Emirates ID** is uploaded: The official Arabic name printed on the card is read directly.
  - If a **Passport** is uploaded: AI automatically generates the phonetic transliteration into Arabic script.
  - All Arabic names are presented on **Step 15 (Review)** for user inspection and manual fine-tuning before final generation. Never translate names semantically.

### 4. Monetization & Payment Gateways
- **Decision**: **Deferred to Post-Core Phase**
- **Details**: Payment gateway integration (e.g. Stripe/Tabby/Telr in AED) will be linked after the core bilingual workflow, draft generation, and preview have been locked and verified.

### 5. Scope of Court Submission
- **Decision**: **Stops at Generating Court-Ready Bilingual Will (PDF/HTML)**
- **Details**: The web platform generates and renders the official ADJD dual-column court-ready document for download/print. Submission to the Abu Dhabi Civil Family Court is executed manually by the user outside the platform.

### 6. Will Types (Individual vs. Mirror Wills)
- **Decision**: **Support Both Individual Wills and Mirror Wills for Couples**
- **Details**: Data model and wizard support both single individual wills and reciprocal mirror wills for married couples.

### 7. Database Selection
- **Decision**: **Neon Serverless PostgreSQL**
- **Details**: Selected for $0 idle compute cost, enterprise-grade relational integrity for multi-party wills, and native Prisma ORM TypeScript support.

---

### Reference Fixtures & Pending Documents:
- **Reference Questionnaire Fixture**: `Reference YB WILLS/Wills_Questionnaire_ADJD_2026_FILLED_DUMMY.docx.pdf` contains the exact question set and filled sample data used to generate the ADJD template.
- **Specification Status**: `OWA_Questionnaire_and_Admin_Specification.md` is strictly **ON HOLD** (not finalized) and must not be implemented until formally approved.


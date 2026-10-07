# Production & Real-Time Operational Roadmap: UAE Will Preparation Platform
**Document Reference:** `DOCS-PROD-2026-10-07`  
**Governing Court Standard:** Abu Dhabi Judicial Department Civil Family Court (`ADJD-NM0723-07-03`)  
**Scope:** Bridging the gap between the current validated functional demo prototype and an enterprise-grade, real-time, production-ready legal platform.

---

## 1. Executive Gap Analysis: Demo State vs. Real-Time Production

The current application provides 100% of the UI screens, legal bilingual clauses, consolidated 6-section wizard, universal `Person` repository, 9-stage admin pipeline, and end-to-end acceptance testing. However, critical external infrastructure layers are currently simulated or mocked for local development.

Below is the definitive matrix comparing what is currently simulated versus what is required for live customer operation:

| Functional Area | Current Demo/Dev State | Production Real-Time Requirement | Required External Service / Package |
| :--- | :--- | :--- | :--- |
| **Email OTP Authentication** | Generates 6-digit code in Neon DB, logs to terminal (`console.log`), and returns code in JSON response if non-prod. 1-click PM demo bypass button enabled. | Real email delivery with branded ADJD legal styling; SMS fallback for UAE mobile numbers; strict rate limiting (3 requests/min); IP throttling. | **Resend** / **AWS SES** (Email) + **Twilio** (SMS fallback) + **Upstash Redis** (Rate limiting) |
| **Milestone 1 & 2 Payments** | Client clicks "Simulate Payment", backend immediately creates `COMPLETED` payment record with a pseudo reference code (`OWA-INIT-...`, `ADJD-FEE-...`). | Real AED payment capture via UAE payment gateway; Central Bank 3D Secure 2 (3DS2) authentication; webhook listeners with HMAC verification; refund/dispute webhooks; court receipt issuance. | **Stripe UAE** / **Checkout.com** / **Network International** (`@stripe/stripe-js`, `stripe`) |
| **Document Storage (Passports, EIDs)** | Files received via `multipart/form-data` are read in-memory and immediately discarded; file URLs are mocked strings. | Private S3/R2 encrypted object vault (AES-256 / SSE-KMS); Presigned PUT/GET URLs with 15-minute expiration; virus scanning (ClamAV); UAE Data Residency compliance. | **AWS S3 (me-central-1 UAE)** or **Cloudflare R2** (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) |
| **OCR Document Parsing** | Route `/api/ocr` returns hardcoded test fixture matching "Daniel Michael Carter" at 99% confidence. | Real multimodal LLM Vision extraction (Gemini 1.5 Flash / GPT-4o-mini Vision); Machine Readable Zone (MRZ) parser; confidence scoring; image quality pre-check. | **Google Gemini 1.5 Flash Vision** or **OpenAI GPT-4o-mini Vision** (`@google/genai` or `openai`) |
| **Arabic Transliteration** | Uses dictionary lookups and static test mappings; Admin edits manually in place. | High-precision phonetic transliteration engine enforcing strict court phonetic rules (names transliterated sound-by-sound, never translated by meaning). | **Gemini 1.5 Pro / Claude 3.5 Sonnet** Transliteration Microservice + Human Review Stage |
| **Real-Time Updates & Ticketing** | REST polling / manual refetch. When user or admin posts a ticket reply or changes application status, the other party only sees it on page refresh. | Bidirectional WebSocket / Server-Sent Events (SSE) stream. Live typing indicators, instant ticket reply rendering, real-time stage progress updates on customer dashboard. | **Pusher Channels** / **Ably** / **Neon Serverless SSE** / **Supabase Realtime** (`pusher`, `pusher-js`) |
| **Official Court PDF Generation** | Client-side `@media print` CSS rendering of the 8-page bilingual table. | Headless server-side PDF generator producing certified 300-DPI court PDF with metadata, digital signatures, QR verification code, and official court seals. | **Puppeteer Core + @sparticuz/chromium** or **PDFKit / @react-pdf/renderer** |
| **Admin Authorization & Security** | Open admin route with simple UI query params (`?admin=true`) and shared session. | Enterprise Role-Based Access Control (RBAC); MFA-enforced legal staff login; audit log hashing; session revocation on privilege change. | Next.js Middleware + Role-Based JWTs + Staff MFA |

---

## 2. Detailed Technical Breakdown of the 6 Missing Pillars

```
+---------------------------------------------------------------------------------------------------+
|                                 TARGET PRODUCTION ARCHITECTURE                                     |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ Customer Web / Mobile ]                  [ Legal Admin Desk ]                                  |
|         |                                            |                                            |
|         v                                            v                                            |
|  +---------------------------------------------------------------------------------------------+  |
|  |                             Next.js 14 App Router (Vercel / AWS ECS)                        |  |
|  |  +--------------------+  +----------------------+  +--------------------+  +--------------+ |  |
|  |  | /start & /wizard   |  | /dashboard & Tickets |  | /admin Pipeline    |  | API Routes   | |  |
|  |  +--------------------+  +----------------------+  +--------------------+  +--------------+ |  |
|  +---------------------------------------------------------------------------------------------+  |
|        |                  |                    |                    |                   |         |
|        | (Auth)           | (Files)            | (Payments)         | (Realtime)        | (Data)  |
|        v                  v                    v                    v                   v         |
|  +-----------+    +---------------+    +----------------+    +--------------+    +--------------+ |
|  | Resend    |    | AWS S3 UAE    |    | Stripe UAE     |    | Pusher / SSE |    | Neon         | |
|  | Email OTP |    | (me-central-1)|    | 3DS2 AED       |    | Live Events  |    | PostgreSQL   | |
|  | & Twilio  |    | Encrypted     |    | Webhooks       |    | & Messaging  |    | Serverless   | |
|  | SMS       |    | Bucket        |    |                |    |              |    |              | |
|  +-----------+    +---------------+    +----------------+    +--------------+    +--------------+ |
|                           |                                         |                             |
|                           v                                         v                             |
|                  +------------------+                      +------------------+                   |
|                  | Gemini 1.5 Flash |                      | Puppeteer PDF    |                   |
|                  | OCR & Bio-Page   |                      | 300-DPI Court    |                   |
|                  | Transliteration  |                      | Certified Output |                   |
|                  +------------------+                      +------------------+                   |
+---------------------------------------------------------------------------------------------------+
```

---

### Pillar 1: Production Authentication & Transactional OTP Delivery

#### What We Need:
1. **Transactional Email Provider (Resend or AWS SES)**:
   - Configure DNS records (`SPF`, `DKIM`, `DMARC`) on the official domain (e.g., `auth.launchpit.ae` or `wills.ae`).
   - Create branded responsive HTML email template featuring Abu Dhabi Judicial Department Non-Muslim Will branding, security advisory, and 15-minute countdown.
2. **SMS Delivery for UAE Numbers (Twilio / Unifonic)**:
   - UAE expatriates often prefer mobile OTP verification. Integration with Twilio or Unifonic (MENA SMS gateway) using standard UAE Sender ID (`+971`).
3. **Security, Throttling & Rate-Limiting**:
   - Use Upstash Redis or Neon-backed rate limiting:
     - Max 3 OTP requests per 10 minutes per email/IP.
     - Max 5 failed OTP attempts before temporary 30-minute lockout.
   - Remove demo bypass buttons and hide `debugCode` in production builds (`NODE_ENV === "production"`).
4. **Environment Variables**:
   ```env
   RESEND_API_KEY="re_1234567890..."
   EMAIL_FROM="Abu Dhabi Wills <auth@launchpit.ae>"
   TWILIO_ACCOUNT_SID="AC..."
   TWILIO_AUTH_TOKEN="..."
   TWILIO_PHONE_NUMBER="+971..."
   UPSTASH_REDIS_REST_URL="https://...upstash.io"
   UPSTASH_REDIS_REST_TOKEN="..."
   ```

---

### Pillar 2: UAE Payment Processing & Milestone Webhook Reconciliation

#### What We Need:
1. **Payment Service Provider (PSP)**:
   - **Stripe UAE** (or Checkout.com / Network International) registered with a UAE Trade License.
   - Native support for **AED (Dirhams)**, UAE Credit/Debit cards, Apple Pay, and Google Pay.
2. **Two-Stage Milestone Checkout Implementation**:
   - **Milestone 1 (Initial Service Fee - AED 999 or AED 1,799)**:
     - Created via Stripe Checkout or Stripe Elements upon qualification at `/start`.
     - Metadata attached: `applicationId`, `packageType`, `milestone: INITIAL_SERVICE_FEE`.
   - **Milestone 2 (Court Registry Fee - AED 950 or AED 1,900)**:
     - Triggered on `/checkout/court-fee` after the testator confirms Section F.
     - Metadata attached: `applicationId`, `packageType`, `milestone: COURT_FEE`.
3. **3D Secure 2 (3DS2) & UAE Central Bank Compliance**:
   - All UAE card transactions mandate Strong Customer Authentication (SCA / 3DS2 OTP via customer's issuing bank like ENBD, ADCB, FAB).
4. **Asynchronous Webhook Listener (`/api/webhooks/stripe`)**:
   - Signature verification using `stripe.webhooks.constructEvent(body, sig, webhookSecret)`.
   - Idempotent database handling:
     - Check if transaction ID already processed in `Payment` table.
     - Update `Payment.status` to `COMPLETED`.
     - Advance `Application.status` (e.g. from `COURT_FEE_PENDING` to `AWAITING_ADMIN_VERIFICATION`).
     - Log immutable `AuditEvent`.
5. **Environment Variables**:
   ```env
   STRIPE_SECRET_KEY="sk_live_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

---

### Pillar 3: Secure KYC Document Vault & UAE Data Residency

#### What We Need:
1. **Encrypted Private Object Storage**:
   - **AWS S3 in UAE Region (`me-central-1` Abu Dhabi / Dubai)** or Cloudflare R2 with EU/UAE data boundary.
   - Comply with UAE Federal Decree-Law No. 45 of 2021 regarding Personal Data Protection (PDPL).
2. **Direct Browser-to-S3 Presigned Uploads**:
   - Browser requests presigned PUT URL from `/api/documents/upload-url`.
   - Files are uploaded directly from user device to S3, bypassing server memory constraints.
   - Buckets are strictly private (`Block Public Access: ON`).
3. **Presigned Read Access for Admin & OCR**:
   - When Admin or the OCR worker inspects a passport or Emirates ID, backend generates a temporary presigned GET URL valid for 15 minutes only.
4. **Environment Variables**:
   ```env
   AWS_REGION="me-central-1"
   AWS_S3_BUCKET_NAME="uae-wills-private-documents"
   AWS_ACCESS_KEY_ID="AKIA..."
   AWS_SECRET_ACCESS_KEY="..."
   ```

---

### Pillar 4: Real-Time Event Bus & WebSockets (Ticketing & Admin Lifecycle)

#### What We Need:
1. **Real-Time Technology Choice**:
   - **Option A (Managed Serverless - Recommended)**: **Pusher Channels** or **Ably**. Zero infrastructure maintenance, works seamlessly across Vercel and serverless functions.
   - **Option B (Self-Hosted / Edge)**: Server-Sent Events (SSE) via Next.js Route Handlers + Upstash Redis Pub/Sub.
2. **Real-Time Channels & Events**:
   - `private-application-{applicationId}`:
     - `status:changed`: Dashboard updates instantly when admin approves draft, requests action, or submits to ADJD.
   - `private-ticket-{ticketId}`:
     - `message:received`: Instant message rendering on both Customer `/dashboard/support` and Admin `/admin/tickets` without reloads.
     - `status:updated`: Status chip changes in real-time.
   - `admin-queue-channel`:
     - `application:new`: Ding/notification on Admin desk when new customer pays Milestone 1 or Milestone 2.
3. **Environment Variables**:
   ```env
   PUSHER_APP_ID="1234567"
   NEXT_PUBLIC_PUSHER_KEY="abcde12345"
   PUSHER_SECRET="secret12345"
   PUSHER_CLUSTER="eu"
   ```

---

### Pillar 5: Production Multimodal OCR & Arabic Legal Transliteration Engine

#### What We Need:
1. **Production LLM Vision Integration**:
   - Replace `/api/ocr` mock with **Google Gemini 1.5 Flash Vision** (or GPT-4o-mini).
   - High speed (< 2 seconds) and cost-effective (< $0.002 per scan).
   - Vision prompt engineered to parse:
     - Full Legal Name (as formatted on passport MRZ).
     - Passport Number & Country of Issuance.
     - Date of Birth (`YYYY-MM-DD`).
     - Passport Expiration Date (`YYYY-MM-DD`).
     - Emirates ID 15-digit number (`784-YYYY-XXXXXXX-X`).
2. **Phonetic Legal Transliteration Engine**:
   - ADJD Civil Family Court rule: Non-Arabic names must be **phonetically transliterated** into Arabic script (sound-by-sound), **never translated**.
   - Example: *"David Alan Whitfield"* ➔ *"ديفيد ألان ويتفيلد"* (NOT *"داود"*).
   - The engine produces transliterated candidates with a confidence score and flags uncertain pronunciations for manual admin confirmation.
3. **Environment Variables**:
   ```env
   GOOGLE_GEMINI_API_KEY="AIzaSy..."
   # Or:
   OPENAI_API_KEY="sk-proj-..."
   ```

---

### Pillar 6: Certified Court PDF Engine & ADJD Submission Bridge

#### What We Need:
1. **Server-Side Court PDF Engine**:
   - Client printing (`window.print()`) is convenient for previewing, but court submission requires an immutable, byte-exact, official PDF.
   - Headless Chromium microservice (`@sparticuz/chromium` + `puppeteer-core`) or Node PDF renderer that:
     - Renders the exact 8 pages of `ADJD-NM0723-07-03`.
     - Embeds Amiri/Noto calligraphic Arabic fonts directly into the PDF.
     - Generates exact A4 dimensions with official 15mm margins.
     - Adds verification QR code in footer linking to the registry record.
2. **ADJD Court Portal Submission Bridge**:
   - Legal admins in the UAE currently submit attested applications through the **Abu Dhabi Judicial Department e-Services Portal** (`eservices.adjd.gov.ae`).
   - The platform must package:
     1. The final bilingual will PDF.
     2. High-res passport copies of Testator, Executors, and Guardians.
     3. Emirates ID copies.
     4. Proof of UAE assets / Title Deeds.
   - Formatted into a single ZIP bundle or direct ADJD API payload once an API connection is granted.

---

## 3. Production Environment Configuration (`.env.production`)

Below is the complete specification of all required environment variables for the live production environment:

```env
# ==============================================================================
# DATABASE (Neon Serverless PostgreSQL)
# ==============================================================================
DATABASE_URL="postgresql://user:pass@ep-project.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ==============================================================================
# AUTHENTICATION & SESSIONS
# ==============================================================================
NODE_ENV="production"
SESSION_SECRET="generate-a-cryptographically-secure-64-character-string"
NEXT_PUBLIC_APP_URL="https://wills.launchpit.ae"

# ==============================================================================
# EMAIL DELIVERY (Resend / AWS SES)
# ==============================================================================
RESEND_API_KEY="re_live_..."
EMAIL_FROM="ADJD Will Portal <noreply@wills.launchpit.ae>"
LEGAL_ADMIN_EMAIL="legal-team@launchpit.ae"

# ==============================================================================
# SMS DELIVERY (Optional UAE Mobile OTP)
# ==============================================================================
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+971500000000"

# ==============================================================================
# PAYMENT GATEWAY (Stripe UAE)
# ==============================================================================
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ==============================================================================
# DOCUMENT VAULT (AWS S3 UAE Region: me-central-1)
# ==============================================================================
AWS_REGION="me-central-1"
AWS_S3_BUCKET_NAME="uae-wills-court-documents"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."

# ==============================================================================
# REAL-TIME COMMUNICATIONS (Pusher Channels)
# ==============================================================================
PUSHER_APP_ID="1234567"
NEXT_PUBLIC_PUSHER_KEY="abcde12345"
PUSHER_SECRET="secret12345"
PUSHER_CLUSTER="eu"

# ==============================================================================
# AI OCR & TRANSLITERATION (Gemini 1.5 Flash Vision)
# ==============================================================================
GOOGLE_GEMINI_API_KEY="AIzaSy..."

# ==============================================================================
# RATE LIMITING & CACHE (Upstash Redis)
# ==============================================================================
UPSTASH_REDIS_REST_URL="https://...upstash.io"
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## 4. Phased Implementation Roadmap

```mermaid
gantt
    title Production & Real-Time Delivery Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Core Infra
    Production S3 Vault & Presigned URLs        :p1_1, 2026-10-10, 3d
    Resend Transactional Email & OTP Delivery    :p1_2, after p1_1, 2d
    Gemini 1.5 Flash OCR & MRZ Parser           :p1_3, after p1_2, 3d
    section Phase 2: Payments
    Stripe UAE Elements & Apple Pay Setup       :p2_1, after p1_3, 3d
    Milestone 1 & 2 Webhook Reconciliation      :p2_2, after p2_1, 2d
    section Phase 3: Realtime
    Pusher / SSE WebSockets for Ticketing       :p3_1, after p2_2, 3d
    Admin Desk Live Notifications               :p3_2, after p3_1, 2d
    section Phase 4: Court PDF & Hardening
    Headless Chromium 300-DPI PDF Generator     :p4_1, after p3_2, 3d
    RBAC Staff Security & Audit Hardening       :p4_2, after p4_1, 2d
```

### Phase 1: Storage, Live OTP & Real OCR (Week 1)
- Install `@aws-sdk/client-s3` and `@google/genai`.
- Create private S3 bucket in UAE region with AES-256 encryption.
- Hook up Resend API for real 6-digit OTP email delivery with responsive ADJD HTML template.
- Implement real Gemini 1.5 Flash Vision in `/api/ocr` for passport and Emirates ID bio-page parsing.

### Phase 2: Live Payment Gateway & Webhook Integration (Week 2)
- Install `stripe` and `@stripe/stripe-js`.
- Replace simulated payment buttons on `/start` and `/checkout/court-fee` with Stripe Elements (AED card + Apple Pay).
- Implement `/api/webhooks/stripe` to handle `payment_intent.succeeded`.
- Enforce strict server-side locks and audit trail creation upon verified payment receipt.

### Phase 3: Real-Time Ticketing & Admin Stage Sync (Week 3)
- Install `pusher` and `pusher-js`.
- Connect `TicketThreadView` to live Pusher channel for instant message receipt.
- Connect `DashboardContent` and `StatusPipelineController` so customer status chips update the instant an admin acts.

### Phase 4: Certified Court PDF & Production Security Hardening (Week 4)
- Install `@sparticuz/chromium` + `puppeteer-core`.
- Implement `/api/documents/generate-pdf` to output official 300-DPI A4 court PDFs with embedded Arabic calligraphic fonts and verification QR codes.
- Implement admin staff authentication with role-based JWTs and IP restrictions.
- Perform end-to-end security audit and penetration test.

---

## 5. Summary & Action Plan

The platform's business logic, relational schemas, bilingual court formatting, and compliance rules are complete and validated. Turning this into a fully operational, live system requires activating the **6 External Infrastructure Bridges** outlined in this document.

For immediate questions or to begin Phase 1 setup (S3, Resend, or Stripe accounts), consult the Technical Lead or Project Manager.

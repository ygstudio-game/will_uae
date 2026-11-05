# Pre-Payment OTP Email Verification & Hostinger SMTP Guide
**Project:** UAE Will Preparation Platform (Online Wills Advisor)  
**Audience:** Project Manager, Technical Leads, and Developers  
**Target Feature:** Pre-Payment Step 3 (Review) OTP Email Verification & Auto-Login  

---

## 1. Executive Summary

This document explains the architecture, user experience, and technical implementation for introducing **Email OTP (One-Time Password) Verification and Authentication** in **Step 3 (Review & Checkout)** of the pre-payment onboarding flow.

### Key Highlights:
1. **$0 Additional Cost (Hostinger Free Business Email):**  
   Every Hostinger hosting plan includes free business email accounts for your domain (`onlinewillsadvisor.com`). We use Hostinger's built-in **SMTP server** (`smtp.hostinger.com`) to send official verification emails with zero monthly subscription fees (no SendGrid, Resend, or Twilio charges).
2. **Official Sender Reputation:**  
   Emails will come directly from an official domain address, such as `noreply@onlinewillsadvisor.com` or `auth@onlinewillsadvisor.com`, establishing trust and high inbox delivery.
3. **Seamless Pre-Payment Onboarding:**  
   Before users proceed to payment in Step 4, they verify their email with a 6-digit code. Verifying **automatically creates their account and logs them in** (via a secure session cookie). Their draft, package choices, and future payment are linked to their verified account.

---

## 2. Hostinger Email Setup (Guide for Project Manager)

To enable email delivery, the Hostinger account administrator only needs to create an email mailbox in Hostinger hPanel. This takes approximately **2 minutes**.

### Step-by-Step Instructions:
1. Log in to **[Hostinger hPanel](https://hpanel.hostinger.com)**.
2. In the top navigation or sidebar, click **Emails**.
3. Locate **`onlinewillsadvisor.com`** and click **Manage**.
4. Click **Create email account**:
   * **Email address:** `noreply` (resulting in `noreply@onlinewillsadvisor.com`)
   * *(Alternative: `verify@onlinewillsadvisor.com` or `support@onlinewillsadvisor.com`)*
   * **Password:** Enter a strong password (record this securely).
5. Click **Create**.

### Hostinger SMTP Connection Details:
Once created, Hostinger provides the following standard SMTP parameters:

| Setting | Value | Description |
| :--- | :--- | :--- |
| **SMTP Host** | `smtp.hostinger.com` | Hostinger outbound mail server |
| **SMTP Port** | `465` (SSL) or `587` (TLS) | Standard encrypted email ports |
| **Encryption** | `SSL` (for port 465) / `TLS` (for port 587) | Secure transport |
| **SMTP Username** | `noreply@onlinewillsadvisor.com` | Full mailbox email address |
| **SMTP Password** | `[Password created in Step 4]` | Mailbox password |
| **From Name** | `Online Wills Advisor` | Display name in user inbox |

---

## 3. User Experience & Flow in Step 3 (Review & Checkout)

The verification occurs seamlessly within **Step 3 Review (`Step3ReviewCheckout.tsx`)** right under the **"Your Contact Details"** card.

### Visual Journey Diagram:
```text
┌────────────────────────────────────────────────────────────────────────┐
│                          STEP 3 OF 4: REVIEW                           │
│                                                                        │
│  [ Package Inclusions Card ]        [ Order Summary Aside ]           │
│  - Selected: Individual / Couples   - AED 999 / 1,799                  │
│  - 4 Explorer Benefit Tabs          - "Continue to payment" CTA        │
│                                       (Disabled until verified)        │
│                                                                        │
│  [ Your Contact Details Card ]                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Email: user@example.com          Phone: +971 50 123 4567         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [ Email Security & Account Verification Box ]                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🔒 Secure your Will Application                                  │  │
│  │ Click below to send a 6-digit code to user@example.com           │  │
│  │                                                                  │  │
│  │ [ Send 6-Digit Code ]                                            │  │
│  │                                                                  │  │
│  │ (Once clicked)                                                   │  │
│  │ Enter the 6-digit code sent to your inbox:                       │  │
│  │ [ _ _ _ _ _ _ ]    [ Verify & Log In ]     [ Resend in 45s ]     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  (Upon successful verification)                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ✅ Verified: user@example.com · Account authenticated             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ==> "Continue to payment" CTA activates & smoothly transitions to 4   │
└────────────────────────────────────────────────────────────────────────┘
```

### Detailed Steps:
1. **User enters Contact Info:** User reviews their package and enters email & phone number.
2. **One-Click Code Dispatch:** User clicks **"Send 6-digit verification code"**.
   * Calls `POST /api/auth/otp/send`.
   * A clean, branded HTML email is dispatched via Hostinger SMTP within 2 seconds.
3. **6-Digit Input:** An inline input appears with auto-focus and resend countdown (60s timer).
4. **Verification & Auto-Login:** User enters code and clicks **"Verify"**.
   * Calls `POST /api/auth/otp/verify`.
   * The database verifies the code and consumes it.
   * A secure `owa_session` HTTP-only cookie is set in the browser.
5. **Ready for Payment:** The state updates to `isEmailVerified: true`. The primary CTA **"Continue to payment →"** unlocks.
6. **Persistence:** If the user abandons before payment or completes payment later, they are already an authenticated user and can resume anytime.

---

## 4. Technical Architecture

### 4.1 Database Layer (Prisma & Neon PostgreSQL)
The database already has the dedicated models ready:
```prisma
model Account {
  id           String        @id @default(cuid())
  email        String        @unique
  fullName     String
  phoneNumber  String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  applications Application[]
  otps         OtpToken[]
}

model OtpToken {
  id        String   @id @default(cuid())
  accountId String
  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

### 4.2 SMTP Delivery (`nodemailer`)
A dedicated transport service connects to Hostinger:
* **Package:** `nodemailer` + `@types/nodemailer`.
* **Utility File:** `lib/email.ts` creates the pooled connection.
* **Resilience Fallback:** If SMTP credentials are not yet added in development or QA, the service logs the code to the terminal console and returns a debug code so development is never blocked.

### 4.3 Branded HTML Email Template
Sent with editorial luxury aesthetic matching the court will styling:
* **Subject:** `Your Online Wills Advisor Verification Code: [123456]`
* **Styling:** Canvas `#FBF9F5`, Obsidian Navy `#0B1528`, Warm Bronze accents `#A37E44`.
* **Content:**
  * Official Online Wills Advisor header.
  * Prominent 6-digit code in a high-contrast box.
  * Clear security notice (expires in 15 minutes, never share this code).

### 4.4 API Endpoints
1. `POST /api/auth/otp/send`:
   * Receives `{ email: string }`.
   * Finds or creates the `Account`.
   * Generates a secure numeric 6-digit code using `crypto` / `lib/auth-otp.ts`.
   * Stores code in `OtpToken` with 15-minute expiration (deletes older unused codes).
   * Dispatches email via Hostinger SMTP.
2. `POST /api/auth/otp/verify`:
   * Receives `{ email: string, code: string }`.
   * Validates code against `OtpToken`.
   * Deletes the token upon match (one-time use).
   * Creates session token and sets `owa_session` cookie.
   * Returns `{ success: true, user: { id, email, name } }`.

---

## 5. Security & Deliverability Best Practices

| Measure | Implementation |
| :--- | :--- |
| **Code Expiration** | 15 minutes strictly enforced via database query (`expiresAt > now()`). |
| **One-Time Consumption** | Token is immediately deleted upon first successful verification. |
| **Rate Limiting** | Max 1 request per 45 seconds per email, max 5 requests per hour. |
| **Anti-Tampering** | Session is signed and encrypted in an `httpOnly`, `SameSite=Lax`, `Secure` cookie. |
| **No Password Friction** | Passwordless authentication prevents forgotten passwords and credential stuffing. |

---

## 6. Required Environment Variables

When the Hostinger email is created, add these variables in **Vercel Project Settings** & `.env.local`:

```env
# Hostinger Free SMTP Configuration
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="noreply@onlinewillsadvisor.com"
SMTP_PASS="YourHostingerMailboxPassword"
SMTP_FROM="Online Wills Advisor <noreply@onlinewillsadvisor.com>"
```

*(Note: In local development, if these variables are left empty, the application gracefully logs the code in the terminal so testing continues uninterrupted).*

---

## 7. Implementation Roadmap & Timeline

| Phase | Task | Effort | Dependencies |
| :--- | :--- | :--- | :--- |
| **Phase 1** | PM creates `noreply@onlinewillsadvisor.com` in Hostinger hPanel. | 5 mins | Hostinger access |
| **Phase 2** | Install `nodemailer` and create `lib/email.ts` with branded HTML template. | 30 mins | None |
| **Phase 3** | Connect Hostinger SMTP to `POST /api/auth/otp/send`. | 20 mins | Phase 2 |
| **Phase 4** | Add inline OTP verification card & countdown to `Step3ReviewCheckout.tsx`. | 45 mins | Phase 3 |
| **Phase 5** | Add environment variables in Vercel & verify live end-to-end on test email. | 15 mins | Phase 1 & 4 |
| **Total** | **Complete delivery** | **~2 hours** | |

---

## 8. Summary for the Project Manager

1. **Yes, Hostinger email is 100% free** and supported via standard SMTP.
2. **All the PM needs to do** is go to Hostinger hPanel &rarr; Emails &rarr; Create `noreply@onlinewillsadvisor.com` and provide the password.
3. **The platform will automatically send real verification codes**, log users in securely, and guarantee that only verified, legitimate applicants proceed to payment and draft generation.

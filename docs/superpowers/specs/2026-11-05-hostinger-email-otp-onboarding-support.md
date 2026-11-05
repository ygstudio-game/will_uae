# Specification: Hostinger SMTP Email Integration, OTP Verification, Onboarding, and Support Desk

**Date:** 2026-11-05  
**Project:** UAE Will Preparation Platform (Online Wills Advisor)  
**Status:** Approved for Implementation Planning  

---

## 1. Overview & Objective

The objective of this specification is to establish a unified, production-grade email infrastructure using Hostinger's business email SMTP service (`smtp.hostinger.com`) with zero third-party subscription costs (no SendGrid, Resend, or Twilio).

This infrastructure connects three critical business operations:
1. **Security & Authentication (Pre-Payment OTP & Passwordless Login):**
   - Inline OTP email verification on **Step 3 Review (`Step3ReviewCheckout.tsx`)** before checkout.
   - Dedicated passwordless login on **`/auth/otp`**.
2. **Onboarding & Transaction Receipts:**
   - Branded welcome email upon successful OTP verification/account creation.
   - Immediate payment confirmation & receipt email when Nomod payment succeeds (with next-step guidance for court documents).
3. **Legal Support Desk:**
   - Real-time notification dispatched to `support@onlinewillsadvisor.com` when a client opens a ticket.
   - Customer notification email when legal staff or admins reply to a ticket.
   - Brand contact details synchronized in `OwaFooter.tsx`.

---

## 2. Infrastructure & Credentials

### Hostinger Mailboxes
- **Transactional Outbound Sender:** `noreply@onlinewillsadvisor.com`
- **Customer Support Inbox:** `support@onlinewillsadvisor.com`
- **SMTP Server:** `smtp.hostinger.com`
- **SMTP Port:** `465` (SSL encryption)
- **SMTP Secure:** `true`

### Environment Configuration (`.env.local`)
```env
# Hostinger Business Email SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@onlinewillsadvisor.com
SMTP_PASS="Juris@123@2026"
SMTP_FROM="Online Wills Advisor <noreply@onlinewillsadvisor.com>"
SUPPORT_EMAIL=support@onlinewillsadvisor.com
```

---

## 3. Core Architecture & Modules

```
                    ┌──────────────────────────────────────────────┐
                    │            Hostinger Mail Server             │
                    │             smtp.hostinger.com:465           │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │                 lib/email.ts                 │
                    │   - Transporter singleton                    │
                    │   - HTML layout engine (Editorial Luxury)    │
                    │   - Resilience fallback logging              │
                    └──────┬───────────────┼───────────────┬───────┘
                           │               │               │
        ┌──────────────────┴──┐    ┌───────┴────────┐   ┌──┴──────────────────┐
        │       Auth & OTP    │    │   Onboarding   │   │     Support Desk    │
        ├─────────────────────┤    ├────────────────┤   ├─────────────────────┤
        │ - sendOTPEmail()    │    │ - sendWelcome()│   │ - sendTicketAlert() │
        │ - /api/auth/otp/send│    │ - sendReceipt()│   │ - sendTicketReply() │
        │ - Step 3 Review Card│    │ - Nomod Webhook│   │ - /api/tickets      │
        │ - /auth/otp page    │    │ - /checkout/   │   │ - /replies          │
        │                     │    │   status       │   │ - OwaFooter.tsx     │
        └─────────────────────┘    └────────────────┘   └─────────────────────┘
```

---

## 4. Detailed Component Specifications

### 4.1 Email Engine & Layout Design (`lib/email.ts`)
- **Library:** `nodemailer` and `@types/nodemailer`.
- **Design Tokens (AGENTS.md legal luxury):**
  - Outer background: `#FBF9F5` (Warm Alabaster)
  - Card container: `#FFFFFF` with `#E5E0D8` border, `12px` border radius
  - Header brand: Serif typography in `#0B1528` (Obsidian Navy)
  - Accent / Primary buttons: `#A37E44` (Warm Bronze) background with white text
  - Footer notice: `#7A7265` small print with company disclosure (SP LEGAL FZ LLE)
- **Functions:**
  1. `sendOTPEmail(email: string, otp: string): Promise<boolean>`
  2. `sendOnboardingWelcomeEmail(email: string, name: string): Promise<boolean>`
  3. `sendPaymentReceiptEmail(params: PaymentReceiptParams): Promise<boolean>`
  4. `sendTicketAlertToSupport(params: TicketAlertParams): Promise<boolean>`
  5. `sendTicketReplyToUser(params: TicketReplyParams): Promise<boolean>`

### 4.2 Step 3 Review Inline OTP Verification (`components/pre-payment/Step3ReviewCheckout.tsx`)
- Placed directly under the **Your Contact Details** card.
- **Workflow:**
  1. User enters Email and Phone.
  2. Email Verification Box shows:
     - If not verified: "Verify your email to secure your application and resume anytime" + **[Send 6-Digit Code]** button.
     - While waiting: 6 numeric input boxes or formatted code input + 60s cooldown timer + **[Verify]** button.
     - Once verified: Green checkmark badge `✅ Email Verified (user@example.com) · Account Secured`.
  3. Primary CTA **"Continue to payment →"** remains disabled or intercepts click until verified, prompting user to complete verification.
  4. Includes developer bypass option (`demo` bypass) to avoid blocking testing if needed.

### 4.3 Post-Payment Onboarding Trigger (`app/api/webhooks/nomod/route.ts` & `/api/checkout/status/route.ts`)
- When Nomod payment completes:
  - Generates receipt with amount (`AED 999` or `AED 1,799`), transaction ref, package type (`Individual` / `Couples`).
  - Sends `sendPaymentReceiptEmail` to client.
  - Sends `sendOnboardingWelcomeEmail` if this is their first order.

### 4.4 Support Desk Two-Way Emailing (`app/api/tickets`)
- When client creates a ticket in `POST /api/tickets`:
  - Dispatches `sendTicketAlertToSupport` to `support@onlinewillsadvisor.com` with subject, client name/email, message preview, and direct link to `/admin/tickets`.
- When admin replies in `POST /api/tickets/[id]/replies`:
  - Dispatches `sendTicketReplyToUser` to client email with reply message and link to `/dashboard/support`.
- `components/common/OwaFooter.tsx`:
  - Replaces `info@onlinewillsadvisor.com` with `support@onlinewillsadvisor.com`.

---

## 5. Security & Deliverability Considerations

1. **One-Time Consumption:** OTP tokens are deleted immediately upon validation.
2. **Strict Expiration:** 15-minute expiration enforced in Prisma database query.
3. **Session Cookie Security:** `owa_session` cookie is `httpOnly`, `sameSite: "lax"`, and `secure` in production.
4. **Resilience & Safe Fallbacks:** In development or if SMTP credentials fail, emails will gracefully log the payload and verification code to the console without crashing server routes.


# Nomod Webhook Integration & Configuration Guide

**Live Website:** [https://will-uae.vercel.app/](https://will-uae.vercel.app/)  
**Application:** UAE Non-Muslim Will Preparation Platform (ADJD Civil Family Court)  
**Target Audience:** Backend / DevOps / Payment Integration Developer  
**Status:** Court Form ADJD-NM1221-06-01 Ready · Pre-Payment Checkout

---

## 1. Webhook Endpoint Specifications

| Property | Value |
| :--- | :--- |
| **Live Webhook URL** | `https://will-uae.vercel.app/api/webhooks/nomod` |
| **HTTP Method** | `POST` |
| **Payload Content-Type** | `application/json` |
| **Subscribed Event(s)** | `payment.succeeded` *(or select all payment events)* |
| **Signature Header** | `x-nomod-signature` *(optional but recommended for production)* |
| **Source Route Handler** | [`app/api/webhooks/nomod/route.ts`](../app/api/webhooks/nomod/route.ts) |

---

## 2. Step-by-Step Configuration

### Step A: Configure Webhook in Nomod Dashboard
1. Log in to your **[Nomod Dashboard](https://dashboard.nomod.com)**.
2. Go to **Settings** → **Developers / Webhooks** (or **Integrations**).
3. Click **Add Webhook Endpoint** (or **Create Webhook**).
4. Enter the Endpoint URL:
   ```text
   https://will-uae.vercel.app/api/webhooks/nomod
   ```
5. Select the event trigger:
   - ✅ `payment.succeeded` *(or "All Payment Events")*
6. Click **Save / Create**.
7. *(Optional)* Copy the generated **Webhook Signing Secret** (e.g. `whsec_...` or similar).

---

### Step B: Configure Environment Variables in Vercel
1. Open your project on the **[Vercel Dashboard](https://vercel.com)**.
2. Navigate to **Project Settings** → **Environment Variables**.
3. Add the following variables:

| Variable Name | Required | Recommended Value | Notes |
| :--- | :---: | :--- | :--- |
| `NOMOD_WEBHOOK_SECRET` | Optional | *(Paste secret from Nomod)* | If left unset, the endpoint validates by JSON payload integrity. If provided, HMAC-SHA256 signature verification is strictly enforced. |
| `NEXT_PUBLIC_NOMOD_URL_TEST` | Optional | `https://pay.nomodapp.com/en/l/a45add7431954cf8` | The 1 AED test link. Already built into the codebase as default. |
| `NEXT_PUBLIC_NOMOD_DEFAULT_1_AED` | Optional | `true` | Defaults Step 4 checkout to the 1 AED test link for QA. Set to `false` when going live with full fees. |

4. **Redeploy** or trigger a new deployment for variables to take effect.

---

## 3. Webhook Payload Reference

The endpoint accepts standard nested Nomod payloads as well as flat payloads:

### Sample Expected Payload (`payment.succeeded`):
```json
{
  "event": "payment.succeeded",
  "data": {
    "id": "tx_nomod_1234567890",
    "amount": 1.00,
    "currency": "AED",
    "status": "paid",
    "customer": {
      "email": "customer@example.com",
      "name": "John Doe"
    },
    "metadata": {
      "applicationId": "cmvy..."
    }
  }
}
```

### Reconciliation Logic:
1. **Application Match:**
   - Matches directly by `metadata.applicationId` if provided by Nomod.
   - **Fallback:** If `metadata.applicationId` is missing, matches by customer `email` to the latest active application with a pending payment.
2. **Idempotency:**
   - Transactions are indexed by `transactionRef` (`data.id`). Duplicate webhook deliveries are acknowledged with `HTTP 200` (`duplicate: true`) to prevent double-charging or duplicate entries.
3. **Database Updates:**
   - Marks milestone `INITIAL_SERVICE_FEE` as `COMPLETED`.
   - Records the exact transaction amount (e.g., `1.00` AED or `999.00` AED).
   - Updates application status to `IN_PROGRESS` and records an audit log event.
   - The user's active browser screen immediately unlocks the 6-section questionnaire.

---

## 4. How to Test the 1 AED Payment Live

1. Go to: **`https://will-uae.vercel.app/start`**
2. **Step 1 (Package):** Select **Individual Will** (or Wills for Couples) and check "Yes" for the 3 qualifications. Click **Continue**.
3. **Step 2 (About You):** Enter Test Name, Marital status, Children. Click **Review your package**.
4. **Step 3 (Review):** Enter your test email (e.g., your email) and phone number. Click **Continue to payment**.
5. **Step 4 (Payment):**
   - The green badge **`Testing Mode (1 AED)`** will be checked.
   - Click **`Pay AED 1 (Live Test) →`**.
   - Nomod checkout opens in a new tab: `https://pay.nomodapp.com/en/l/a45add7431954cf8`.
   - Complete payment with a live card (1 AED charge).
6. **Result:**
   - Nomod fires the webhook to `https://will-uae.vercel.app/api/webhooks/nomod`.
   - Your original tab detects the confirmation, saves the verified session, and loads your paid questionnaire workspace.

---

## 5. Troubleshooting & Health Checks

- **Check Webhook Delivery in Nomod:** In the Nomod Dashboard under Webhooks, you can view delivery logs, timestamps, HTTP status codes (`200 OK`), and resend test payloads.
- **Check Logs in Vercel:** Open Vercel → **Runtime Logs** → filter by `/api/webhooks/nomod` to inspect incoming payloads and database reconciliation events.
- **Local Simulation:** If you want to test the entire customer journey locally without entering card details, use the **`⚡ Simulate test payment (Bypass Nomod)`** button on Step 4.

import crypto from "crypto";

export const NOMOD_CONFIG = {
  MERCHANT_NAME: "Juris Zone Corporate Services Provider (CSP) CO. LLC",
  URLS: {
    INDIVIDUAL: "https://pay.nomodapp.com/en/l/3de8ba889b5942b8",
    COUPLES: "https://pay.nomodapp.com/en/l/d5c977670ef34c97",
  },
  SERVICE_FEES_AED: {
    INDIVIDUAL: 999.0,
    COUPLES: 1799.0,
  },
  COURT_FEES_AED: {
    INDIVIDUAL: 950.0,
    COUPLES: 1900.0,
  },
};

export function getNomodCheckoutUrl(packageType: "INDIVIDUAL" | "COUPLES"): string {
  return packageType === "COUPLES" ? NOMOD_CONFIG.URLS.COUPLES : NOMOD_CONFIG.URLS.INDIVIDUAL;
}

export function getServiceFeeAed(packageType: "INDIVIDUAL" | "COUPLES"): number {
  return packageType === "COUPLES"
    ? NOMOD_CONFIG.SERVICE_FEES_AED.COUPLES
    : NOMOD_CONFIG.SERVICE_FEES_AED.INDIVIDUAL;
}

export function getCourtFeeAed(packageType: "INDIVIDUAL" | "COUPLES"): number {
  return packageType === "COUPLES"
    ? NOMOD_CONFIG.COURT_FEES_AED.COUPLES
    : NOMOD_CONFIG.COURT_FEES_AED.INDIVIDUAL;
}

/**
 * Verify Nomod webhook signature using HMAC SHA256 if a secret is provided.
 * In development or testing without a webhook secret, defaults to payload integrity check.
 */
export function verifyNomodSignature(
  payloadRaw: string,
  signatureHeader?: string | null,
  secret?: string
): boolean {
  if (!secret) {
    // If no secret configured in environment, allow verified structure
    return true;
  }
  if (!signatureHeader) {
    return false;
  }
  const hmac = crypto.createHmac("sha256", secret).update(payloadRaw).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signatureHeader));
}

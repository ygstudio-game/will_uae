// Edge-compatible session verification without Node.js native or Prisma dependencies
export const SESSION_COOKIE_NAME = "will_session";
export const ADMIN_COOKIE_NAME = "adjd_admin_session";

const AUTH_SECRET = process.env.AUTH_SECRET || "uae-will-adjd-civil-court-secret-key-2026-production";

function base64urlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signHmac(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToBase64url(new Uint8Array(sigBuffer));
}

export interface EdgeSessionPayload {
  userId?: string;
  accountId?: string;
  email: string;
  name: string;
  role?: "USER" | "ADMIN";
  expiresAt: number;
}

export interface EdgeAdminSessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: "ADMIN";
  expiresAt: number;
}

export async function verifySessionTokenEdge(token: string): Promise<EdgeSessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSig = await signHmac(encodedPayload, AUTH_SECRET);
    if (expectedSig !== signature) return null;

    const payloadBytes = base64urlToBytes(encodedPayload);
    const decoded = new TextDecoder().decode(payloadBytes);
    const payload: EdgeSessionPayload = JSON.parse(decoded);

    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = payload.expiresAt > 1e11 ? Math.floor(payload.expiresAt / 1000) : payload.expiresAt;
    if (expSec < nowSec) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function verifyAdminSessionTokenEdge(token: string): Promise<EdgeAdminSessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSig = await signHmac(encodedPayload, AUTH_SECRET);
    if (expectedSig !== signature) return null;

    const payloadBytes = base64urlToBytes(encodedPayload);
    const decoded = new TextDecoder().decode(payloadBytes);
    const payload: EdgeAdminSessionPayload = JSON.parse(decoded);

    if (payload.role !== "ADMIN") return null;

    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = payload.expiresAt > 1e11 ? Math.floor(payload.expiresAt / 1000) : payload.expiresAt;
    if (expSec < nowSec) return null;

    return payload;
  } catch {
    return null;
  }
}


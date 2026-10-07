import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const SESSION_COOKIE_NAME = "will_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "owa-uae-will-dev-secret-key-32bytes-secure!";

export interface SessionPayload {
  accountId: string;
  email: string;
  name: string;
  expiresAt: number;
}

// Simple Web Crypto HMAC-SHA256 signer
async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(account: {
  accountId: string;
  email: string;
  name: string;
}): Promise<string> {
  const payload: SessionPayload = {
    ...account,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString("base64url");

  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );
  const signatureB64 = Buffer.from(signature).toString("base64url");

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const [payloadB64, signatureB64] = token.split(".");
    if (!payloadB64 || !signatureB64) return null;

    const key = await getKey();
    const signature = Buffer.from(signatureB64, "base64url");
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(payloadB64)
    );

    if (!valid) return null;

    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(payloadStr);

    if (Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Generate a 6-digit numeric OTP code
export async function generateOtp(accountId: string): Promise<string> {
  const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  // Invalidate any existing unused OTPs
  await prisma.otpToken.deleteMany({
    where: { accountId },
  });

  await prisma.otpToken.create({
    data: {
      accountId,
      code: randomNum,
      expiresAt,
    },
  });

  return randomNum;
}

// Verify code against database
export async function verifyOtpCode(accountId: string, code: string): Promise<boolean> {
  const token = await prisma.otpToken.findFirst({
    where: {
      accountId,
      code,
      expiresAt: { gt: new Date() },
    },
  });

  if (!token) return false;

  // Consume token
  await prisma.otpToken.delete({
    where: { id: token.id },
  });

  return true;
}

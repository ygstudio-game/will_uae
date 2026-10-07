import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const AUTH_SECRET = process.env.AUTH_SECRET || "uae-will-adjd-civil-court-secret-key-2026-production";
const SESSION_COOKIE_NAME = "will_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session Token payload structure
export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  expiresAt: number;
}

// Helper: Sign HMAC-SHA256
async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(signature).toString("base64url");
}

// Helper: Verify HMAC-SHA256
async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await sign(data, secret);
  return expectedSignature === signature;
}

// Token generator
export async function createSessionToken(user: { id: string; email: string; name: string }): Promise<string> {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = await sign(encodedPayload, AUTH_SECRET);
  return `${encodedPayload}.${signature}`;
}

// Token parser & validator
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const isValid = await verify(encodedPayload, signature, AUTH_SECRET);
    if (!isValid) return null;

    const json = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(json);

    if (payload.expiresAt < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// Extract authenticated user from request cookie (works in Route Handlers & Server Actions)
export async function getSessionUser(req?: Request): Promise<{ id: string; email: string; name: string } | null> {
  let token: string | undefined;

  if (req) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // Not in a Next.js cookies context
    }
  }

  try {
    const payload = await verifySessionToken(token);
    if (!payload) return null;

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    return user;
  } catch (err) {
    console.error("getSessionUser error:", err);
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS };

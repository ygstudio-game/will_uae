import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const AUTH_SECRET = process.env.AUTH_SECRET || "uae-will-adjd-civil-court-secret-key-2026-production";
export const SESSION_COOKIE_NAME = "will_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Admin Authentication Constants
export const ADMIN_COOKIE_NAME = "adjd_admin_session";
export const ADMIN_DURATION_SECONDS = 60 * 60 * 24; // 24 hours
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@launchpit.ae";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@ADJD2026!";

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session Token payload structure (supports both userId and accountId interchangeably)
export interface SessionPayload {
  userId: string;
  accountId: string;
  email: string;
  name: string;
  role?: "USER" | "ADMIN";
  expiresAt: number;
}

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: "ADMIN";
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

// Token generator for regular users
export async function createSessionToken(user: {
  id?: string;
  accountId?: string;
  email: string;
  name: string;
  role?: "USER" | "ADMIN";
}): Promise<string> {
  const uid = user.id || user.accountId || "";
  const payload: SessionPayload = {
    userId: uid,
    accountId: uid,
    email: user.email.toLowerCase().trim(),
    name: user.name,
    role: user.role || "USER",
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = await sign(encodedPayload, AUTH_SECRET);
  return `${encodedPayload}.${signature}`;
}

// Token parser & validator for regular users
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const isValid = await verify(encodedPayload, signature, AUTH_SECRET);
    if (!isValid) return null;

    const json = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(json);

    // Support both seconds and ms timestamps
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = payload.expiresAt > 1e11 ? Math.floor(payload.expiresAt / 1000) : payload.expiresAt;

    if (expSec < nowSec) {
      return null; // Expired
    }

    if (!payload.userId && payload.accountId) {
      payload.userId = payload.accountId;
    }
    if (!payload.accountId && payload.userId) {
      payload.accountId = payload.userId;
    }

    return payload;
  } catch {
    return null;
  }
}

// Set cookie helper
export async function setSessionCookie(token: string) {
  try {
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
  } catch (_) {}
}

export async function clearSessionCookie() {
  try {
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch (_) {}
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

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    if (!payload) return null;

    const accountId = payload.userId || payload.accountId;
    if (!accountId) return null;

    // Verify account still exists in database
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, email: true, fullName: true },
    });

    if (!account) return null;
    return { id: account.id, email: account.email, name: account.fullName };
  } catch (err) {
    console.error("getSessionUser error:", err);
    return null;
  }
}

// -------------------------------------------------------------
// Admin Session Helpers
// -------------------------------------------------------------

export async function createAdminSessionToken(email = DEFAULT_ADMIN_EMAIL): Promise<string> {
  const payload: AdminSessionPayload = {
    adminId: "admin-system-adjd",
    email: email.toLowerCase().trim(),
    name: "ADJD Court Administrator",
    role: "ADMIN",
    expiresAt: Math.floor(Date.now() / 1000) + ADMIN_DURATION_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = await sign(encodedPayload, AUTH_SECRET);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const isValid = await verify(encodedPayload, signature, AUTH_SECRET);
    if (!isValid) return null;

    const json = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload: AdminSessionPayload = JSON.parse(json);

    if (payload.role !== "ADMIN") return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.expiresAt < nowSec) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession(req?: Request): Promise<AdminSessionPayload | null> {
  let token: string | undefined;

  if (req) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    } catch {}
  }

  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export async function setAdminSessionCookie(token: string) {
  try {
    const cookieStore = cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_DURATION_SECONDS,
    });
  } catch (_) {}
}

export async function clearAdminSessionCookie() {
  try {
    const cookieStore = cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch (_) {}
}

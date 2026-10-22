import { prisma } from "./prisma";
import {
  SESSION_COOKIE_NAME,
  createSessionToken as baseCreateSessionToken,
  verifySessionToken as baseVerifySessionToken,
  getSessionUser,
  setSessionCookie,
  clearSessionCookie,
  SessionPayload,
} from "./auth";

export { SESSION_COOKIE_NAME, setSessionCookie, clearSessionCookie };
export type { SessionPayload };

export async function createSessionToken(account: {
  accountId: string;
  email: string;
  name: string;
}): Promise<string> {
  return baseCreateSessionToken({
    id: account.accountId,
    accountId: account.accountId,
    email: account.email,
    name: account.name,
  });
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  return baseVerifySessionToken(token);
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return {
    userId: user.id,
    accountId: user.id,
    email: user.email,
    name: user.name,
    expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
  };
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

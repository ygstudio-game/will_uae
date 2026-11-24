import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const account = await prisma.account.findUnique({
      where: { id: user.id },
      select: { phoneNumber: true },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        phoneNumber: account?.phoneNumber || "",
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

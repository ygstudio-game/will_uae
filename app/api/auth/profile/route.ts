import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const account = await prisma.account.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        createdAt: true,
        applications: {
          select: {
            id: true,
            status: true,
            packageType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        phoneNumber: account.phoneNumber || "",
        createdAt: account.createdAt,
        applicationCount: account.applications.length,
      },
    });
  } catch (error: any) {
    console.error("[Profile GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fullName, phoneNumber } = body;

    const dataToUpdate: { fullName?: string; phoneNumber?: string | null } = {};

    if (fullName !== undefined) {
      const cleanName = String(fullName).trim();
      if (!cleanName || cleanName.length < 2) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid legal name (at least 2 characters)." },
          { status: 400 }
        );
      }
      dataToUpdate.fullName = cleanName;
    }

    if (phoneNumber !== undefined) {
      const cleanPhone = String(phoneNumber).trim();
      if (cleanPhone) {
        const digits = cleanPhone.replace(/\D/g, "");
        if (digits.length < 7 || digits.length > 15) {
          return NextResponse.json(
            { success: false, error: "Please enter a valid phone number with country code." },
            { status: 400 }
          );
        }
        dataToUpdate.phoneNumber = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;
      } else {
        dataToUpdate.phoneNumber = null;
      }
    }

    const updatedAccount = await prisma.account.update({
      where: { id: session.id },
      data: dataToUpdate,
    });

    // Also synchronize person (testator) in open applications so documents stay accurate
    const userApps = await prisma.application.findMany({
      where: { accountId: session.id },
      select: { id: true },
    });
    const appIds = userApps.map((a) => a.id);

    if (appIds.length > 0) {
      const personUpdates: { fullName?: string; phone?: string | null } = {};
      if (dataToUpdate.fullName) personUpdates.fullName = dataToUpdate.fullName;
      if (dataToUpdate.phoneNumber !== undefined) personUpdates.phone = dataToUpdate.phoneNumber;

      if (Object.keys(personUpdates).length > 0) {
        await prisma.person.updateMany({
          where: {
            applicationId: { in: appIds },
            email: session.email,
          },
          data: personUpdates,
        });
      }
    }

    // Refresh session cookie if name changed
    if (dataToUpdate.fullName) {
      const token = await createSessionToken({
        accountId: updatedAccount.id,
        email: updatedAccount.email,
        name: updatedAccount.fullName,
      });
      await setSessionCookie(token);
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedAccount.id,
        email: updatedAccount.email,
        name: updatedAccount.fullName,
        phoneNumber: updatedAccount.phoneNumber || "",
      },
    });
  } catch (error: any) {
    console.error("[Profile PATCH Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile." },
      { status: 500 }
    );
  }
}


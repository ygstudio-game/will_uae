import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";
import { TicketStatus } from "@prisma/client";

// GET /api/tickets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "true";
    const statusFilter = searchParams.get("status") as TicketStatus | null;
    const appId = searchParams.get("applicationId");

    const session = await getCurrentSession();

    const whereClause: any = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    if (isAdmin) {
      // Admin sees all tickets
      if (appId) whereClause.applicationId = appId;
    } else {
      // Customer sees only their tickets
      if (appId) {
        whereClause.applicationId = appId;
      } else if (session) {
        whereClause.application = { accountId: session.account.id };
      }
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        application: {
          include: {
            account: true,
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (err: any) {
    console.error("[GET /api/tickets error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/tickets
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { applicationId, subject, initialMessage, senderName } = body;

    if (!applicationId || !subject || !initialMessage) {
      return NextResponse.json(
        { success: false, error: "Missing required ticket fields" },
        { status: 400 }
      );
    }

    const name = senderName || session?.account?.fullName || "Testator";

    const ticket = await prisma.ticket.create({
      data: {
        applicationId,
        subject,
        status: "OPEN",
        replies: {
          create: {
            senderRole: "CUSTOMER",
            senderName: name,
            message: initialMessage,
          },
        },
      },
      include: {
        replies: true,
      },
    });

    // Audit event
    await prisma.auditEvent.create({
      data: {
        applicationId,
        actor: session?.account?.email || name,
        action: "TICKET_OPENED",
        details: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          subject,
        },
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    console.error("[POST /api/tickets error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

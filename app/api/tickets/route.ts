import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";
import { TicketStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

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
      if (appId && !appId.startsWith("draft-")) {
        whereClause.applicationId = appId;
      }
    } else {
      // Customer sees their tickets
      if (session) {
        whereClause.application = { accountId: session.accountId };
      } else if (appId && !appId.startsWith("draft-")) {
        whereClause.applicationId = appId;
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

    const formattedTickets = tickets.map((t) => ({
      ...t,
      messages: t.replies,
    }));

    return NextResponse.json({ success: true, tickets: formattedTickets });
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

    let targetAppId = applicationId;
    let existingApp = await prisma.application.findUnique({ where: { id: targetAppId } }).catch(() => null);
    if (!existingApp) {
      if (session) {
        existingApp = await prisma.application.findFirst({
          where: { accountId: session.accountId },
          orderBy: { createdAt: "desc" },
        });
      }
      if (!existingApp) {
        existingApp = await prisma.application.findFirst({
          orderBy: { createdAt: "desc" },
        });
      }
      if (existingApp) {
        targetAppId = existingApp.id;
      }
    }

    const name = senderName || session?.name || "Testator";

    const ticket = await prisma.ticket.create({
      data: {
        applicationId: targetAppId,
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

    // Audit event (non-blocking)
    await prisma.auditEvent.create({
      data: {
        applicationId: targetAppId,
        actor: session?.email || name,
        action: "TICKET_OPENED",
        details: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          subject,
        },
      },
    }).catch(() => {});

    const formattedTicket = {
      ...ticket,
      messages: ticket.replies,
    };

    return NextResponse.json({ success: true, ticket: formattedTicket });
  } catch (err: any) {
    console.error("[POST /api/tickets error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

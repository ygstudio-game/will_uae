import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";
import { getAdminSession } from "@/lib/auth";
import { TicketStatus } from "@prisma/client";
import { sendTicketAlertToSupport } from "@/lib/email";

export const dynamic = "force-dynamic";

// GET /api/tickets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") as TicketStatus | null;
    const appId = searchParams.get("applicationId");

    // Secure RBAC: verify actual admin session rather than query flag
    const adminSession = await getAdminSession(req);
    const isAdmin = !!adminSession;
    const session = await getCurrentSession();

    const whereClause: any = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    if (isAdmin) {
      // Verified administrator sees all tickets (or filtered by appId)
      if (appId && !appId.startsWith("draft-")) {
        whereClause.applicationId = appId;
      }
    } else {
      // Customer sees only their own tickets
      if (session) {
        whereClause.application = { accountId: session.accountId };
      } else if (appId && !appId.startsWith("draft-")) {
        whereClause.applicationId = appId;
      } else {
        // Return empty array if not authenticated and no valid application ID
        return NextResponse.json({ success: true, tickets: [] });
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
    let existingApp = await prisma.application.findUnique({ where: { id: targetAppId }, include: { account: true } }).catch(() => null);
    if (!existingApp) {
      if (session) {
        existingApp = await prisma.application.findFirst({
          where: { accountId: session.accountId },
          include: { account: true },
          orderBy: { createdAt: "desc" },
        });
      }
      if (existingApp) {
        targetAppId = existingApp.id;
      } else {
        return NextResponse.json(
          { success: false, error: "Valid application or authenticated session required to submit an inquiry" },
          { status: 401 }
        );
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

    // Alert support@onlinewillsadvisor.com via Hostinger SMTP (non-blocking)
    const senderEmail = session?.email || existingApp?.account?.email || "";
    sendTicketAlertToSupport({
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      message: initialMessage,
      senderName: name,
      senderEmail: senderEmail || undefined,
      applicationId: targetAppId,
    }).catch((err) => console.error("[Ticket Email Alert Error]:", err));

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

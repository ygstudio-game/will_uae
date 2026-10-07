import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-otp";
import { TicketStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const {
      message,
      senderRole = "CUSTOMER",
      senderName,
      updateStatus,
      fileUrl,
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    const name = senderName || session?.account?.fullName || (senderRole === "ADMIN" ? "Legal Admin" : "Client");

    // Create reply
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: ticket.id,
        senderRole,
        senderName: name,
        message: message.trim(),
        fileUrl: fileUrl || null,
      },
    });

    // Update ticket status if provided, or default to OPEN / AWAITING_CUSTOMER
    let nextStatus: TicketStatus = ticket.status;
    if (updateStatus) {
      nextStatus = updateStatus;
    } else if (senderRole === "ADMIN") {
      nextStatus = "AWAITING_CUSTOMER";
    } else if (senderRole === "CUSTOMER" && ticket.status === "AWAITING_CUSTOMER") {
      nextStatus = "OPEN";
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: nextStatus,
        updatedAt: new Date(),
      },
      include: {
        replies: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({
      success: true,
      reply,
      ticket: updatedTicket,
    });
  } catch (err: any) {
    console.error("[POST /api/tickets/[id]/replies error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

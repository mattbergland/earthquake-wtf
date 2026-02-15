import { NextResponse } from "next/server";
import { unlockLead, getLeadById } from "@/lib/leads";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { venueId: string };

    if (!body.venueId) {
      return NextResponse.json({ error: "Missing venueId" }, { status: 400 });
    }

    const lead = getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const success = unlockLead(id, body.venueId);
    if (!success) {
      return NextResponse.json({ error: "Failed to unlock" }, { status: 500 });
    }

    return NextResponse.json({
      unlocked: true,
      renterName: lead.renterName,
      renterEmail: lead.renterEmail,
      renterPhone: lead.renterPhone,
      sport: lead.sport,
      preferredDate: lead.preferredDate,
      preferredTime: lead.preferredTime,
      groupSize: lead.groupSize,
      message: lead.message,
    });
  } catch {
    return NextResponse.json({ error: "Failed to unlock lead" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import { LeadRequest } from "@/types/venue";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadRequest;

    if (!body.renterName || !body.renterEmail || !body.renterPhone || !body.sport || !body.preferredDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lead = createLead(body);

    return NextResponse.json({ id: lead.id, matchedVenues: lead.matchedVenueIds.length });
  } catch {
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

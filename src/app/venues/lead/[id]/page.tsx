"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { sportLabels } from "@/lib/venues-data";
import { Sport } from "@/types/venue";

interface UnlockedLead {
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  sport: Sport;
  preferredDate: string;
  preferredTime: string;
  groupSize: number;
  message: string;
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const venueId = searchParams.get("venue") || "";

  const [unlocked, setUnlocked] = useState(false);
  const [lead, setLead] = useState<UnlockedLead | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");

  async function handleUnlock() {
    setUnlocking(true);
    setError("");

    try {
      const res = await fetch(`/api/leads/${id}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to unlock");
      }

      const data = await res.json();
      setLead(data as UnlockedLead);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/venues" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          &larr; Back to venues
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">Renter Lead</h1>
        <p className="mt-1 text-sm text-gray-500">
          Someone is looking to rent a court in San Francisco.
        </p>

        {!unlocked ? (
          <div className="mt-8">
            <div className="border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Lead Preview</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm text-gray-300 bg-gray-100 rounded px-3 py-0.5 select-none">
                    &#9608;&#9608;&#9608;&#9608;&#9608; &#9608;&#9608;&#9608;&#9608;
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm text-gray-300 bg-gray-100 rounded px-3 py-0.5 select-none">
                    &#9608;&#9608;&#9608;&#9608;@&#9608;&#9608;&#9608;.com
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="text-sm text-gray-300 bg-gray-100 rounded px-3 py-0.5 select-none">
                    (&#9608;&#9608;&#9608;) &#9608;&#9608;&#9608;-&#9608;&#9608;&#9608;&#9608;
                  </span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Sport</span>
                  <span className="text-sm text-gray-600">Visible after unlock</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm text-gray-600">Visible after unlock</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Group Size</span>
                  <span className="text-sm text-gray-600">Visible after unlock</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
              )}

              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unlocking ? "Processing..." : "Unlock Lead \u2014 $2.99"}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Payment will be processed via Stripe. You&apos;ll get full contact details immediately.
              </p>
            </div>
          </div>
        ) : lead ? (
          <div className="mt-8">
            <div className="border border-green-200 bg-green-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">&#10003;</span>
                <h2 className="font-semibold text-green-800">Lead Unlocked</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm font-medium text-gray-900">{lead.renterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email</span>
                  <a href={`mailto:${lead.renterEmail}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {lead.renterEmail}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phone</span>
                  <a href={`tel:${lead.renterPhone}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {lead.renterPhone}
                  </a>
                </div>
                <hr className="border-green-200" />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Sport</span>
                  <span className="text-sm font-medium text-gray-900">{sportLabels[lead.sport]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Preferred Date</span>
                  <span className="text-sm font-medium text-gray-900">{lead.preferredDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Preferred Time</span>
                  <span className="text-sm font-medium text-gray-900">{lead.preferredTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Group Size</span>
                  <span className="text-sm font-medium text-gray-900">{lead.groupSize} people</span>
                </div>
                {lead.message && (
                  <>
                    <hr className="border-green-200" />
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Message</span>
                      <p className="text-sm text-gray-900">{lead.message}</p>
                    </div>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Reach out to this renter as soon as possible. Quick responses lead to more bookings.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

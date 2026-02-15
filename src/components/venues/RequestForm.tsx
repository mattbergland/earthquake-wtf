"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sportLabels } from "@/lib/venues-data";
import { Sport } from "@/types/venue";

const sports: Sport[] = ["basketball", "soccer", "tennis", "volleyball", "pickleball"];

const timeSlots = [
  "Morning (6am-12pm)",
  "Afternoon (12pm-5pm)",
  "Evening (5pm-9pm)",
  "Late Night (9pm-12am)",
];

export default function RequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const venueId = searchParams.get("venue");

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    renterName: "",
    renterEmail: "",
    renterPhone: "",
    sport: "basketball" as Sport,
    preferredDate: "",
    preferredTime: timeSlots[0],
    groupSize: 10,
    message: "",
  });

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          venueId,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      const data = await res.json();
      router.push(`/venues/success?id=${data.id}`);
    } catch {
      setSubmitting(false);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="renterName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="renterName"
            type="text"
            required
            value={form.renterName}
            onChange={(e) => update("renterName", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label htmlFor="renterPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="renterPhone"
            type="tel"
            required
            value={form.renterPhone}
            onChange={(e) => update("renterPhone", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="(415) 555-1234"
          />
        </div>
      </div>

      <div>
        <label htmlFor="renterEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="renterEmail"
          type="email"
          required
          value={form.renterEmail}
          onChange={(e) => update("renterEmail", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="jane@example.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
            Sport
          </label>
          <select
            id="sport"
            value={form.sport}
            onChange={(e) => update("sport", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          >
            {sports.map((s) => (
              <option key={s} value={s}>
                {sportLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 mb-1">
            Group Size
          </label>
          <input
            id="groupSize"
            type="number"
            min={1}
            max={100}
            required
            value={form.groupSize}
            onChange={(e) => update("groupSize", parseInt(e.target.value) || 1)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Date
          </label>
          <input
            id="preferredDate"
            type="date"
            required
            value={form.preferredDate}
            onChange={(e) => update("preferredDate", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Time
          </label>
          <select
            id="preferredTime"
            value={form.preferredTime}
            onChange={(e) => update("preferredTime", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          >
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Details <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          placeholder="e.g. Need a full court for a corporate team-building event..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Submit Request"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Your request will be shared with matching venues in San Francisco.
        Venues pay a small fee to access your contact info and will reach out to you directly.
      </p>
    </form>
  );
}

"use client";

import Link from "next/link";
import { Venue } from "@/types/venue";
import { sportLabels, sportEmoji } from "@/lib/venues-data";

export default function VenueCard({ venue }: { venue: Venue }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-md transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{venue.name}</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-1 whitespace-nowrap">
          {venue.indoor ? "Indoor" : "Outdoor"}
        </span>
      </div>

      <p className="text-sm text-gray-500">{venue.neighborhood} &middot; {venue.address}</p>

      <div className="flex flex-wrap gap-1.5">
        {venue.sports.map((sport) => (
          <span
            key={sport}
            className="text-xs font-medium bg-blue-50 text-blue-700 rounded-full px-2.5 py-1"
          >
            {sportEmoji[sport]} {sportLabels[sport]}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">{venue.description}</p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-sm font-semibold text-gray-900">{venue.priceRange}</span>
        <span className="text-xs text-gray-400">
          {venue.courtCount} court{venue.courtCount > 1 ? "s" : ""}
        </span>
      </div>

      <Link
        href={`/venues/request?venue=${venue.id}`}
        className="block w-full text-center bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Request to Rent
      </Link>
    </div>
  );
}

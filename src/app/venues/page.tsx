"use client";

import { useState } from "react";
import { venues } from "@/lib/venues-data";
import VenueCard from "@/components/venues/VenueCard";
import SportFilter from "@/components/venues/SportFilter";
import Link from "next/link";
import { Sport } from "@/types/venue";

export default function VenuesPage() {
  const [selectedSport, setSelectedSport] = useState("all");

  const filtered =
    selectedSport === "all"
      ? venues
      : venues.filter((v) => v.sports.includes(selectedSport as Sport));

  return (
    <div>
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Rent Sports Courts
            <br />
            <span className="text-gray-400">in San Francisco</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Basketball, soccer, tennis, volleyball, pickleball — find the perfect court or field for your group.
          </p>
          <div className="mt-8">
            <Link
              href="/venues/request"
              className="inline-block bg-gray-900 text-white font-medium px-8 py-3.5 rounded-xl text-base hover:bg-gray-800 transition-colors shadow-sm"
            >
              Tell Us What You Need
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-4">
        <div className="max-w-5xl mx-auto">
          <SportFilter selected={selectedSport} onChange={setSelectedSport} />
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-12">
              No venues found for this sport. Try another filter or{" "}
              <Link href="/venues/request" className="underline text-gray-600">
                submit a general request
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-3">1</div>
              <h3 className="font-semibold text-gray-900">Tell Us What You Need</h3>
              <p className="text-sm text-gray-500 mt-1">
                Fill out a quick form with your sport, date, and group size.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">2</div>
              <h3 className="font-semibold text-gray-900">We Notify Venues</h3>
              <p className="text-sm text-gray-500 mt-1">
                Matching venues in SF are notified about your request.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">3</div>
              <h3 className="font-semibold text-gray-900">Venues Contact You</h3>
              <p className="text-sm text-gray-500 mt-1">
                Interested venues reach out directly with availability and pricing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

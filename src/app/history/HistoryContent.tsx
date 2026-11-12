"use client";

import type { HistoryEarthquake } from "@/lib/history-data";
import { extractLocationName } from "@/lib/api";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const dateOptions = { month: "short", day: "numeric", year: "numeric" } as const;
const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true } as const;
const formatters = new Map<boolean, { date: Intl.DateTimeFormat; time: Intl.DateTimeFormat }>();

function getFormatters(local: boolean) {
  let value = formatters.get(local);
  if (!value) {
    const zone = local ? {} : { timeZone: "UTC" };
    value = {
      date: new Intl.DateTimeFormat("en-US", { ...dateOptions, ...zone }),
      time: new Intl.DateTimeFormat("en-US", { ...timeOptions, ...zone }),
    };
    formatters.set(local, value);
  }
  return value;
}

export default function HistoryContent({ earthquakes, error }: { earthquakes: HistoryEarthquake[]; error: string | null }) {
  // Match UTC HTML during hydration, then show the reader's local time.
  const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  if (error) {
    return (
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">History</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">History</h1>
        <p className="text-gray-500 mb-6">
          {earthquakes.length} earthquakes in the Bay Area over the last 30 days
        </p>

        {earthquakes.length === 0 ? (
          <p className="text-gray-500">No earthquakes recorded in the last 30 days.</p>
        ) : (
          <div className="space-y-3">
            {earthquakes.map((quake) => (
              <EarthquakeCard key={quake.id} earthquake={quake} local={hydrated} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EarthquakeCard({ earthquake, local }: { earthquake: HistoryEarthquake; local: boolean }) {
  const magnitude = earthquake.properties.mag;
  const location = extractLocationName(earthquake.properties.place);
  const time = new Date(earthquake.properties.time);
  const formatter = getFormatters(local);

  const getMagnitudeColor = (mag: number) => {
    if (mag >= 4) return "bg-red-500";
    if (mag >= 3) return "bg-orange-500";
    if (mag >= 2) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <a
      href={earthquake.properties.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-14 h-14 ${getMagnitudeColor(magnitude)} rounded-lg flex items-center justify-center`}
        >
          <span className="text-white font-bold text-lg">
            {magnitude.toFixed(1)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{location}</p>
          <p className="text-sm text-gray-500">
            <time dateTime={time.toISOString()}>
              {formatter.date.format(time)} at {formatter.time.format(time)}
            </time>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Depth: {earthquake.geometry.coordinates[2].toFixed(1)} km
          </p>
        </div>
      </div>
    </a>
  );
}

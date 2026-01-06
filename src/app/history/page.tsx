"use client";

import { useEffect, useState } from "react";
import { EarthquakeFeature } from "@/types/earthquake";
import { fetchEarthquakesLast30Days, extractLocationName } from "@/lib/api";
import { format } from "date-fns";

export default function HistoryPage() {
  const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchEarthquakesLast30Days();
        setEarthquakes(data);
      } catch (err) {
        setError("Failed to load earthquake history.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">History</h1>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

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
              <EarthquakeCard key={quake.id} earthquake={quake} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EarthquakeCard({ earthquake }: { earthquake: EarthquakeFeature }) {
  const magnitude = earthquake.properties.mag;
  const location = extractLocationName(earthquake.properties.place);
  const time = new Date(earthquake.properties.time);

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
            {format(time, "MMM d, yyyy 'at' h:mm a")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Depth: {earthquake.geometry.coordinates[2].toFixed(1)} km
          </p>
        </div>
      </div>
    </a>
  );
}

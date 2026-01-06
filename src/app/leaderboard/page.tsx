"use client";

import { useEffect, useState, useMemo } from "react";
import { EarthquakeFeature } from "@/types/earthquake";
import { fetchEarthquakesLast30Days, extractLocationName } from "@/lib/api";
import { Trophy, TrendingUp, MapPin } from "lucide-react";

interface LocationStats {
  location: string;
  count: number;
  maxMagnitude: number;
  totalMagnitude: number;
}

export default function LeaderboardPage() {
  const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchEarthquakesLast30Days();
        setEarthquakes(data);
      } catch (err) {
        setError("Failed to load earthquake data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const leaderboard = useMemo(() => {
    const locationMap = new Map<string, LocationStats>();

    earthquakes.forEach((quake) => {
      const location = extractLocationName(quake.properties.place);
      const existing = locationMap.get(location);

      if (existing) {
        existing.count += 1;
        existing.maxMagnitude = Math.max(existing.maxMagnitude, quake.properties.mag);
        existing.totalMagnitude += quake.properties.mag;
      } else {
        locationMap.set(location, {
          location,
          count: 1,
          maxMagnitude: quake.properties.mag,
          totalMagnitude: quake.properties.mag,
        });
      }
    });

    return Array.from(locationMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [earthquakes]);

  if (loading) {
    return (
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Leaderboard</h1>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Leaderboard</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        </div>
        <p className="text-gray-500 mb-6">
          Most shaken areas in the Bay Area (last 30 days)
        </p>

        {leaderboard.length === 0 ? (
          <p className="text-gray-500">No earthquake data available.</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((item, index) => (
              <LeaderboardCard key={item.location} item={item} rank={index + 1} />
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Stats Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Earthquakes</p>
              <p className="text-2xl font-bold text-gray-900">{earthquakes.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Unique Locations</p>
              <p className="text-2xl font-bold text-gray-900">{leaderboard.length}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function LeaderboardCard({ item, rank }: { item: LocationStats; rank: number }) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-amber-600 text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-lg">
      <div
        className={`flex-shrink-0 w-10 h-10 ${getRankStyle(rank)} rounded-full flex items-center justify-center font-bold`}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          {item.location}
        </p>
        <p className="text-sm text-gray-500">
          {item.count} earthquake{item.count !== 1 ? "s" : ""} • Max M{item.maxMagnitude.toFixed(1)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-gray-900">{item.count}</p>
        <p className="text-xs text-gray-400">quakes</p>
      </div>
    </div>
  );
}

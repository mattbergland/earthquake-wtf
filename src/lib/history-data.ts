import { unstable_cache } from "next/cache";
import { extractLocationName, fetchEarthquakesLast30Days } from "./api";
import type { EarthquakeFeature } from "@/types/earthquake";

export type HistoryEarthquake = Pick<EarthquakeFeature, "id" | "geometry"> & {
  properties: Pick<EarthquakeFeature["properties"], "mag" | "place" | "time" | "url">;
};

export interface LocationStats {
  location: string;
  count: number;
  maxMagnitude: number;
}

export function getLeaderboard(earthquakes: HistoryEarthquake[]): LocationStats[] {
  const locations = new Map<string, LocationStats>();
  for (const quake of earthquakes) {
    const location = extractLocationName(quake.properties.place);
    const existing = locations.get(location);
    if (existing) {
      existing.count += 1;
      existing.maxMagnitude = Math.max(existing.maxMagnitude, quake.properties.mag);
    } else {
      locations.set(location, { location, count: 1, maxMagnitude: quake.properties.mag });
    }
  }
  return Array.from(locations.values()).sort((a, b) => b.count - a.count).slice(0, 10);
}

export const getHistoryData = unstable_cache(
  async (): Promise<HistoryEarthquake[]> => {
    const earthquakes = await fetchEarthquakesLast30Days();
    return earthquakes.map(({ id, properties, geometry }) => ({
      id,
      properties: {
        mag: properties.mag,
        place: properties.place,
        time: properties.time,
        url: properties.url,
      },
      geometry,
    }));
  },
  ["bay-area-earthquakes-30-days-v2"],
  { revalidate: 60 },
);

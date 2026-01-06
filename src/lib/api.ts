import { EarthquakeResponse, EarthquakeFeature, EarthquakeStatus, EarthquakeState } from "@/types/earthquake";

const RECENT_THRESHOLD_MS = 5 * 60 * 1000;

// 9 Bay Area Counties bounding box:
// San Francisco, San Mateo, Santa Clara, Alameda, Contra Costa, Marin, Sonoma, Napa, Solano
// This excludes The Geysers geothermal area (induced seismicity)
const BAY_AREA_BOUNDS = {
  minLat: 36.9,   // South: Santa Clara County southern edge
  maxLat: 38.5,   // North: Sonoma/Napa northern edge (excludes The Geysers at ~38.8)
  minLng: -123.1, // West: Sonoma coast
  maxLng: -121.5, // East: Contra Costa/Alameda eastern edge
};

function isInBayArea(lat: number, lng: number): boolean {
  return (
    lat >= BAY_AREA_BOUNDS.minLat &&
    lat <= BAY_AREA_BOUNDS.maxLat &&
    lng >= BAY_AREA_BOUNDS.minLng &&
    lng <= BAY_AREA_BOUNDS.maxLng
  );
}

function filterBayAreaQuakes(earthquakes: EarthquakeFeature[]): EarthquakeFeature[] {
  return earthquakes.filter((eq) => {
    const [lng, lat] = eq.geometry.coordinates;
    return isInBayArea(lat, lng);
  });
}

export async function fetchRecentEarthquakes(limit: number = 10): Promise<EarthquakeFeature[]> {
  const url = new URL("https://earthquake.usgs.gov/fdsnws/event/1/query");
  url.searchParams.set("format", "geojson");
  url.searchParams.set("minlatitude", BAY_AREA_BOUNDS.minLat.toString());
  url.searchParams.set("maxlatitude", BAY_AREA_BOUNDS.maxLat.toString());
  url.searchParams.set("minlongitude", BAY_AREA_BOUNDS.minLng.toString());
  url.searchParams.set("maxlongitude", BAY_AREA_BOUNDS.maxLng.toString());
  url.searchParams.set("orderby", "time");
  url.searchParams.set("limit", (limit * 2).toString()); // Fetch extra to account for filtering
  url.searchParams.set("minmagnitude", "1");

  const response = await fetch(url.toString(), {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`USGS API error: ${response.status}`);
  }

  const data: EarthquakeResponse = await response.json();
  return filterBayAreaQuakes(data.features).slice(0, limit);
}

export async function fetchEarthquakesLast30Days(): Promise<EarthquakeFeature[]> {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);

  const url = new URL("https://earthquake.usgs.gov/fdsnws/event/1/query");
  url.searchParams.set("format", "geojson");
  url.searchParams.set("minlatitude", BAY_AREA_BOUNDS.minLat.toString());
  url.searchParams.set("maxlatitude", BAY_AREA_BOUNDS.maxLat.toString());
  url.searchParams.set("minlongitude", BAY_AREA_BOUNDS.minLng.toString());
  url.searchParams.set("maxlongitude", BAY_AREA_BOUNDS.maxLng.toString());
  url.searchParams.set("orderby", "time");
  url.searchParams.set("starttime", startTime.toISOString());
  url.searchParams.set("endtime", endTime.toISOString());
  url.searchParams.set("minmagnitude", "1");

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`USGS API error: ${response.status}`);
  }

  const data: EarthquakeResponse = await response.json();
  return filterBayAreaQuakes(data.features);
}

export function determineEarthquakeState(earthquakes: EarthquakeFeature[]): EarthquakeStatus {
  const now = Date.now();
  
  const recentQuakes = earthquakes.filter(
    (eq) => now - eq.properties.time < RECENT_THRESHOLD_MS
  );

  const uniqueQuakes = Array.from(
    new Map(recentQuakes.map((eq) => [eq.id, eq])).values()
  );

  if (uniqueQuakes.length === 0) {
    return {
      state: "no",
      earthquake: null,
      recentQuakes: [],
      lastUpdated: new Date(),
    };
  }

  const mostRecent = uniqueQuakes[0];
  const magnitude = mostRecent.properties.mag;

  let state: EarthquakeState;
  if (magnitude >= 3) {
    state = "yes";
  } else {
    state = "maybe";
  }

  return {
    state,
    earthquake: mostRecent,
    recentQuakes: uniqueQuakes.slice(0, 3),
    lastUpdated: new Date(),
  };
}

export function extractLocationName(place: string): string {
  const match = place.match(/of\s+(.+)$/);
  return match ? match[1] : place;
}

export function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) {
    return "just now";
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

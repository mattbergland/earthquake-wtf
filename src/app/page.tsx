import { preconnect } from "react-dom";
import EarthquakeStatus from "@/components/EarthquakeStatus";
import { fetchRecentEarthquakes, determineEarthquakeState } from "@/lib/api";

// Prerender with real data and refresh it in the background every 15s; the client
// re-polls USGS right after hydration, so what's shown is never stale for long.
export const revalidate = 15;

async function getInitialStatus() {
  try {
    return determineEarthquakeState(await fetchRecentEarthquakes(10));
  } catch {
    return null;
  }
}

export default async function Home() {
  preconnect("https://earthquake.usgs.gov", { crossOrigin: "anonymous" });
  const initialStatus = await getInitialStatus();
  return (
    <main className="flex-1 flex flex-col items-center justify-center pb-20 md:pb-0">
      <EarthquakeStatus initialStatus={initialStatus} />
    </main>
  );
}

import { getHistoryData, type HistoryEarthquake } from "@/lib/history-data";
import HistoryContent from "./HistoryContent";

export const revalidate = 60;

export default async function HistoryPage() {
  let earthquakes: HistoryEarthquake[] = [];
  let error = null;
  try {
    earthquakes = await getHistoryData();
  } catch {
    error = "Failed to load earthquake history.";
  }
  return <HistoryContent earthquakes={earthquakes} error={error} />;
}

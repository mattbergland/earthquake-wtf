import { getHistoryData, getLeaderboard, type HistoryEarthquake } from "@/lib/history-data";
import LeaderboardContent from "./LeaderboardContent";

export const revalidate = 60;

export default async function LeaderboardPage() {
  let earthquakes: HistoryEarthquake[] = [];
  let error = null;
  try {
    earthquakes = await getHistoryData();
  } catch {
    error = "Failed to load earthquake data.";
  }
  return <LeaderboardContent leaderboard={getLeaderboard(earthquakes)} total={earthquakes.length} error={error} />;
}

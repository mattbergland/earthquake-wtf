import { Trophy } from "lucide-react";

export default function LeaderboardLoading() {
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
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-[82px] bg-gray-100 rounded-lg" />
          ))}
        </div>
        <div aria-hidden="true" className="animate-pulse mt-8 h-[116px] bg-gray-50 rounded-lg" />
      </div>
    </main>
  );
}

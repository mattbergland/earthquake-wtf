export default function LeaderboardLoading() {
  return (
    <main className="flex-1 pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Leaderboard</h1>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}

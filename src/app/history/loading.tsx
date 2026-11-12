export default function HistoryLoading() {
  return (
    <main className="flex-1 pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">History</h1>
        <p aria-hidden="true" className="invisible text-gray-500 mb-6">
          0 earthquakes in the Bay Area over the past 30 days
        </p>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-[98px] bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}

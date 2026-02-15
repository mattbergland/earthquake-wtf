import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="py-24 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="text-5xl mb-6">&#127936;</div>
        <h1 className="text-2xl font-bold text-gray-900">Request Submitted!</h1>
        <p className="mt-3 text-gray-500">
          We&apos;ve notified matching venues in San Francisco about your request.
          Interested venues will reach out to you directly with availability and pricing.
        </p>
        <p className="mt-4 text-sm text-gray-400">
          Most venues respond within 24 hours.
        </p>
        <div className="mt-8">
          <Link
            href="/venues"
            className="inline-block bg-gray-900 text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse More Venues
          </Link>
        </div>
      </div>
    </div>
  );
}

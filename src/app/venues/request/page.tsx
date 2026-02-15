import { Suspense } from "react";
import RequestForm from "@/components/venues/RequestForm";
import Link from "next/link";

export default function RequestPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/venues" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          &larr; Back to venues
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">Request a Court</h1>
        <p className="mt-2 text-sm text-gray-500">
          Tell us what you&apos;re looking for and we&apos;ll connect you with the right venues in San Francisco.
        </p>

        <div className="mt-8">
          <Suspense fallback={<div className="text-center py-8 text-gray-400">Loading form...</div>}>
            <RequestForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

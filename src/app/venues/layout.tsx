import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SF Courts — Rent Sports Courts in San Francisco",
  description: "Find and rent basketball courts, soccer fields, tennis courts, and more in San Francisco. Connect directly with venues.",
  keywords: ["rent basketball court", "san francisco", "sports venue rental", "court rental SF", "gym rental"],
  openGraph: {
    title: "SF Courts — Rent Sports Courts in San Francisco",
    description: "Find and rent basketball courts, soccer fields, tennis courts, and more in San Francisco.",
    type: "website",
  },
};

export default function VenuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/venues" className="text-xl font-bold text-gray-900 tracking-tight">
            SF Courts
          </Link>
          <Link
            href="/venues/request"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Request a Court
          </Link>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            SF Courts &middot; Helping you find the right court in San Francisco
          </p>
        </div>
      </footer>
    </div>
  );
}

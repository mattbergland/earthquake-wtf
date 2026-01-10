import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { EarthquakeProvider } from "@/lib/EarthquakeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "earthquake.wtf — Was that an earthquake?",
  description: "Instantly know if that shaking was an earthquake. Real-time USGS data for the San Francisco Bay Area.",
  keywords: ["earthquake", "bay area", "san francisco", "seismic", "USGS", "real-time"],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  metadataBase: new URL("https://earthquake.wtf"),
  openGraph: {
    title: "earthquake.wtf — Was that an earthquake?",
    description: "Instantly know if that shaking was an earthquake. Real-time Bay Area earthquake detection.",
    type: "website",
    siteName: "earthquake.wtf",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "earthquake.wtf — Was that an earthquake?",
    description: "Instantly know if that shaking was an earthquake. Real-time Bay Area earthquake detection.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white min-h-screen flex flex-col`}>
        <EarthquakeProvider>
          <header className="hidden md:block">
            <Navigation />
          </header>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <div className="md:hidden">
            <Navigation />
          </div>
          <Footer />
        </EarthquakeProvider>
      </body>
    </html>
  );
}

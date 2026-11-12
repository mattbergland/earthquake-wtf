"use client";

import { useEffect, useState, useCallback } from "react";
import { EarthquakeStatus as EarthquakeStatusType, EarthquakeFeature } from "@/types/earthquake";
import { fetchRecentEarthquakes, determineEarthquakeState, extractLocationName, getTimeAgo } from "@/lib/api";
import { triggerVibration } from "@/lib/vibration";
import AnimatedLogo from "@/components/AnimatedLogo";

const REFRESH_INTERVAL = 30000;

const LOADING_MESSAGES = [
  "yo was that an earthquake?",
  "am i crazy or did we just have an earthquake",
  "earthquake??? lol",
  "did anyone else feel that??",
  "my whole apartment just shook",
  "ok that was definitely something",
  "was that a truck or an earthquake",
  "the chandelier is swinging 👀",
  "my cat just FREAKED out",
  "bro my desk was shaking",
  "the BART made less noise than that",
  "my coffee almost spilled at Philz",
  "felt that all the way in the Mission",
  "even my succulents are stressed",
  "is this the big one or just Muni",
  "my Victorian is NOT built for this",
  "the fog didn't prepare me for this",
  "shaking harder than the Salesforce tower",
];

function LoadingState() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  
  useEffect(() => {
    const shuffled = [...Array(LOADING_MESSAGES.length).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    shuffled.forEach((msgIndex, i) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msgIndex]);
      }, i * 350);
    });
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm space-y-3 mb-8">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-15 flex items-start ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            {visibleMessages[i] !== undefined && (
            <span
              className={`inline-block animate-fade-in px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                i % 2 === 0
                  ? "bg-gray-100 text-gray-500 rounded-br-md"
                  : "bg-gray-100 text-gray-500 rounded-bl-md"
              }`}
            >
              {LOADING_MESSAGES[visibleMessages[i]]}
            </span>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex flex-col items-center">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }} />
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.8s" }} />
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.8s" }} />
        </div>
        <p className="mt-4 text-gray-400 text-sm">Checking seismic activity...</p>
      </div>
    </div>
  );
}

let latestClientStatus: EarthquakeStatusType | null = null;

function pickFreshest(a: EarthquakeStatusType | null, b: EarthquakeStatusType | null) {
  if (!a) return b;
  if (!b) return a;
  return new Date(a.lastUpdated).getTime() >= new Date(b.lastUpdated).getTime() ? a : b;
}

export default function EarthquakeStatus({ initialStatus = null }: { initialStatus?: EarthquakeStatusType | null }) {
  const [status, setStatus] = useState<EarthquakeStatusType | null>(() => pickFreshest(latestClientStatus, initialStatus));
  const [loading, setLoading] = useState(() => !pickFreshest(latestClientStatus, initialStatus));
  const [error, setError] = useState<string | null>(null);
  const [lastVibrated, setLastVibrated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const earthquakes = await fetchRecentEarthquakes(10);
      const newStatus = determineEarthquakeState(earthquakes);

      latestClientStatus = newStatus;
      setStatus(newStatus);
      setError(null);

      if (
        newStatus.earthquake &&
        newStatus.earthquake.id !== lastVibrated &&
        (newStatus.state === "yes" || newStatus.state === "maybe")
      ) {
        triggerVibration(newStatus.state);
        setLastVibrated(newStatus.earthquake.id);
      }
    } catch {
      setError("Unable to reach USGS. Please try again.");
      setStatus({
        state: "error",
        earthquake: null,
        recentQuakes: [],
        lastUpdated: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, [lastVibrated]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || status?.state === "error") {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-6xl md:text-8xl font-bold text-gray-400">UNKNOWN</h1>
        <p className="mt-4 text-gray-500 text-lg">USGS not responding.</p>
        <button
          onClick={() => fetchData()}
          className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-transform duration-150 motion-safe:active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh] px-4">
      <AnimatedLogo />
      
      {status?.state === "yes" && status.earthquake && (
        <YesState earthquake={status.earthquake} />
      )}
      {status?.state === "maybe" && status.earthquake && (
        <MaybeState earthquake={status.earthquake} />
      )}
      {status?.state === "no" && <NoState />}

      {status && status.recentQuakes.length > 1 && (
        <RecentQuakesList quakes={status.recentQuakes.slice(1)} />
      )}

      <p className="mt-8 text-xs text-gray-400">
        Auto-refreshes every 30 seconds • Data from USGS
      </p>
    </div>
  );
}

function YesState({ earthquake }: { earthquake: EarthquakeFeature }) {
  const location = extractLocationName(earthquake.properties.place);
  const timeAgo = getTimeAgo(earthquake.properties.time);

  return (
    <div className="text-center">
      <h1 className="text-8xl md:text-[12rem] font-black text-red-600 tracking-tight leading-none animate-pop-in">
        YES.
      </h1>
      <p className="mt-8 text-2xl md:text-3xl text-gray-800 animate-slide-up-fade" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
        <span className="font-semibold">Magnitude {earthquake.properties.mag.toFixed(1)}</span>
        <span className="mx-2">—</span>
        <span>{location}</span>
      </p>
      <p className="mt-2 text-lg text-gray-500 animate-slide-up-fade" style={{ animationDelay: "300ms", animationFillMode: "both" }} suppressHydrationWarning>{timeAgo}</p>
    </div>
  );
}

function MaybeState({ earthquake }: { earthquake: EarthquakeFeature }) {
  const location = extractLocationName(earthquake.properties.place);
  const timeAgo = getTimeAgo(earthquake.properties.time);

  return (
    <div className="text-center">
      <h1 className="text-8xl md:text-[12rem] font-black text-yellow-600 tracking-tight leading-none animate-pop-in animate-wiggle">
        MAYBE.
      </h1>
      <p className="mt-8 text-2xl md:text-3xl text-gray-800 animate-slide-up-fade" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
        <span className="font-semibold">Magnitude {earthquake.properties.mag.toFixed(1)}</span>
        <span className="mx-2">—</span>
        <span>{location}</span>
      </p>
      <p className="mt-2 text-lg text-gray-500 animate-slide-up-fade" style={{ animationDelay: "300ms", animationFillMode: "both" }} suppressHydrationWarning>{timeAgo}</p>
      <p className="mt-4 text-sm text-gray-400 animate-slide-up-fade" style={{ animationDelay: "450ms", animationFillMode: "both" }}>
        Small quake detected, but you might not have felt it.
      </p>
    </div>
  );
}

function NoState() {
  return (
    <div className="text-center">
      <h1 className="text-8xl md:text-[12rem] font-black text-green-700 tracking-tight leading-none animate-pop-in">
        NO.
      </h1>
      <p className="mt-8 text-2xl md:text-3xl text-gray-600 animate-slide-up-fade" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
        Nothing shaking near the Bay.
      </p>
      <p className="mt-3 text-base text-gray-400 animate-slide-up-fade" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
        No earthquakes detected in the last 5 minutes.
      </p>
    </div>
  );
}

function RecentQuakesList({ quakes }: { quakes: EarthquakeFeature[] }) {
  return (
    <div className="mt-10 w-full max-w-md">
      <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3">
        Also in the last 5 minutes
      </h3>
      <div className="space-y-2">
        {quakes.map((quake) => (
          <div
            key={quake.id}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
          >
            <span className="text-sm text-gray-600">
              M{quake.properties.mag.toFixed(1)} — {extractLocationName(quake.properties.place)}
            </span>
            <span className="text-xs text-gray-400" suppressHydrationWarning>
              {getTimeAgo(quake.properties.time)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

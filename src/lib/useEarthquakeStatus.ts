import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { EarthquakeStatus } from "@/types/earthquake";
import { determineEarthquakeState } from "@/lib/api";
import { loadQuakes, useMarkContentShown, useQuakes } from "@/lib/quakeCache";
import { triggerVibration } from "@/lib/vibration";

const REFRESH_INTERVAL = 30000;
const INTRO_MS = 2500;

// The loading animation plays once per visit; returning to the Status tab
// shows the cached status immediately while it revalidates.
let introDone = false;
let introStarted = false;
let lastVibratedId: string | null = null;
const introListeners = new Set<() => void>();

function subscribeIntro(listener: () => void) {
  introListeners.add(listener);
  return () => {
    introListeners.delete(listener);
  };
}

function finishIntro() {
  introDone = true;
  introListeners.forEach((l) => l());
}

function startIntro() {
  if (introStarted) return;
  introStarted = true;
  loadQuakes("recent").then(
    () => setTimeout(finishIntro, INTRO_MS),
    finishIntro
  );
}

export function useEarthquakeStatus() {
  const entry = useQuakes("recent");
  const intro = useSyncExternalStore(subscribeIntro, () => introDone, () => false);

  useEffect(() => {
    startIntro();
    const interval = setInterval(() => {
      loadQuakes("recent", { force: true }).catch(() => {});
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const status = useMemo<EarthquakeStatus | null>(() => {
    if (!entry) return null;
    if (entry.error || !entry.data) {
      return { state: "error", earthquake: null, recentQuakes: [], lastUpdated: new Date() };
    }
    return determineEarthquakeState(entry.data);
  }, [entry]);

  const loading = !intro || !status;
  useMarkContentShown(!loading);

  useEffect(() => {
    if (loading || !status?.earthquake) return;
    if (status.earthquake.id !== lastVibratedId && (status.state === "yes" || status.state === "maybe")) {
      triggerVibration(status.state);
      lastVibratedId = status.earthquake.id;
    }
  }, [loading, status]);

  const retry = useCallback(() => {
    loadQuakes("recent", { force: true }).catch(() => {});
  }, []);

  return {
    status,
    loading,
    error: status?.state === "error" ? "Unable to reach USGS. Please try again." : null,
    retry,
  };
}

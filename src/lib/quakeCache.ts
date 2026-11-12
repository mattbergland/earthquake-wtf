import { useEffect, useSyncExternalStore } from "react";
import type { EarthquakeFeature } from "@/types/earthquake";
import { fetchEarthquakesLast30Days, fetchRecentEarthquakes } from "@/lib/api";

// Client-side stale-while-revalidate cache shared by all tabs, so switching
// between Status / History / Leaderboard renders the last data instantly and
// refreshes in the background instead of remounting into a loading state.

const sources = {
  recent: { load: () => fetchRecentEarthquakes(10), maxAgeMs: 30_000 },
  last30Days: { load: () => fetchEarthquakesLast30Days(), maxAgeMs: 60_000 },
};

export type QuakeKey = keyof typeof sources;

export interface QuakeEntry {
  data?: EarthquakeFeature[];
  error?: unknown;
  updatedAt: number;
}

const entries = new Map<QuakeKey, QuakeEntry>();
const inflight = new Map<QuakeKey, Promise<EarthquakeFeature[]>>();
const listeners = new Set<() => void>();

function setEntry(key: QuakeKey, entry: QuakeEntry) {
  entries.set(key, entry);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function loadQuakes(key: QuakeKey, { force = false } = {}): Promise<EarthquakeFeature[]> {
  const pending = inflight.get(key);
  if (pending) return pending;

  const entry = entries.get(key);
  if (!force && entry?.data && !entry.error && Date.now() - entry.updatedAt < sources[key].maxAgeMs) {
    return Promise.resolve(entry.data);
  }

  const request = sources[key].load().then(
    (data) => {
      inflight.delete(key);
      setEntry(key, { data, updatedAt: Date.now() });
      return data;
    },
    (error: unknown) => {
      inflight.delete(key);
      const prev = entries.get(key);
      setEntry(key, { data: prev?.data, error, updatedAt: prev?.updatedAt ?? 0 });
      throw error;
    }
  );
  inflight.set(key, request);
  return request;
}

export function prefetchQuakes(key: QuakeKey) {
  loadQuakes(key).catch(() => {});
}

/** Cached entry for `key` (undefined until first load); revalidates on mount if stale. */
export function useQuakes(key: QuakeKey): QuakeEntry | undefined {
  const entry = useSyncExternalStore(
    subscribe,
    () => entries.get(key),
    () => undefined
  );

  useEffect(() => {
    prefetchQuakes(key);
  }, [key]);

  return entry;
}

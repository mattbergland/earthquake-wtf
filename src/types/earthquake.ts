export interface EarthquakeFeature {
  type: "Feature";
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tz: number | null;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number | null;
    dmin: number | null;
    rms: number;
    gap: number | null;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number, number];
  };
  id: string;
}

export interface EarthquakeResponse {
  type: "FeatureCollection";
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: EarthquakeFeature[];
}

export type EarthquakeState = "yes" | "maybe" | "no" | "error";

export interface EarthquakeStatus {
  state: EarthquakeState;
  earthquake: EarthquakeFeature | null;
  recentQuakes: EarthquakeFeature[];
  lastUpdated: Date;
}

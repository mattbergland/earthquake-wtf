"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type EarthquakeState = "yes" | "no" | "maybe" | "error" | null;

interface EarthquakeContextType {
  state: EarthquakeState;
  setState: (state: EarthquakeState) => void;
}

const EarthquakeContext = createContext<EarthquakeContextType | undefined>(undefined);

export function EarthquakeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EarthquakeState>(null);

  return (
    <EarthquakeContext.Provider value={{ state, setState }}>
      {children}
    </EarthquakeContext.Provider>
  );
}

export function useEarthquakeState() {
  const context = useContext(EarthquakeContext);
  if (context === undefined) {
    throw new Error("useEarthquakeState must be used within an EarthquakeProvider");
  }
  return context;
}

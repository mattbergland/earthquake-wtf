import { EarthquakeState } from "@/types/earthquake";

export function triggerVibration(state: EarthquakeState): void {
  if (typeof window === "undefined" || !navigator.vibrate) {
    return;
  }

  switch (state) {
    case "yes":
      navigator.vibrate([200, 100, 200]);
      break;
    case "maybe":
      navigator.vibrate(150);
      break;
    default:
      break;
  }
}

export function isVibrationSupported(): boolean {
  return typeof window !== "undefined" && "vibrate" in navigator;
}
